/**
 * API utility functions
 */

/**
 * Mock delay to simulate API call
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

