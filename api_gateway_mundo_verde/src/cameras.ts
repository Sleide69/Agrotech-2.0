import { Router, Request, Response, NextFunction } from 'express';
import { Pool, PoolClient } from 'pg';
import { verifyJWT } from './auth';
import fetch from 'cross-fetch';

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
  // Usar set_config para evitar error de sintaxis al parametrizar SET LOCAL
  await c.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch {}
    throw e;
  } finally { c.release(); }
}

// Servicio de cámaras (DB + snapshot proxy)
const cameraService = {
  async list(req: Request) {
    const tid = getTenantId(req);
    return withClient(req, async (c) => {
      const rs = await c.query('select id, nombre, descripcion, tenant_id, snapshot_url, stream_url, created_at, updated_at from core.camaras where tenant_id=$1 and deleted_at is null order by created_at desc', [tid]);
      return rs.rows as any[];
    });
  },
  async create(req: Request, payload: { nombre: string, descripcion?: string, snapshot_url?: string, stream_url?:string }) {
    const tid = getTenantId(req);
    return withClient(req, async (c) => {
      const rs = await c.query('insert into core.camaras (tenant_id, nombre, descripcion, snapshot_url, stream_url) values ($1,$2,$3,$4,$5) returning id', [tid, payload.nombre, payload.descripcion || null, payload.snapshot_url || null, payload.stream_url || null]);
      return rs.rows[0].id as string;
    });
  },
  async update(req: Request, id: string, payload: { nombre?: string, descripcion?: string, snapshot_url?: string, stream_url?:string }) {
    const tid = getTenantId(req);
    return withClient(req, async (c) => {
      const rs = await c.query('update core.camaras set nombre=coalesce($1,nombre), descripcion=coalesce($2,descripcion), snapshot_url=coalesce($3,snapshot_url), stream_url=coalesce($4,stream_url), updated_at=now() where id=$5 and tenant_id=$6 and deleted_at is null returning id', [payload.nombre ?? null, payload.descripcion ?? null, payload.snapshot_url ?? null, payload.stream_url ?? null, id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as string;
    });
  },
  async remove(req: Request, id: string) {
    const tid = getTenantId(req);
    return withClient(req, async (c) => {
      const rs = await c.query('update core.camaras set deleted_at=now(), updated_at=now() where id=$1 and tenant_id=$2 and deleted_at is null', [id, tid]);
      return !!rs.rowCount;
    });
  },
  async getSnapshot(req: Request, id: string) {
    // Obtiene la URL de snapshot de la cámara restringida por RLS
    const row = await withClient(req, async (c) => {
      const rs = await c.query('select snapshot_url from core.camaras where id=$1 and deleted_at is null', [id]);
      return rs.rows[0] as { snapshot_url: string | null } | undefined;
    });
  if (!row?.snapshot_url) return { status: 404, body: 'No snapshot_url' };
    // Proxy simple de imagen (content-type basado en respuesta origen)
    const r = await fetch(row.snapshot_url);
  if (!r.ok) return { status: 502, body: `Upstream ${r.status}` };
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get('content-type') || 'image/jpeg';
  return { status: 200, body: buf, contentType: ct };
  },
  async getStream(req: Request, id: string) {
    // Obtiene stream_url y hace proxy, reescribiendo playlists para evitar CORS
    const row = await withClient(req, async (c) => {
      const rs = await c.query('select stream_url from core.camaras where id=$1 and deleted_at is null', [id]);
      return rs.rows[0] as { stream_url: string | null } | undefined;
    });
  if (!row?.stream_url) return { status: 404, body: 'No stream_url' };

    const target = (req.query.target as string) || null;
    const rel = (req.query.rel as string) || null;
    let url = row.stream_url;
    if (target) url = target;
    else if (rel) url = new URL(rel, row.stream_url).toString();

    const headers: any = {};
    const range = req.headers['range'];
    if (range) headers['range'] = range as string;

    const upstream = await fetch(url, { headers });
  if (!upstream.ok) return { status: upstream.status, body: `Upstream ${upstream.status}` };

    const ct = upstream.headers.get('content-type') || '';
    // Si es un playlist HLS, reescribir URIs a nuestro proxy
    if (ct.includes('application/vnd.apple.mpegurl') || ct.includes('application/x-mpegURL') || url.endsWith('.m3u8')) {
      const text = await upstream.text();
      const baseProxy = `${req.baseUrl || ''}/camaras/${id}/stream`;
      const rewritten = text.split('\n').map((line) => {
        const l = line.trim();
        if (!l || l.startsWith('#')) return line; // comentarios/directivas
        try {
          const isAbs = /^https?:\/\//i.test(l);
          if (isAbs) return `${baseProxy}?target=${encodeURIComponent(l)}`;
          return `${baseProxy}?rel=${encodeURIComponent(l)}`;
        } catch { return line; }
      }).join('\n');
  return { status: 200, body: Buffer.from(rewritten, 'utf8'), contentType: ct };
    }

    // Para segmentos u otros recursos binarios, hacer pass-through
    const buf = Buffer.from(await upstream.arrayBuffer());
  return { status: 200, body: buf, contentType: ct };
  }
}

// Controlador/Router
export function buildCamerasRouter() {
  const r = Router();
  r.use(verifyJWT);
  // No aplicamos requireDB global para permitir que ensureRole responda 403 antes de acceder a DB

  // Listar
  r.get('/camaras', requireDB, async (req: Request, res: Response) => {
    const rows = await cameraService.list(req);
    res.json(rows);
  });

  // Crear (admin)
  r.post('/camaras', ensureRole(['admin']), requireDB, async (req: Request, res: Response) => {
    const id = await cameraService.create(req, req.body || {});
    res.status(201).json({ id });
  });

  // Editar (admin)
  r.put('/camaras/:id', ensureRole(['admin']), requireDB, async (req: Request, res: Response) => {
    const id = await cameraService.update(req, req.params.id, req.body || {});
    res.json({ id });
  });

  // Eliminar (admin)
  r.delete('/camaras/:id', ensureRole(['admin']), requireDB, async (req: Request, res: Response) => {
    const ok = await cameraService.remove(req, req.params.id);
    res.status(ok ? 204 : 404).end();
  });

  // Snapshot (admin y tecnico)
  r.get('/camaras/:id/snapshot', ensureRole(['admin','tecnico']), requireDB, async (req: Request, res: Response) => {
    const out = await cameraService.getSnapshot(req, req.params.id);
    if (out.status !== 200) return res.status(out.status).send(out.body);
    res.setHeader('content-type', out.contentType!);
    res.send(out.body);
  });

  // Stream (admin y tecnico)
  r.get('/camaras/:id/stream', ensureRole(['admin','tecnico']), requireDB, async (req: Request, res: Response) => {
    const out = await cameraService.getStream(req, req.params.id);
    if (out.status !== 200) return res.status(out.status).send(out.body);
    if (out.contentType) res.setHeader('content-type', out.contentType);
    res.send(out.body);
  });

  return r;
}
