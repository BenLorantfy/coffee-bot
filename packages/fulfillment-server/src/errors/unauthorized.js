import BaseError from './base';

class UnauthorizedError extends BaseError {
  constructor(message) {
    super({ message, code: 403 });
  }
}

export default UnauthorizedError;
