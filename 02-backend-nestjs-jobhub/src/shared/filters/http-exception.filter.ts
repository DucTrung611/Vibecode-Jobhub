import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../types/api-response.type';

const STATUS_FALLBACK_CODE: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_001',
  [HttpStatus.UNAUTHORIZED]: 'AUTH_001',
  [HttpStatus.FORBIDDEN]: 'AUTH_003',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND_000',
  [HttpStatus.CONFLICT]: 'CONFLICT_000',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiErrorResponse = {
      success: false,
      error: this.buildError(exception, status),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(body);
  }

  private buildError(
    exception: unknown,
    status: HttpStatus,
  ): ApiErrorResponse['error'] {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      // Feature code throws e.g. `new NotFoundException({ code: 'JOBS_001', message, details })`
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'code' in payload
      ) {
        const { code, message, details } = payload as {
          code: string;
          message: string | string[];
          details?: Array<{ field: string; message: string }>;
        };
        return {
          code,
          message: Array.isArray(message) ? message.join(', ') : message,
          details: details ?? null,
        };
      }
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ??
            exception.message);
      return {
        code: STATUS_FALLBACK_CODE[status] ?? `HTTP_${status}`,
        message: Array.isArray(message) ? message.join(', ') : message,
        details: null,
      };
    }

    return {
      code: 'GENERIC_000',
      message: 'Unexpected server error',
      details: null,
    };
  }
}
