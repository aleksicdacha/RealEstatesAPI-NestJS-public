import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OptionsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OptionsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      this.logger.debug(`OPTIONS request to ${req.path}`);
      return res.status(200).send();
    }
    next();
  }
}
