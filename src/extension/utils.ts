export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Global debug flag
export const DEBUG_MODE = true;

export const logDebug = (message: string, ...args: any[]) => {
  if (DEBUG_MODE) {
    console.log(`[SmartFocus Pro] ${message}`, ...args);
  }
};
