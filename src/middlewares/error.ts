import { Request, Response, NextFunction } from 'express';

import mongoose from 'mongoose';
import AppError from './appError';

// Detect if error is operational
const isOperationalError = (error: any): boolean => {
  return error instanceof AppError || error.isOperational === true;
};

// Handle specific MongoDB errors
const handleMongoErrors = (error: any): AppError => {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return AppError.conflict(
      `Duplicate value for ${field}: ${value} already exists`,
      { field, value }
    );
  }

  // CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return AppError.badRequest(
      `Invalid ${error.path}: ${error.value}`,
      { path: error.path, value: error.value }
    );
  }

  // ValidationError
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
    return AppError.validationError('Validation failed', errors);
  }

  // Mongoose timeout
  if (error.name === 'MongooseTimeoutError') {
    return AppError.internalError('Database operation timed out');
  }

  return AppError.internalError('Database error occurred');
};

// Send error in development
const sendErrorDev = (error: AppError, res: Response) => {
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
const sendErrorProd = (error: AppError, res: Response) => {
  // Operational, trusted error
  if (isOperationalError(error)) {
    res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      ...(error.details && { details: error.details }),
      timestamp: new Date().toISOString(),
    });
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
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Handle different error types
  let processedError = error;

  // Handle MongoDB errors
  if (error instanceof mongoose.Error || error.code === 11000) {
    processedError = handleMongoErrors(error);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    processedError = AppError.unauthorized('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    processedError = AppError.unauthorized('Token expired');
  }

  // Environment-based error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(processedError, res);
  } else {
    sendErrorProd(processedError, res);
  }
};


export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};



export default  globalErrorHandler
