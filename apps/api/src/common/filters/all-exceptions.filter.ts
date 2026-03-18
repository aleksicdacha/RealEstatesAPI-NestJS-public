import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
      
      errors = typeof exceptionResponse === 'object' 
        ? (exceptionResponse as any).errors 
        : null;
    }
    // Handle TypeORM database errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const error = exception as any;
      
      // PostgreSQL error codes
      switch (error.code) {
        case '23505': // unique_violation
          message = 'Record already exists';
          errors = { field: error.detail };
          break;
        case '23503': // foreign_key_violation
          message = 'Referenced record does not exist';
          break;
        case '23502': // not_null_violation
          message = 'Required field is missing';
          errors = { field: error.column };
          break;
        default:
          message = 'Database operation failed';
      }
    }
    // Handle unknown errors — never expose raw message in production
    else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
      // production: message stays 'Internal server error'
    }

    // Log error details
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
