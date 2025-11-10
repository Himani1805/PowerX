export const cacheMiddleware = (store) => (next) => (action) => {
  // Cache implementation
  return next(action);
};