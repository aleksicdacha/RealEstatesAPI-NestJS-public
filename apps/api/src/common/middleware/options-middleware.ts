import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OptionsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('METHOD:::', req.method);
    console.log('REQUEST:::', req);
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
    next();
  }
}
