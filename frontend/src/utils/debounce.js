/**
 * Debounce Utility
 * Single responsibility: Debounce function implementation
 * Easy to use and maintain
 */

/**
 * Creates a debounced function that delays execution
 * until after `wait` milliseconds have elapsed since the last call
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds (default: 1000ms)
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 1000) => {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    // Cancel any pending execution
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set new timeout
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

/**
 * Creates a debounced function with immediate execution option
 * Useful for showing loading state immediately while debouncing actual execution
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds (default: 1000ms)
 * @returns {Function} Debounced function with immediate flag
 */
export const debounceWithImmediate = (func, wait = 1000) => {
  let timeout;
  let immediateExecuted = false;

  return function executedFunction(...args) {
    if (timeout) {
      clearTimeout(timeout);
    }

    const execute = () => {
      func.apply(this, args);
    };

    // Execute immediately
    execute();
    immediateExecuted = true;

    // Prevent immediate re-execution
    timeout = setTimeout(() => {
      if (!immediateExecuted) {
        execute();
      }
      immediateExecuted = false;
    }, wait);

    return {
      flush: () => {
        clearTimeout(timeout);
        execute();
        immediateExecuted = false;
      },
      cancel: () => {
        clearTimeout(timeout);
        immediateExecuted = false;
      }
    };
  };
};

/**
 * Creates a throttled function that limits execution rate
 * Useful for API calls or expensive operations
 *
 * @param {Function} func - The function to throttle
 * @param {number} limit - The minimum time between executions in milliseconds (default: 1000ms)
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  let lastFunc;
  let lastRan;

  return function executedFunction(...args) {
    const context = this;
    if (inThrottle) {
      return;
    }

    const now = Date.now();
    const run = () => {
      inThrottle = false;
      lastFunc = now;
      func.apply(context, args);
    };

    if (!lastRan || now - lastRan >= limit) {
      if (!inThrottle) {
        run();
      }
    }

    lastRan = now;
  };
};

/**
 * Cancels all pending debounced/throttled executions
 * Useful for cleanup on component unmount
 */
export const cancelAllPending = () => {
  // This would need to track all created debouncers
  // For now, this is a placeholder for future enhancement
};

export default {
  debounce,
  debounceWithImmediate,
  throttle,
  cancelAllPending
};
