import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './auth';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS for cross-origin requests from resume site and analytics dashboard
app.use(
  '/api/*',
  cors({
    origin: [
      'https://marco.wrthwhl.cloud',
      'https://analytics.wrthwhl.cloud',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  }),
);

// Mount auth routes
app.route('/api/auth', auth);

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'wrthwhl-analytics' }));

// Track pageview or event
app.post('/api/track', async (c) => {
  try {
    const body = await c.req.json();
    const { type } = body;

    // Get country from Cloudflare headers
    const country = c.req.header('cf-ipcountry') || null;

    if (type === 'pageview') {
      const {
        sessionId,
        path,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType,
        browser,
      } = body;

      await c.env.DB.prepare(
        `INSERT INTO pageviews 
         (session_id, path, referrer, utm_source, utm_medium, utm_campaign, device_type, browser, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          sessionId || null,
          path || '/',
          referrer || null,
          utmSource || null,
          utmMedium || null,
          utmCampaign || null,
          deviceType || null,
          browser || null,
          country,
        )
        .run();
    } else if (type === 'event') {
      const { sessionId, eventType, eventData } = body;

      if (!eventType) {
        return c.json({ error: 'eventType is required' }, 400);
      }

      await c.env.DB.prepare(
        `INSERT INTO events (session_id, event_type, event_data) VALUES (?, ?, ?)`,
      )
        .bind(
          sessionId || null,
          eventType,
          eventData ? JSON.stringify(eventData) : null,
        )
        .run();
    } else {
      return c.json({ error: 'Invalid type' }, 400);
    }

    return c.json({ ok: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
