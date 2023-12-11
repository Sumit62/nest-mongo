import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Response<T>>> {
    const req = context.switchToHttp().getRequest();
    const requestUrl = `Request==> ${req.protocol}://${req.get('host')}${
      req.originalUrl
    }`;
    console.log(requestUrl);
    return next.handle().pipe(
      map((data) => {
        switch (
          data === null ? null : data?.severity === 'ERROR' ? 'ERROR' : data
        ) {
          case null:
            console.log(
              `Response===> ${new NotFoundException('User not found')}`,
            );
            throw new NotFoundException('User not found');
          case 'ERROR':
            console.log(`Response==> ${JSON.stringify(data)}`);
            return {
              data: null,
              statusCode: HttpStatus.BAD_REQUEST,
              status: false,
              message: data.severity,
              error: data.detail,
            };
          default:
            console.log(`Response==> ${JSON.stringify(data)}`);
            return {
              data,
              statusCode: HttpStatus.OK,
              status: true,
              message: 'Success.',
            };
        }
      }),
    );
  }
}
