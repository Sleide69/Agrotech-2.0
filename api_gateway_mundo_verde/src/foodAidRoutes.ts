import { Router, Request, Response, NextFunction } from 'express';
import { Pool, PoolClient } from 'pg';
import { verifyJWT } from './auth';

// Pool Postgres (opcional). Si no hay DATABASE_URL, deshabilita rutas.
const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_URL;
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

function requireDB(req: Request, res: Response, next: NextFunction) {
  if (!pool) return res.status(501).json({ error: 'DB no configurada en API Gateway (DATABASE_URL)' });
  next();
}

// Extrae tenant_id del JWT si existe
function getTenantId(req: Request): string | null {
  const user: any = (req as any).user;
  return user?.tenant_id || null;
}

export function buildFoodAidRouter() {
  const r = Router();

  // Todas las rutas requieren JWT para propagar tenant_id
  r.use(verifyJWT, requireDB);

  // Helpers comunes
  const withClient = async <T>(req: Request, fn: (c: PoolClient) => Promise<T>): Promise<T> => {
    if (!pool) throw new Error('pool not configured');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const claims = JSON.stringify((req as any).user || {});
      await client.query(`SET LOCAL request.jwt.claims = $1`, [claims]);
      const out = await fn(client);
      await client.query('COMMIT');
      return out;
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch {}
      throw e;
    } finally {
      client.release();
    }
  };

  // USERS
  r.get('/users', async (req, res) => {
    const tid = getTenantId(req);
    const { limit = '50', offset = '0' } = req.query as any;
    const rows = await withClient(req, async (c) => {
      const rs = await c.query(`select id, role_id, name, email, created_at, updated_at from food_aid.users where tenant_id = $1 and deleted_at is null order by created_at desc limit $2 offset $3`, [tid, +limit, +offset]);
      return rs.rows;
    });
    res.json(rows);
  });
  r.post('/users', async (req, res) => {
    const tid = getTenantId(req);
    const { role_id, name, email, password } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`insert into food_aid.users (role_id, name, email, password, tenant_id) values ($1,$2,$3,$4,$5) returning id`, [role_id, name, email, password, tid]);
      return rs.rows[0].id as string;
    });
    res.status(201).json({ id });
  });
  r.patch('/users/:id', async (req, res) => {
    const tid = getTenantId(req);
    const { name, email, password, role_id } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.users set name = coalesce($1,name), email = coalesce($2,email), password = coalesce($3,password), role_id = coalesce($4, role_id) where id = $5 and tenant_id = $6 and deleted_at is null returning id`, [name, email, password, role_id, req.params.id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as string;
    });
    res.json({ id });
  });
  r.delete('/users/:id', async (req, res) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.users set deleted_at = now() where id = $1 and tenant_id = $2 and deleted_at is null`, [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 204 : 404).end();
  });

  // FOODS
  r.get('/foods', async (req, res) => {
    const tid = getTenantId(req);
    const { q: search, category } = req.query as any;
    const filters: string[] = [`tenant_id = $1`, `deleted_at is null`];
    const params: any[] = [tid];
    if (search) { params.push(`%${search}%`); filters.push(`(name ilike $${params.length})`); }
    if (category) { params.push(category); filters.push(`category = $${params.length}`); }
    const sql = `select id, name, category, expiration_date, created_at from food_aid.foods where ${filters.join(' and ')} order by created_at desc limit 100`;
    const rows = await withClient(req, async (c) => (await c.query(sql, params)).rows);
    res.json(rows);
  });
  r.post('/foods', async (req, res) => {
    const tid = getTenantId(req);
    const { name, category, expiration_date } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`insert into food_aid.foods (name, category, expiration_date, tenant_id) values ($1,$2,$3,$4) returning id`, [name, category, expiration_date, tid]);
      return rs.rows[0].id as string;
    });
    res.status(201).json({ id });
  });
  r.patch('/foods/:id', async (req, res) => {
    const tid = getTenantId(req);
    const { name, category, expiration_date } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.foods set name = coalesce($1,name), category = coalesce($2,category), expiration_date = coalesce($3,expiration_date) where id = $4 and tenant_id = $5 and deleted_at is null returning id`, [name, category, expiration_date, req.params.id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as string;
    });
    res.json({ id });
  });
  r.delete('/foods/:id', async (req, res) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.foods set deleted_at = now() where id = $1 and tenant_id = $2 and deleted_at is null`, [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 204 : 404).end();
  });

  // DONATIONS (hook → inventory IN)
  r.get('/donations', async (req, res) => {
    const tid = getTenantId(req);
    const { status } = req.query as any;
    const filters = [`tenant_id = $1`, `deleted_at is null`];
    const params: any[] = [tid];
    if (status) { params.push(status); filters.push(`status = $${params.length}`); }
    const rows = await withClient(req, async (c) => (await c.query(`select id, donor_id, food_id, quantity, status, donated_at from food_aid.donations where ${filters.join(' and ')} order by donated_at desc`, params)).rows);
    res.json(rows);
  });
  r.post('/donations', async (req, res) => {
    const tid = getTenantId(req);
    const { donor_id, food_id, quantity, status } = req.body;
    const donationId = await withClient(req, async (c) => {
      const rs = await c.query(`insert into food_aid.donations (donor_id, food_id, quantity, status, tenant_id) values ($1,$2,$3,coalesce($4,'pending'),$5) returning id`, [donor_id, food_id, quantity, status, tid]);
      const id = rs.rows[0].id as string;
      await c.query(`insert into food_aid.inventory_movements (food_id, movement_type, quantity, donation_id, tenant_id) values ($1,'IN',$2,$3,$4)`, [food_id, quantity, id, tid]);
      return id;
    });
    res.status(201).json({ id: donationId });
  });
  r.patch('/donations/:id', async (req, res) => {
    const tid = getTenantId(req);
    const { status, quantity } = req.body;
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.donations set status = coalesce($1,status), quantity = coalesce($2, quantity) where id = $3 and tenant_id = $4 and deleted_at is null returning id, food_id, quantity`, [status, quantity, req.params.id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as string;
    });
    res.json({ id });
  });
  r.delete('/donations/:id', async (req, res) => {
    const tid = getTenantId(req);
    const ok = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.donations set deleted_at = now() where id = $1 and tenant_id = $2 and deleted_at is null`, [req.params.id, tid]);
      return !!rs.rowCount;
    });
    res.status(ok ? 204 : 404).end();
  });

  // DISTRIBUTIONS (hook → inventory OUT + notification)
  r.get('/distributions', async (req, res) => {
    const tid = getTenantId(req);
    const { since, until } = req.query as any;
    const filters = [`tenant_id = $1`, `deleted_at is null`];
    const params: any[] = [tid];
    if (since) { params.push(since); filters.push(`distributed_at >= $${params.length}`); }
    if (until) { params.push(until); filters.push(`distributed_at <= $${params.length}`); }
    const rows = await withClient(req, async (c) => (await c.query(`select id, beneficiary_id, food_id, quantity, distributed_at from food_aid.distributions where ${filters.join(' and ')} order by distributed_at desc`, params)).rows);
    res.json(rows);
  });
  r.post('/distributions', async (req, res) => {
    const tid = getTenantId(req);
    const { beneficiary_id, food_id, quantity } = req.body;
    const distributionId = await withClient(req, async (c) => {
      const rs = await c.query(`insert into food_aid.distributions (beneficiary_id, food_id, quantity, tenant_id) values ($1,$2,$3,$4) returning id`, [beneficiary_id, food_id, quantity, tid]);
      const id = rs.rows[0].id as string;
      await c.query(`insert into food_aid.inventory_movements (food_id, movement_type, quantity, distribution_id, tenant_id) values ($1,'OUT',$2,$3,$4)`, [food_id, quantity, id, tid]);
      await c.query(`insert into food_aid.notifications (user_id, title, message, channel, status, tenant_id) values ($1,$2,$3,'in_app','queued',$4)`, [beneficiary_id, 'Distribución registrada', 'Se registró una nueva distribución de alimentos.', tid]);
      return id;
    });
    res.status(201).json({ id: distributionId });
  });

  // INVENTORY MOVEMENTS
  r.get('/inventory_movements', async (req, res) => {
    const tid = getTenantId(req);
    const { type } = req.query as any;
    const filters = [`tenant_id = $1`, `deleted_at is null`];
    const params: any[] = [tid];
    if (type) { params.push(type); filters.push(`movement_type = $${params.length}`); }
    const rows = await withClient(req, async (c) => (await c.query(`select id, food_id, movement_type, quantity, donation_id, distribution_id, created_at from food_aid.inventory_movements where ${filters.join(' and ')} order by created_at desc limit 200`, params)).rows);
    res.json(rows);
  });

  // NOTIFICATIONS
  r.get('/notifications', async (req, res) => {
    const tid = getTenantId(req);
    const { status } = req.query as any;
    const filters = [`tenant_id = $1`, `deleted_at is null`];
    const params: any[] = [tid];
    if (status) { params.push(status); filters.push(`status = $${params.length}`); }
    const rows = await withClient(req, async (c) => (await c.query(`select id, user_id, title, message, is_read, status, channel, created_at, read_at from food_aid.notifications where ${filters.join(' and ')} order by created_at desc limit 200`, params)).rows);
    res.json(rows);
  });
  r.patch('/notifications/:id/read', async (req, res) => {
    const tid = getTenantId(req);
    const id = await withClient(req, async (c) => {
      const rs = await c.query(`update food_aid.notifications set is_read = true, status = 'read', read_at = now() where id = $1 and tenant_id = $2 and deleted_at is null returning id`, [req.params.id, tid]);
      if (!rs.rowCount) throw Object.assign(new Error('not found'), { code: 404 });
      return rs.rows[0].id as string;
    });
    res.json({ id });
  });

  return r;
}
