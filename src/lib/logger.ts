// Centralized logger to wrap errors.
// In a real production app, you would swap this out for Sentry, LogRocket, or Winston.

export const logger = {
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context || '');
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error.stack) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
    // TODO: Sentry.captureException(error)
  },
  security: (message: string, context?: any) => {
    console.warn(`[SECURITY_ALERT] ${new Date().toISOString()} - ${message}`, context || '');
    // TODO: Send critical alerts to Slack / PagerDuty
  }
};
