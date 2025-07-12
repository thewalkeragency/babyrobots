// Add setImmediate polyfill for Prisma
// Prisma uses setImmediate which is not available in Jest/JSDOM environment

// Add setImmediate polyfill for environments that don't have it
if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = (fn, ...args) => {
    return setTimeout(fn, 0, ...args);
  };
}

if (typeof globalThis.clearImmediate === 'undefined') {
  globalThis.clearImmediate = (id) => {
    return clearTimeout(id);
  };
}
