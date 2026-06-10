import { prisma } from '../config/database';
import { logger } from './logger';

export const blacklistToken = async (token: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  const expiresAt = new Date(Date.now() + expiresInMs);
  await prisma.revokedToken.upsert({
    where: { token },
    update: { expiresAt },
    create: { token, expiresAt },
  });
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const entry = await prisma.revokedToken.findUnique({ where: { token } });
  if (!entry) return false;
  if (entry.expiresAt <= new Date()) {
    await prisma.revokedToken.delete({ where: { token } }).catch(() => {});
    return false;
  }
  return true;
};

// Purge expired entries — called periodically to keep the table lean
export const purgeExpiredTokens = async (): Promise<void> => {
  const { count } = await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  if (count > 0) {
    logger.info(`Token blacklist cleanup: removed ${count} expired entries`);
  }
};

// Run cleanup every hour
setInterval(() => { purgeExpiredTokens().catch(() => {}); }, 60 * 60 * 1000);
