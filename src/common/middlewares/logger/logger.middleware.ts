import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('LoggerMiddleware called');
    console.time('Request-response time');
    res.on('finish', () => console.timeEnd('Request-response time'));
    next();
  }
}
