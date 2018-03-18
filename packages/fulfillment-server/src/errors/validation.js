import BaseError from './base';

class ValidationError extends BaseError {
  constructor(message) {
    super({ message, code: 400 });
  }
}

export default ValidationError;
