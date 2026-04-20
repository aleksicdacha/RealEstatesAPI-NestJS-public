import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('handles HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not Found',
        path: '/test',
      }),
    );
  });

  it('handles HttpException with object response', () => {
    const exception = new HttpException(
      { message: 'Validation failed', errors: { name: 'required' } },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: { name: 'required' },
      }),
    );
  });

  it('handles unique_violation (23505)', () => {
    const exception = new QueryFailedError('INSERT', [], new Error());
    (exception as any).code = '23505';
    (exception as any).detail = 'Key (code)=(NIS-001) already exists.';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Record already exists',
      }),
    );
  });

  it('handles foreign_key_violation (23503)', () => {
    const exception = new QueryFailedError('INSERT', [], new Error());
    (exception as any).code = '23503';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Referenced record does not exist',
      }),
    );
  });

  it('handles not_null_violation (23502)', () => {
    const exception = new QueryFailedError('INSERT', [], new Error());
    (exception as any).code = '23502';
    (exception as any).column = 'name';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Required field is missing',
      }),
    );
  });

  it('handles unknown DB error codes', () => {
    const exception = new QueryFailedError('INSERT', [], new Error());
    (exception as any).code = '99999';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Database operation failed',
      }),
    );
  });

  it('hides error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const exception = new Error('Sensitive internal error');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const exception = new Error('Detailed error message');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Detailed error message',
      }),
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('includes timestamp and path in all responses', () => {
    const exception = new HttpException('test', 400);

    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
        path: '/test',
      }),
    );
  });
});
