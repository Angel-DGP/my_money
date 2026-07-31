import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { 
  DomainException, 
  ValidationException, 
  BusinessRuleViolationException, 
  InvariantViolationException,
  ConcurrencyException,
  FeatureNotAvailableException
} from '@mymoney/shared';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof ValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
    } else if (exception instanceof BusinessRuleViolationException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof InvariantViolationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof ConcurrencyException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof FeatureNotAvailableException) {
      status = HttpStatus.NOT_IMPLEMENTED;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      code: exception.code,
      message: exception.message,
      context: exception.context,
    });
  }
}
