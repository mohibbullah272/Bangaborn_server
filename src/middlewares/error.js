"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.globalErrorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = __importDefault(require("./appError"));
// Detect if error is operational
const isOperationalError = (error) => {
    return error instanceof appError_1.default || error.isOperational === true;
};
// Handle specific MongoDB errors
const handleMongoErrors = (error) => {
    // Duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return appError_1.default.conflict(`Duplicate value for ${field}: ${value} already exists`, { field, value });
    }
    // CastError (invalid ObjectId)
    if (error.name === 'CastError') {
        return appError_1.default.badRequest(`Invalid ${error.path}: ${error.value}`, { path: error.path, value: error.value });
    }
    // ValidationError
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
        return appError_1.default.validationError('Validation failed', errors);
    }
    // Mongoose timeout
    if (error.name === 'MongooseTimeoutError') {
        return appError_1.default.internalError('Database operation timed out');
    }
    return appError_1.default.internalError('Database error occurred');
};
// Send error in development
const sendErrorDev = (error, res) => {
    res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message,
        error: error,
        stack: error.stack,
        timestamp: new Date().toISOString(),
    });
};
// Send error in production
const sendErrorProd = (error, res) => {
    // Operational, trusted error
    if (isOperationalError(error)) {
        res.status(error.statusCode).json(Object.assign(Object.assign({ success: false, status: error.status, message: error.message }, (error.details && { details: error.details })), { timestamp: new Date().toISOString() }));
    }
    // Programming or unknown error
    else {
        // Log error for monitoring
        console.error('🚨 ERROR:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong!',
            timestamp: new Date().toISOString(),
        });
    }
};
// Global error handler middleware
const globalErrorHandler = (error, req, res, next) => {
    // Set default values
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    // Handle different error types
    let processedError = error;
    // Handle MongoDB errors
    if (error instanceof mongoose_1.default.Error || error.code === 11000) {
        processedError = handleMongoErrors(error);
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        processedError = appError_1.default.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
        processedError = appError_1.default.unauthorized('Token expired');
    }
    // Environment-based error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(processedError, res);
    }
    else {
        sendErrorProd(processedError, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.globalErrorHandler;
