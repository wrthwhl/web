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

export default function RegisterPage() {
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  async function handleRegister() {
    setStatus({ type: 'loading' });

    try {
      // Get registration options
      const optRes = await fetch(`${API_URL}/api/auth/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error || 'Failed to get registration options');
      }

      const { options, userId } = await optRes.json();

      // Convert options for native WebAuthn API
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64URLToBuffer(options.challenge),
        rp: options.rp,
        user: {
          ...options.user,
          id: base64URLToBuffer(options.user.id),
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation || 'none',
        authenticatorSelection: options.authenticatorSelection,
      };

      if (options.excludeCredentials) {
        publicKeyOptions.excludeCredentials = options.excludeCredentials.map(
          (c: { id: string; type: PublicKeyCredentialType }) => ({
            ...c,
            id: base64URLToBuffer(c.id),
          }),
        );
      }

      // Call native WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('No credential returned');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Convert response for server
      const body = {
        userId,
        response: {
          id: credential.id,
          rawId: bufferToBase64URL(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: bufferToBase64URL(response.clientDataJSON),
            attestationObject: bufferToBase64URL(response.attestationObject),
            transports: response.getTransports?.() || [],
          },
        },
      };

      // Verify with server
      const verifyRes = await fetch(`${API_URL}/api/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Registration failed');
      }

      setStatus({
        type: 'success',
        message: 'Registration successful! Redirecting...',
      });
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Registration failed',
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--spacing-phi-md)]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-[var(--spacing-phi-xs)]">
          Register Passkey
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-[var(--spacing-phi-lg)]">
          Create a passkey to access the analytics dashboard.
        </p>

        <Button
          onClick={handleRegister}
          disabled={status.type === 'loading'}
          className="w-full"
          size="lg"
        >
          {status.type === 'loading'
            ? 'Registering...'
            : 'Register with Passkey'}
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
          <Link href="/login" className="hover:underline">
            Already registered? Login
          </Link>
        </p>
      </div>
    </div>
  );
}
