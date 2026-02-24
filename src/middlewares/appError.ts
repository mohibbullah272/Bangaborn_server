 class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  details?: any;

  constructor(
    message: string, 
    statusCode: number, 
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized access') {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message: string, details?: any) {
    return new AppError(message, 409, details);
  }

  static validationError(message: string, errors: any[]) {
    return new AppError(message, 422, { errors });
  }

  static internalError(message: string = 'Internal server error') {
    return new AppError(message, 500);
  }
}


export default AppError