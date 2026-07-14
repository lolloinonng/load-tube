import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

export async function verifyGoogleToken(token: string, clientId: string) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: token, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error('Invalid Google token');
  return { email: payload.email, googleId: payload.sub, name: payload.name };
}

export async function ensureUserExists(email: string, googleId: string, role: string = 'user') {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.googleId) {
      return prisma.user.update({ where: { email }, data: { googleId } });
    }
    return existing;
  }
  return prisma.user.create({ data: { email, googleId, role } });
}

export async function getAllUsers() {
  return prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
}

export async function createUser(email: string, role: string = 'user') {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already exists');
  return prisma.user.create({
    data: { email, role },
    select: { id: true, email: true, role: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}

export async function ensureInitialAdmin(email: string) {
  if (!email) return;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'admin') {
      await prisma.user.update({ where: { email }, data: { role: 'admin' } });
    }
  } else {
    await prisma.user.create({ data: { email, role: 'admin' } });
  }
}
