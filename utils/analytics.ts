/**
 * Simple Analytics Tracker
 * 
 * Logs events to console in development and can be extended to send
 * to analytics services like Google Analytics, Mixpanel, Amplitude, etc.
 */

type AnalyticsEvent = 
  | 'token_viewed'
  | 'quote_fetched'
  | 'swap_completed'
  | 'vote_cast';

interface EventData {
  [key: string]: any;
}

class Analytics {
  private isDevelopment = process.env.NODE_ENV === 'development';

  track(event: AnalyticsEvent, data?: EventData) {
    const timestamp = new Date().toISOString();
    const payload = {
      event,
      timestamp,
      ...data,
    };

    // Log to console in development
    if (this.isDevelopment) {
      console.log('📊 Analytics Event:', payload);
    }

    // Send to your analytics service here
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event, data);
    // }

    // Example: Mixpanel
    // if (typeof window !== 'undefined' && window.mixpanel) {
    //   window.mixpanel.track(event, data);
    // }

    // Store in localStorage for debugging (optional)
    if (typeof window !== 'undefined') {
      try {
        const events = JSON.parse(localStorage.getItem('blackkeep_analytics') || '[]');
        events.push(payload);
        // Keep only last 100 events
        if (events.length > 100) events.shift();
        localStorage.setItem('blackkeep_analytics', JSON.stringify(events));
      } catch (error) {
        // Silently fail if localStorage is not available
      }
    }
  }

  // Helper to get all tracked events (for debugging)
  getEvents() {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('blackkeep_analytics') || '[]');
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  // Clear all tracked events
  clearEvents() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blackkeep_analytics');
    }
  }
}

export const analytics = new Analytics();
