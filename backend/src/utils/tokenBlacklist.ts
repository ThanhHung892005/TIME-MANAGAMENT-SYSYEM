// Token blacklist for logout invalidation
// Uses Map instead of Set to track expiry timestamps for memory management
import { logger } from './logger';

interface BlacklistEntry {
  expiresAt: number; // Unix timestamp when token expires
}

const blacklistedTokens = new Map<string, BlacklistEntry>();

// Clean up expired tokens every hour
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function cleanupExpiredTokens(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [token, entry] of blacklistedTokens.entries()) {
    if (entry.expiresAt <= now) {
      blacklistedTokens.delete(token);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(`Token blacklist cleanup: removed ${cleaned} expired entries, ${blacklistedTokens.size} remaining`);
  }
}

// Start periodic cleanup
setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL_MS);

export const blacklistToken = async (token: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  const expiresAt = Date.now() + expiresInMs;
  blacklistedTokens.set(token, { expiresAt });
};

export const isTokenBlacklisted = (token: string): boolean => {
  const entry = blacklistedTokens.get(token);
  if (!entry) return false;

  // Check if token has expired
  if (entry.expiresAt <= Date.now()) {
    blacklistedTokens.delete(token);
    return false;
  }

  return true;
};

export const getBlacklistSize = (): number => blacklistedTokens.size;
