import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getRemoteJwks() {
  const url = process.env.SUPABASE_JWKS_URL;
  if (!url) return null;
  if (!jwks) jwks = createRemoteJWKSet(new URL(url));
  return jwks;
}

export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token requerido' });
  const token = auth.substring('Bearer '.length);
  const jwks = getRemoteJwks();
  if (!jwks) return res.status(500).json({ error: 'SUPABASE_JWKS_URL no configurado' });
  const { payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] });

    // Adjuntar claims al request
    (req as any).user = payload as JWTPayload;

    // Correlation-ID: generar si falta
    const cid = req.header('x-correlation-id') || cryptoRandomId();
    res.setHeader('x-correlation-id', cid);
    (req as any).correlationId = cid;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Token inválido', detail: err?.message });
  }
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
