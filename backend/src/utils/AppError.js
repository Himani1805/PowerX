/**
 * AppError
 * A custom Error class designed to handle HTTP errors.
 * Used to distinguish operational errors.
 *
 * Example: new AppError('Lead not found', 404);
 */
class AppError extends Error {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404)
   */
  constructor(message, statusCode) {
    // Call base Error constructor
    super(message);

    // 1. Set HTTP status code (statusCode)
    this.statusCode = statusCode;
    
    // Set 'status' based on the HTTP status code (e.g., 'fail' or 'error')
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // 2. Mark as operational (known/handled errors)
    this.isOperational = true;

    // Capture error stack trace without including constructor in the stack
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;