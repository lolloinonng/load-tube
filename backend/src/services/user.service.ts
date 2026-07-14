import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createInitialAdmin(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return;
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed, role: 'admin' },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function verifyPassword(inputPassword: string, hashedPassword: string) {
  return bcrypt.compare(inputPassword, hashedPassword);
}

export async function getAllUsers() {
  return prisma.user.findMany({ select: { id: true, username: true, role: true, createdAt: true } });
}

export async function createUser(username: string, password: string, role: string = 'user') {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error('Username already exists');
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { username, password: hashed, role },
    select: { id: true, username: true, role: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}
