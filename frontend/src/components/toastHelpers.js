import { TOAST_CONSTANTS } from '../utils/toastConstants';

let showToastFn = null;

export const setShowToastFn = (fn) => {
  showToastFn = fn;
};

export const toast = {
  success: (message) => showToastFn?.(message, TOAST_CONSTANTS.TYPES.SUCCESS),
  error: (message) => showToastFn?.(message, TOAST_CONSTANTS.TYPES.ERROR),
  info: (message) => showToastFn?.(message, TOAST_CONSTANTS.TYPES.INFO),
  warning: (message) => showToastFn?.(message, TOAST_CONSTANTS.TYPES.WARNING),
};
