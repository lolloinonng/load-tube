import { NextRequest, NextResponse } from 'next/server';
import { getClient, initDb } from '@/lib/db';
import { signToken, verifyGoogleCredential } from '@/lib/auth-api';

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) return NextResponse.json({ success: false, error: 'Credential required' }, { status: 400 });

    const { email, googleId } = await verifyGoogleCredential(credential);
    const client = getClient();
    await initDb();
    const user = await client.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    if (user.rows.length === 0) return NextResponse.json({ success: false, error: 'Accesso non autorizzato' }, { status: 403 });

    const existing = user.rows[0] as any;
    if (!existing.google_id) {
      await client.execute({ sql: 'UPDATE users SET google_id = ? WHERE email = ?', args: [googleId, email] });
    }

    const role = existing.role || 'user';
    const token = signToken({ email, role });

    const res = NextResponse.json({ success: true, data: { token, email, role } });
    res.cookies.set('site_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 86400, path: '/' });
    res.cookies.set('site_email', email, { httpOnly: false, secure: true, sameSite: 'lax', maxAge: 86400, path: '/' });
    res.cookies.set('site_role', role, { httpOnly: false, secure: true, sameSite: 'lax', maxAge: 86400, path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Google auth failed' }, { status: 401 });
  }
}
