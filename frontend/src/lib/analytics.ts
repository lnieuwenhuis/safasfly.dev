import { api } from './api';

export async function trackEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    await api.trackEvent({
      eventName,
      path: window.location.pathname,
      metadata,
    });
  } catch {
    // analytics should never break user flows
  }
}
