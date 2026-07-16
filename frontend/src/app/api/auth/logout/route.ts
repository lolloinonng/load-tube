import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('site_token', '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
  res.cookies.set('site_email', '', { httpOnly: false, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
  res.cookies.set('site_role', '', { httpOnly: false, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
  return res;
}
