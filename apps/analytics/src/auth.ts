import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';

type Bindings = {
  DB: D1Database;
};

type Variables = {
  credentialId?: string;
};

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// WebAuthn config
const rpName = 'wrthwhl Analytics';
const rpID = 'analytics.wrthwhl.cloud';
const origin = `https://${rpID}`;

// Session duration: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Helper to generate secure random ID
function generateId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Store challenges temporarily (in production, use KV or D1)
const challenges = new Map<string, string>();

// ============================================
// Registration Flow
// ============================================

// Step 1: Generate registration options
auth.post('/register/options', async (c) => {
  // Check if any credentials exist
  const existingCred = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM credentials',
  ).first<{ count: number }>();

  const isFirstRegistration = !existingCred || existingCred.count === 0;

  // First registration is open (first-come-first-served)
  // Subsequent registrations require active session (adding backup passkeys)
  if (!isFirstRegistration) {
    const sessionId = getCookie(c, 'session');
    if (!sessionId) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    const session = await c.env.DB.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")',
    )
      .bind(sessionId)
      .first();
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
  }

  // Generate a user ID (for first registration, create new; otherwise use existing)
  const userId = generateId();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: 'admin', // Single user system
    userDisplayName: 'Admin',
    userID: new TextEncoder().encode(userId),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  // Store challenge for verification
  challenges.set(userId, options.challenge);

  return c.json({ options, userId });
});

// Step 2: Verify registration
auth.post('/register/verify', async (c) => {
  const { userId, response } = (await c.req.json()) as {
    userId: string;
    response: RegistrationResponseJSON;
  };

  const expectedChallenge = challenges.get(userId);
  if (!expectedChallenge) {
    return c.json({ error: 'Challenge not found or expired' }, 400);
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return c.json({ error: 'Verification failed' }, 400);
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    // Store credential in database
    // credential.id is already a Base64URLString, store as-is
    await c.env.DB.prepare(
      `INSERT INTO credentials (id, public_key, counter, created_at) 
       VALUES (?, ?, ?, datetime('now'))`,
    )
      .bind(
        credential.id,
        Buffer.from(credential.publicKey).toString('base64'),
        credential.counter,
      )
      .run();

    // Clean up challenge
    challenges.delete(userId);

    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, credential_id, expires_at, created_at) 
       VALUES (?, ?, ?, datetime('now'))`,
    )
      .bind(sessionId, credential.id, expiresAt)
      .run();

    // Set session cookie
    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return c.json({
      verified: true,
      credentialDeviceType,
      credentialBackedUp,
    });
  } catch (error) {
    console.error('Registration verification error:', error);
    return c.json({ error: 'Verification failed' }, 400);
  }
});

// ============================================
// Authentication Flow
// ============================================

// Step 1: Generate authentication options
auth.post('/login/options', async (c) => {
  // Get all registered credentials
  const credentials = await c.env.DB.prepare('SELECT id FROM credentials').all<{
    id: string;
  }>();

  if (!credentials.results || credentials.results.length === 0) {
    return c.json({ error: 'No registered credentials' }, 400);
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    // Don't pass allowCredentials - let the authenticator offer discoverable credentials
    // allowCredentials: credentials.results.map((cred) => ({
    //   id: cred.id,
    // })),
  });

  // Store challenge
  const challengeId = generateId();
  challenges.set(challengeId, options.challenge);

  return c.json({ options, challengeId });
});

// Step 2: Verify authentication
auth.post('/login/verify', async (c) => {
  const { challengeId, response } = (await c.req.json()) as {
    challengeId: string;
    response: AuthenticationResponseJSON;
  };

  const expectedChallenge = challenges.get(challengeId);
  if (!expectedChallenge) {
    return c.json({ error: 'Challenge not found or expired' }, 400);
  }

  // response.id is a Base64URLString, same format as stored in DB
  const credentialId = response.id;

  // Get credential from database
  const credential = await c.env.DB.prepare(
    'SELECT * FROM credentials WHERE id = ?',
  )
    .bind(credentialId)
    .first<{
      id: string;
      public_key: string;
      counter: number;
    }>();

  if (!credential) {
    return c.json({ error: 'Credential not found' }, 400);
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: Buffer.from(credential.public_key, 'base64'),
        counter: credential.counter,
      },
    });

    if (!verification.verified) {
      return c.json({ error: 'Verification failed' }, 400);
    }

    // Update counter (use the ID format from the DB)
    await c.env.DB.prepare('UPDATE credentials SET counter = ? WHERE id = ?')
      .bind(verification.authenticationInfo.newCounter, credential.id)
      .run();

    // Clean up challenge
    challenges.delete(challengeId);

    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, credential_id, expires_at, created_at) 
       VALUES (?, ?, ?, datetime('now'))`,
    )
      .bind(sessionId, credentialId, expiresAt)
      .run();

    // Set session cookie
    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return c.json({ verified: true });
  } catch (error) {
    console.error('Authentication verification error:', error);
    return c.json({ error: 'Verification failed' }, 400);
  }
});

// ============================================
// Session Management
// ============================================

// Check session status
auth.get('/session', async (c) => {
  const sessionId = getCookie(c, 'session');
  if (!sessionId) {
    return c.json({ authenticated: false });
  }

  const session = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")',
  )
    .bind(sessionId)
    .first();

  if (!session) {
    deleteCookie(c, 'session');
    return c.json({ authenticated: false });
  }

  return c.json({ authenticated: true });
});

// Logout
auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session');
  if (sessionId) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
    deleteCookie(c, 'session');
  }
  return c.json({ ok: true });
});

// ============================================
// Middleware for protected routes
// ============================================

export async function requireAuth(
  c: {
    env: Bindings;
    get: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    json: (data: unknown, status?: number) => Response;
    req: { header: (name: string) => string | undefined };
  },
  next: () => Promise<void>,
) {
  const sessionId = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

  if (!sessionId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const session = await c.env.DB.prepare(
    'SELECT credential_id FROM sessions WHERE id = ? AND expires_at > datetime("now")',
  )
    .bind(sessionId)
    .first<{ credential_id: string }>();

  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  c.set('credentialId', session.credential_id);
  await next();
}

export default auth;
