/**
 * Centralized utility to convert raw technical errors (API failures, network issues, validation errors)
 * into friendly, actionable messages for the user.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // If it's a standard Error object, extract the message
  let message = '';
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null && 'error' in error) {
    message = String((error as any).error);
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = String((error as any).message);
  } else {
    return 'Something went wrong. Please check your connection and try again.';
  }

  // Convert technical messages to friendly ones
  const lowerMsg = message.toLowerCase();

  // Network / Fetch errors
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('network error') || lowerMsg.includes('fetch failed')) {
    return 'We couldn\'t connect to the server. Please check your internet connection or try again later.';
  }

  // Authentication errors
  if (lowerMsg.includes('unauthorized') || lowerMsg.includes('401')) {
    return 'You are not authorized to perform this action. Your session may have expired.';
  }
  if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('user not found') || lowerMsg.includes('password incorrect') || lowerMsg.includes('invalid username')) {
    return 'That email or password doesn\'t match our records. Please try again.';
  }

  // Not Found / 404
  if (lowerMsg.includes('not found') || lowerMsg.includes('404')) {
    return 'The requested resource could not be found. It may have been deleted or moved.';
  }

  // Server / 500 errors
  if (lowerMsg.includes('500') || lowerMsg.includes('internal server error')) {
    return 'Our server encountered an issue. We are looking into it. Please try again later.';
  }
  if (lowerMsg.includes('timeout') || lowerMsg.includes('504')) {
    return 'The request took too long to complete. Please try again.';
  }

  // Specific entity errors
  if (lowerMsg.includes('failed to fetch teams') || lowerMsg.includes('failed to fetch schedule') || lowerMsg.includes('failed to fetch settings')) {
    return 'We couldn\'t load the data. Please check your connection or refresh the page.';
  }
  
  if (lowerMsg.includes('failed to upload')) {
    return 'This file couldn\'t be uploaded. Please ensure it\'s a valid format and under the size limit.';
  }

  if (lowerMsg.includes('validation failed') || lowerMsg.includes('invalid input') || lowerMsg.includes('400') || lowerMsg.includes('bad request')) {
    return 'Please check your input. Some fields may be missing or incorrectly formatted.';
  }

  // Return original error if it seems safe and friendly enough, otherwise a generic fallback
  // (We'll assume if it doesn't match our harsh error list, it might be a clean validation message from our backend)
  return message;
}
