import * as Sentry from '@sentry/react-native';

/**
 * Initialise Sentry.
 *
 * Steps to set up (one-time):
 *  1. Go to https://sentry.io → sign up free → create a project → choose "React Native"
 *  2. Copy the DSN shown in the setup wizard
 *  3. Replace the dsn string below with your DSN
 *  4. Also set SENTRY_DSN in your .env and CI/CD secrets
 *
 * The DSN looks like:
 *   https://abc123@o123456.ingest.sentry.io/789
 */
const SENTRY_DSN = 'YOUR_SENTRY_DSN_HERE';

export function initialiseSentry() {
  // Don't init if DSN not configured yet
  if (!SENTRY_DSN || SENTRY_DSN === 'YOUR_SENTRY_DSN_HERE') {
    if (__DEV__) {
      console.warn('[Sentry] DSN not configured — crash reporting is disabled. Set SENTRY_DSN in src/utils/sentry.ts');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Only send errors in production; still capture in staging
    enabled: !__DEV__,

    // % of sessions to record as "replays" — set to 0 to disable
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Performance tracing — 10% of transactions sampled
    tracesSampleRate: 0.1,

    // Tag every event with the environment
    environment: __DEV__ ? 'development' : 'production',
  });
}

/** Set user context so you can see which member experienced the crash */
export function setSentryUser(userId: string, employeeId: string) {
  Sentry.setUser({ id: userId, username: employeeId });
}

/** Clear user on logout */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/** Manually capture a non-fatal error (e.g. a failed API call you want to track) */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureMessage(String(error), { extra: context });
  }
}
