'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@wrthwhl/ui';

// Base64URL encode/decode helpers
function base64URLToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analytics.wrthwhl.cloud';

export default function LoginPage() {
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  async function handleLogin() {
    setStatus({ type: 'loading' });

    try {
      // Get login options
      const optRes = await fetch(`${API_URL}/api/auth/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error || 'Failed to get login options');
      }

      const { options, challengeId } = await optRes.json();

      // Convert options for native WebAuthn API
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64URLToBuffer(options.challenge),
        rpId: options.rpId,
        timeout: options.timeout,
        userVerification: options.userVerification,
      };

      if (options.allowCredentials) {
        publicKeyOptions.allowCredentials = options.allowCredentials.map(
          (c: { id: string; type: string }) => ({
            ...c,
            id: base64URLToBuffer(c.id),
          }),
        );
      }

      // Call native WebAuthn API
      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('No credential returned');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Convert response for server
      const body = {
        challengeId,
        response: {
          id: credential.id,
          rawId: bufferToBase64URL(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: bufferToBase64URL(response.clientDataJSON),
            authenticatorData: bufferToBase64URL(response.authenticatorData),
            signature: bufferToBase64URL(response.signature),
            userHandle: response.userHandle
              ? bufferToBase64URL(response.userHandle)
              : null,
          },
        },
      };

      // Verify with server
      const verifyRes = await fetch(`${API_URL}/api/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Login failed');
      }

      setStatus({
        type: 'success',
        message: 'Login successful! Redirecting...',
      });
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Login failed',
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--spacing-phi-md)]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-[var(--spacing-phi-xs)]">Login</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-[var(--spacing-phi-lg)]">
          Use your passkey to access the analytics dashboard.
        </p>

        <Button
          onClick={handleLogin}
          disabled={status.type === 'loading'}
          className="w-full"
          size="lg"
        >
          {status.type === 'loading'
            ? 'Authenticating...'
            : 'Login with Passkey'}
        </Button>

        {status.type === 'error' && (
          <div className="mt-[var(--spacing-phi-md)] p-[var(--spacing-phi-sm)] rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]">
            {status.message}
          </div>
        )}

        {status.type === 'success' && (
          <div className="mt-[var(--spacing-phi-md)] p-[var(--spacing-phi-sm)] rounded-[var(--radius)] bg-green-500/10 text-green-500">
            {status.message}
          </div>
        )}

        <p className="mt-[var(--spacing-phi-lg)] text-center text-[hsl(var(--muted-foreground))]">
          <Link href="/register" className="hover:underline">
            Need to register?
          </Link>
        </p>
      </div>
    </div>
  );
}
