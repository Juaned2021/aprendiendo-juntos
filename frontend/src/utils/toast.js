let showToastFn = null;

export const toast = {
  success: (message) => showToastFn?.(message, 'success'),
  error: (message) => showToastFn?.(message, 'error'),
  info: (message) => showToastFn?.(message, 'info'),
  warning: (message) => showToastFn?.(message, 'warning'),
};

export const setShowToastFn = (fn) => {
  showToastFn = fn;
};
