


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
