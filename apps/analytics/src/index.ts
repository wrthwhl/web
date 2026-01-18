import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { html, raw } from 'hono/html';
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

// Auth pages
const pageLayout = (title: string, content: string) => html`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title} - wrthwhl analytics</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
          background: #0a0a0a;
          color: #fafafa;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 1rem;
        }
        .container {
          max-width: 400px;
          width: 100%;
        }
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        p {
          color: #888;
          margin-bottom: 2rem;
        }
        button {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #fafafa;
          color: #0a0a0a;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          display: none;
        }
        .status.error {
          display: block;
          background: #3b1219;
          color: #fca5a5;
        }
        .status.success {
          display: block;
          background: #14532d;
          color: #86efac;
        }
        .link {
          margin-top: 1.5rem;
          text-align: center;
        }
        .link a {
          color: #888;
          text-decoration: none;
        }
        .link a:hover {
          color: #fafafa;
        }
      </style>
    </head>
    <body>
      <div class="container">${raw(content)}</div>
    </body>
  </html>
`;

// Helper functions for WebAuthn (shared between pages)
const webauthnHelpers = `
  // Base64URL encode/decode helpers
  function base64URLToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  
  function bufferToBase64URL(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
  }
`;

app.get('/register', (c) => {
  return c.html(
    pageLayout(
      'Register',
      `
    <h1>Register Passkey</h1>
    <p>Create a passkey to access the analytics dashboard.</p>
    <button id="registerBtn">Register with Passkey</button>
    <div id="status" class="status"></div>
    <div class="link"><a href="/login">Already registered? Login</a></div>
    <script>
      ${webauthnHelpers}
      
      const btn = document.getElementById('registerBtn');
      const status = document.getElementById('status');
      
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Registering...';
        status.className = 'status';
        
        try {
          // Get registration options
          const optRes = await fetch('/api/auth/register/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
            credentials: 'include'
          });
          
          if (!optRes.ok) {
            const err = await optRes.json();
            throw new Error(err.error || 'Failed to get registration options');
          }
          
          const { options, userId } = await optRes.json();
          
          // Convert options for native WebAuthn API
          const publicKeyOptions = {
            challenge: base64URLToBuffer(options.challenge),
            rp: options.rp,
            user: {
              ...options.user,
              id: base64URLToBuffer(options.user.id)
            },
            pubKeyCredParams: options.pubKeyCredParams,
            timeout: options.timeout,
            attestation: options.attestation || 'none',
            authenticatorSelection: options.authenticatorSelection
          };
          
          if (options.excludeCredentials) {
            publicKeyOptions.excludeCredentials = options.excludeCredentials.map(c => ({
              ...c,
              id: base64URLToBuffer(c.id)
            }));
          }
          
          // Call native WebAuthn API
          const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
          
          // Convert response for server
          const response = {
            id: credential.id,
            rawId: bufferToBase64URL(credential.rawId),
            type: credential.type,
            response: {
              clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
              attestationObject: bufferToBase64URL(credential.response.attestationObject)
            }
          };
          
          if (credential.response.getTransports) {
            response.response.transports = credential.response.getTransports();
          }
          
          // Verify with server
          const verifyRes = await fetch('/api/auth/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, response }),
            credentials: 'include'
          });
          
          if (!verifyRes.ok) {
            const err = await verifyRes.json();
            throw new Error(err.error || 'Registration failed');
          }
          
          status.textContent = 'Registration successful! Redirecting...';
          status.className = 'status success';
          setTimeout(() => window.location.href = '/', 1000);
        } catch (err) {
          status.textContent = err.message;
          status.className = 'status error';
          btn.disabled = false;
          btn.textContent = 'Register with Passkey';
        }
      });
    </script>
  `,
    ),
  );
});

app.get('/login', (c) => {
  return c.html(
    pageLayout(
      'Login',
      `
    <h1>Login</h1>
    <p>Use your passkey to access the analytics dashboard.</p>
    <button id="loginBtn">Login with Passkey</button>
    <div id="status" class="status"></div>
    <div class="link"><a href="/register">Need to register?</a></div>
    <script>
      ${webauthnHelpers}
      
      const btn = document.getElementById('loginBtn');
      const status = document.getElementById('status');
      
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Authenticating...';
        status.className = 'status';
        
        try {
          // Get login options
          const optRes = await fetch('/api/auth/login/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          
          if (!optRes.ok) {
            const err = await optRes.json();
            throw new Error(err.error || 'Failed to get login options');
          }
          
          const { options, challengeId } = await optRes.json();
          
          // Convert options for native WebAuthn API
          const publicKeyOptions = {
            challenge: base64URLToBuffer(options.challenge),
            rpId: options.rpId,
            timeout: options.timeout,
            userVerification: options.userVerification
          };
          
          if (options.allowCredentials) {
            publicKeyOptions.allowCredentials = options.allowCredentials.map(c => ({
              ...c,
              id: base64URLToBuffer(c.id)
            }));
          }
          
          // Call native WebAuthn API
          const credential = await navigator.credentials.get({ publicKey: publicKeyOptions });
          
          // Convert response for server
          const response = {
            id: credential.id,
            rawId: bufferToBase64URL(credential.rawId),
            type: credential.type,
            response: {
              clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
              authenticatorData: bufferToBase64URL(credential.response.authenticatorData),
              signature: bufferToBase64URL(credential.response.signature),
              userHandle: credential.response.userHandle ? bufferToBase64URL(credential.response.userHandle) : null
            }
          };
          
          // Verify with server
          const verifyRes = await fetch('/api/auth/login/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId, response }),
            credentials: 'include'
          });
          
          if (!verifyRes.ok) {
            const err = await verifyRes.json();
            throw new Error(err.error || 'Login failed');
          }
          
          status.textContent = 'Login successful! Redirecting...';
          status.className = 'status success';
          setTimeout(() => window.location.href = '/', 1000);
        } catch (err) {
          status.textContent = err.message;
          status.className = 'status error';
          btn.disabled = false;
          btn.textContent = 'Login with Passkey';
        }
      });
    </script>
  `,
    ),
  );
});

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
