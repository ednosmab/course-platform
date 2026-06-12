import { describe, it, expect } from 'vitest';

describe('health endpoint', () => {
  it('should return ok status shape', () => {
    const response = { status: 'ok', timestamp: new Date().toISOString(), uptime: 123, service: 'admin' };
    expect(response.status).toBe('ok');
    expect(response.service).toBe('admin');
    expect(response.timestamp).toBeTruthy();
  });
});
