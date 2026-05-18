import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        // якщо ендпоїнт вже сам вернув { data: ... } - не загортаємо вдруге
        if (value && typeof value === 'object' && 'data' in (value as object)) {
          return value as unknown as ApiResponse<T>;
        }
        return { data: value };
      }),
    );
  }
}
