import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import app from './index';

describe('Analytics API', () => {
  describe('GET /', () => {
    it('returns health check', async () => {
      const req = new Request('http://localhost/');
      const ctx = createExecutionContext();
      const res = await app.fetch(req, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ status: 'ok', service: 'wrthwhl-analytics' });
    });
  });

  describe('POST /api/track', () => {
    it('returns 400 for invalid type', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invalid' }),
      });
      const ctx = createExecutionContext();
      const res = await app.fetch(req, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid type' });
    });

    it('returns 400 for event without eventType', async () => {
      const req = new Request('http://localhost/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'event' }),
      });
      const ctx = createExecutionContext();
      const res = await app.fetch(req, env, ctx);
      await waitOnExecutionContext(ctx);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'eventType is required' });
    });
  });
});
