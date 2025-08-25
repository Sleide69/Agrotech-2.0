import { Router, Request, Response, NextFunction } from 'express';
import { Pool, PoolClient } from 'pg';
import { wsManager } from './websocket';
import { verifyJWT } from './auth';

const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_URL;
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

function requireDB(_req: Request, res: Response, next: NextFunction) {
  if (!pool) return res.status(501).json({ error: 'DB no configurada en API Gateway (DATABASE_URL)' });
  next();
}

function getTenantId(req: Request): string | null { return (req as any).user?.tenant_id || null; }
function getUserRole(req: Request): string | null {
  const u: any = (req as any).user || {}
  return u.rol || u.role || u['app_metadata']?.role || null
}
function ensureRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = getUserRole(req)
    if (!r || !roles.includes(r)) return res.status(403).json({ error: 'Forbidden: role required', required: roles })
    next()
  }
}

async function withClient<T>(req: Request, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  if (!pool) throw new Error('pool not configured');
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const claims = JSON.stringify((req as any).user || {});
  await c.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch {}
    throw e;
  } finally { c.release(); }
}

export function buildIotRouter() {
  const r = Router();
  r.use(verifyJWT, requireDB);
  // Sync de usuario Supabase -> core.usuarios y asegurar tenant en claims
  r.use(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user: any = (req as any).user || {};
  const email: string | undefined = user.email || user?.user_metadata?.email;
  const nombre: string = user?.user_metadata?.name || user?.user_metadata?.nombre || (email ? email.split('@')[0] : 'usuario');
  const rol: string = user?.app_metadata?.role || user.role || 'agricultor';
  // Determinar tenant_id: si viene en claims úsalo; también intenta app_metadata/user_metadata
  let tenant_id: string | undefined = (user.tenant_id || user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id) as string | undefined;
      await withClient(req, async (c) => {
        if (!tenant_id && email) {
          const t = await c.query('select tenant_id from core.usuarios where email=$1 and deleted_at is null limit 1', [email]);
          tenant_id = t.rows[0]?.tenant_id;
        }
        if (!tenant_id) {
          const t = await c.query('select gen_random_uuid() as id');
          tenant_id = t.rows[0].id;
        }
        // Upsert usuario sólo si hay email disponible
        if (email) {
          await c.query(
            'insert into core.usuarios (tenant_id, email, nombre, rol, hash_password) values ($1,$2,$3,$4,\'\') on conflict (email) do update set nombre=excluded.nombre, rol=excluded.rol',
            [tenant_id, email, nombre, rol]
          );
        }
      });
  // inyectar tenant_id/rol/email normalizados al claim en memoria para el resto del request
  (req as any).user = Object.assign({}, (req as any).user || {}, { tenant_id, rol, email });
      next();
    } catch (_e) { next(); }
  });

  // Usuarios
  r.get('/usuarios', async (req: Request, res: Response) => {
    const tid = getTenantId(req); const { limit = '50', offset = '0' } = req.query as any;
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, email, nombre, rol, created_at from core.usuarios where tenant_id=$1 and deleted_at is null order by created_at desc limit $2 offset $3', [tid, +limit, +offset]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/usuarios', ensureRole(['admin']), async (req: Request, res: Response) => {
    const tid = getTenantId(req); const { email, nombre, hash_password, rol } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.usuarios (tenant_id, email, nombre, hash_password, rol) values ($1,$2,$3,$4,coalesce($5,\'agricultor\')) returning id', [tid, email, nombre, hash_password, rol]);
      return rs.rows[0].id as number;
    });
    res.status(201).json({ id });
  });
  r.patch('/usuarios/:id', ensureRole(['admin']), async (req: Request, res: Response) => {
    const tid = getTenantId(req); const { email, nombre, hash_password, rol } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('update core.usuarios set email=coalesce($1,email), nombre=coalesce($2,nombre), hash_password=coalesce($3,hash_password), rol=coalesce($4,rol) where id=$5 and tenant_id=$6 and deleted_at is null returning id', [email, nombre, hash_password, rol, req.params.id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as number;
    });
    res.json({ id });
  });
  r.delete('/usuarios/:id', ensureRole(['admin']), async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query('update core.usuarios set deleted_at = now() where id=$1 and tenant_id=$2 and deleted_at is null', [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 204 : 404).end();
  });

  // Cultivos
  r.get('/cultivos', async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, nombre, descripcion, created_at from core.cultivos where tenant_id=$1 and deleted_at is null order by created_at desc', [tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/cultivos', ensureRole(['admin','tecnico']), async (req: Request, res: Response) => {
    const tid = getTenantId(req); const { nombre, descripcion } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.cultivos (tenant_id, nombre, descripcion) values ($1,$2,$3) returning id',[tid,nombre,descripcion]);
      return rs.rows[0].id as number;
    });
    res.status(201).json({ id });
  });
  r.patch('/cultivos/:id', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { nombre, descripcion }=req.body;
    const id = await withClient(req, async c => {
      const rs = await c.query('update core.cultivos set nombre=coalesce($1,nombre), descripcion=coalesce($2,descripcion) where id=$3 and tenant_id=$4 and deleted_at is null returning id',[nombre,descripcion,req.params.id,tid]);
      if(!rs.rowCount) throw Object.assign(new Error('not found'),{code:404});
      return rs.rows[0].id;
    });
    res.json({ id });
  });
  r.delete('/cultivos/:id', ensureRole(['admin']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query('update core.cultivos set deleted_at=now() where id=$1 and tenant_id=$2 and deleted_at is null',[req.params.id,tid]);
      return !!rs.rowCount;
    });
    res.status(ok?204:404).end();
  });

  // Sensores
  r.get('/sensores', async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, cultivo_id, nombre, tipo, modelo, activo, created_at from core.sensores where tenant_id=$1 and deleted_at is null order by created_at desc', [tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/sensores', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { cultivo_id, nombre, tipo, modelo, zona_id }=req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.sensores (tenant_id, cultivo_id, zona_id, nombre, tipo, modelo, activo) values ($1,$2,$3,$4,$5,$6,true) returning id',[tid,cultivo_id,zona_id||null,nombre,tipo,modelo]);
      return rs.rows[0].id as number;
    });
    res.status(201).json({ id });
  });
  r.patch('/sensores/:id', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { nombre, tipo, modelo, activo }=req.body;
    const id = await withClient(req, async c => {
      const rs = await c.query('update core.sensores set nombre=coalesce($1,nombre), tipo=coalesce($2,tipo), modelo=coalesce($3,modelo), activo=coalesce($4,activo) where id=$5 and tenant_id=$6 and deleted_at is null returning id',[nombre,tipo,modelo,activo,req.params.id,tid]);
      if(!rs.rowCount) throw Object.assign(new Error('not found'),{code:404});
      return rs.rows[0].id;
    });
    res.json({ id });
  });

  // Eliminar sensor (admin)
  r.delete('/sensores/:id', ensureRole(['admin']), async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query('update core.sensores set deleted_at = now() where id=$1 and tenant_id=$2 and deleted_at is null', [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 204 : 404).end();
  });

  // Lecturas globales
  r.get('/lecturas', async (req: Request, res: Response) => {
    const { sensor_id, limit = '100' } = req.query as any;
    const rows = await withClient(req, async (c) => {
      if (sensor_id) {
        const rs = await c.query('select id, sensor_id, value as valor, metric as unidad, ts as timestamp from telemetry.lecturas where sensor_id=$1 order by ts desc limit $2', [Number(sensor_id), +limit]);
        return rs.rows as any[];
      }
      const rs = await c.query('select id, sensor_id, value as valor, metric as unidad, ts as timestamp from telemetry.lecturas order by ts desc limit $1', [+limit]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/lecturas', ensureRole(['admin','tecnico']), async (req: Request, res: Response) => {
    const { sensor_id, valor, unidad } = req.body;
    await withClient(req, async (c) => {
      await c.query('insert into telemetry.lecturas (sensor_id, value, metric) values ($1,$2,$3)', [sensor_id, valor, unidad]);
    });
    res.status(201).json({ ok: true });
  });

  // Lecturas: listar últimas y simular inserción
  r.get('/sensores/:id/lecturas', async (req: Request, res: Response)=>{
    const sensorId = Number(req.params.id);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, valor, unidad, fecha_hora from core.lecturas_sensores where sensor_id=$1 order by fecha_hora desc limit 100',[sensorId]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/sensores/:id/lecturas/simular', async (req: Request, res: Response)=>{
    const sensorId = Number(req.params.id); const { valor, unidad, metric } = req.body;
    await withClient(req, async c => {
      await c.query('insert into telemetry.lecturas (sensor_id, value, metric, metadata) values ($1,$2,$3,$4)',[sensorId, valor, metric||unidad, { unit: unidad }]);
    });
    // Broadcast en tiempo real via WebSocket
    wsManager.broadcast({
      type: 'request',
      id: 'sensor_' + Date.now(),
      data: { event: 'sensor-reading', sensorId, valor, unidad, metric: metric || unidad, ts: new Date().toISOString() }
    } as any);
    res.status(201).json({ ok: true });
  });

  // Plagas
  r.get('/plagas', async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, nombre, descripcion, nivel_peligro from core.plagas where tenant_id=$1 and deleted_at is null order by nombre',[tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/plagas', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { nombre, descripcion, nivel_peligro }=req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.plagas (tenant_id, nombre, descripcion, nivel_peligro) values ($1,$2,$3,$4) returning id',[tid,nombre,descripcion,nivel_peligro]);
      return rs.rows[0].id as number;
    });
    res.status(201).json({ id });
  });

  // Detecciones
  r.get('/detecciones', async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, cultivo_id, plaga_id, fecha_detectada, severidad, confirmado_por from core.detecciones_plaga where tenant_id=$1 order by fecha_detectada desc',[tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/detecciones', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { cultivo_id, plaga_id, severidad, confirmado_por }=req.body;
    const out = await withClient(req, async c => {
      const rs = await c.query('insert into core.detecciones_plaga (tenant_id, cultivo_id, plaga_id, severidad, confirmado_por) values ($1,$2,$3,$4,$5) returning id',[tid,cultivo_id,plaga_id,severidad,confirmado_por]);
      const id = rs.rows[0].id;
      await c.query('insert into core.notificaciones (tenant_id, user_id, mensaje, tipo) values ($1, null, $2, $3)', [tid, 'Nueva detección de plaga registrada', 'plaga']);
      return id;
    });
    res.status(201).json({ id: out });
  });

  // Acciones correctivas
  r.post('/acciones', ensureRole(['admin','tecnico']), async (req: Request, res: Response)=>{
    const tid=getTenantId(req); const { deteccion_id, descripcion, responsable }=req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.acciones_correctivas (tenant_id, deteccion_id, descripcion, responsable) values ($1,$2,$3,$4) returning id',[tid,deteccion_id,descripcion,responsable]);
      return rs.rows[0].id as number;
    });
    res.status(201).json({ id });
  });
  r.get('/acciones', async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, deteccion_id, descripcion, responsable, fecha_accion from core.acciones_correctivas where tenant_id=$1 and deleted_at is null order by fecha_accion desc',[tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });

  // Notificaciones
  r.get('/notificaciones', async (req: Request, res: Response)=>{
    const tid=getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, user_id, mensaje, tipo, leida, fecha_envio from core.notificaciones where tenant_id=$1 and deleted_at is null order by fecha_envio desc',[tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });

  r.post('/notificaciones/:id/leer', async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query('update core.notificaciones set leida = true where id=$1 and tenant_id=$2 and deleted_at is null', [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 200 : 404).json({ ok });
  });

  // Alertas CRUD
  r.get('/alertas', async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const rows = await withClient(req, async (c) => {
      const rs = await c.query('select id, cultivo_id, sensor_id, tipo_alerta, descripcion, nivel, fecha from core.alertas where tenant_id=$1 and deleted_at is null order by fecha desc', [tid]);
      return rs.rows as any[];
    });
    res.json(rows);
  });
  r.post('/alertas', async (req: Request, res: Response) => {
    const tid = getTenantId(req); const { cultivo_id, sensor_id, tipo_alerta, descripcion, nivel } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query('insert into core.alertas (tenant_id, cultivo_id, sensor_id, tipo_alerta, descripcion, nivel) values ($1,$2,$3,$4,$5,$6) returning id', [tid, cultivo_id, sensor_id||null, tipo_alerta, descripcion||null, nivel]);
      const alertaId = rs.rows[0].id;
      // crear notificación asociada
      await c.query('insert into core.notificaciones (tenant_id, user_id, alerta_id, mensaje, tipo) values ($1, null, $2, $3, $4)', [tid, alertaId, 'Nueva alerta generada', 'alerta']);
      return alertaId;
    });
    res.status(201).json({ id });
  });
  r.delete('/alertas/:id', async (req: Request, res: Response) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query('update core.alertas set deleted_at=now() where id=$1 and tenant_id=$2 and deleted_at is null', [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok?204:404).end();
  });

  return r;
}
