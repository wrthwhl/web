import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDeviceType, getBrowser } from './analytics';

describe('analytics helpers', () => {
  describe('getDeviceType', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {});
    });

    it('returns "mobile" for mobile user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile',
      });
      expect(getDeviceType()).toBe('mobile');
    });

    it('returns "tablet" for tablet user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) Tablet',
      });
      expect(getDeviceType()).toBe('tablet');
    });

    it('returns "desktop" for desktop user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      });
      expect(getDeviceType()).toBe('desktop');
    });

    it('returns "unknown" when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(getDeviceType()).toBe('unknown');
    });
  });

  describe('getBrowser', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {});
    });

    it('returns "Chrome" for Chrome user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
      });
      expect(getBrowser()).toBe('Chrome');
    });

    it('returns "Firefox" for Firefox user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Firefox/120.0',
      });
      expect(getBrowser()).toBe('Firefox');
    });

    it('returns "Safari" for Safari user agents (without Chrome)', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Safari/605.1.15',
      });
      expect(getBrowser()).toBe('Safari');
    });

    it('returns "Edge" for Edge user agents', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Edge/120.0.0.0',
      });
      expect(getBrowser()).toBe('Edge');
    });

    it('returns "unknown" when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(getBrowser()).toBe('unknown');
    });
  });
});
