import { otpKeyGenerator, emailKeyGenerator } from '../../middlewares/rateLimiter';
import type { Request } from 'express';

describe('otpKeyGenerator', () => {
  it('creates unique keys per email for the same IP', () => {
    const req1 = { ip: '192.168.1.1', body: { email: 'user1@example.com' } } as unknown as Request;
    const req2 = { ip: '192.168.1.1', body: { email: 'user2@example.com' } } as unknown as Request;

    const key1 = otpKeyGenerator(req1);
    const key2 = otpKeyGenerator(req2);

    expect(key1).toBe('192.168.1.1:user1@example.com');
    expect(key2).toBe('192.168.1.1:user2@example.com');
    expect(key1).not.toBe(key2);
  });

  it('creates same key for same IP and same email', () => {
    const req1 = { ip: '192.168.1.1', body: { email: 'user@example.com' } } as unknown as Request;
    const req2 = { ip: '192.168.1.1', body: { email: 'user@example.com' } } as unknown as Request;

    const key1 = otpKeyGenerator(req1);
    const key2 = otpKeyGenerator(req2);

    expect(key1).toBe(key2);
  });

  it('falls back to IP only when email is missing', () => {
    const req = { ip: '192.168.1.1', body: {} } as unknown as Request;
    expect(otpKeyGenerator(req)).toBe('192.168.1.1');
  });
});

describe('emailKeyGenerator', () => {
  it('creates unique keys per email for the same IP', () => {
    const req1 = { ip: '192.168.1.1', body: { email: 'user1@example.com' } } as unknown as Request;
    const req2 = { ip: '192.168.1.1', body: { email: 'user2@example.com' } } as unknown as Request;

    const key1 = emailKeyGenerator(req1);
    const key2 = emailKeyGenerator(req2);

    expect(key1).toBe('192.168.1.1:user1@example.com');
    expect(key2).toBe('192.168.1.1:user2@example.com');
    expect(key1).not.toBe(key2);
  });

  it('creates same key for same IP and same email', () => {
    const req1 = { ip: '192.168.1.1', body: { email: 'user@example.com' } } as unknown as Request;
    const req2 = { ip: '192.168.1.1', body: { email: 'user@example.com' } } as unknown as Request;

    const key1 = emailKeyGenerator(req1);
    const key2 = emailKeyGenerator(req2);

    expect(key1).toBe(key2);
  });

  it('falls back to IP only when email is missing', () => {
    const req = { ip: '192.168.1.1', body: {} } as unknown as Request;
    expect(emailKeyGenerator(req)).toBe('192.168.1.1');
  });
});
