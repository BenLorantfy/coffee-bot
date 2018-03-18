class BaseError extends Error {
  constructor({ message, code }) {
    super();
    this.message = message;
    this.code = code || 500;
    this.stack = new Error().stack;
  }

  toString() {
    return this.message;
  }
}

export default BaseError;
