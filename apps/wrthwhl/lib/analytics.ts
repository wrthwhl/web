/**
 * Client-side analytics tracking
 */

const ANALYTICS_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://analytics.wrthwhl.cloud'
    : 'http://localhost:8787';

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// Detect device type
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

// Detect browser
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

// Get UTM parameters from URL
function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

// Send tracking data
async function track(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${ANALYTICS_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silently fail - analytics should never break the site
    console.debug('Analytics tracking failed:', error);
  }
}

/**
 * Track a pageview
 */
export function trackPageview(): void {
  if (typeof window === 'undefined') return;

  const utmParams = getUtmParams();

  track({
    type: 'pageview',
    path: window.location.pathname,
    sessionId: getSessionId(),
    referrer: document.referrer || undefined,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    ...utmParams,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventType: string,
  eventData?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  track({
    type: 'event',
    sessionId: getSessionId(),
    eventType,
    eventData,
  });
}

/**
 * Track scroll depth (call with percentage: 25, 50, 75, 100)
 */
export function trackScrollDepth(depth: number): void {
  trackEvent('scroll_depth', { depth });
}

/**
 * Track print button click
 */
export function trackPrint(): void {
  trackEvent('print');
}

/**
 * Track theme toggle
 */
export function trackThemeToggle(theme: string): void {
  trackEvent('theme_toggle', { theme });
}
