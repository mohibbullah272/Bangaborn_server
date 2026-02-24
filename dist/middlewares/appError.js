"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.details = details;
        // Capture stack trace (excluding constructor call)
        Error.captureStackTrace(this, this.constructor);
    }
    // Factory methods for common errors
    static badRequest(message, details) {
        return new AppError(message, 400, details);
    }
    static unauthorized(message = 'Unauthorized access') {
        return new AppError(message, 401);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403);
    }
    static notFound(message = 'Resource not found') {
        return new AppError(message, 404);
    }
    static conflict(message, details) {
        return new AppError(message, 409, details);
    }
    static validationError(message, errors) {
        return new AppError(message, 422, { errors });
    }
    static internalError(message = 'Internal server error') {
        return new AppError(message, 500);
    }
}
exports.default = AppError;
