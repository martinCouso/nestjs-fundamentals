import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('before');
    return next.handle().pipe(
      //map: Applies a given project function to each value emitted by the source Observable,
      // and emits the resulting values as an Observable.
      map((data) => ({
        data: data,
      })),
    );
  }
}
