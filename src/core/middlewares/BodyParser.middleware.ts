import { Injectable, NestMiddleware } from '@nestjs/common';
import * as express from 'express';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class BodyParserMiddleware implements NestMiddleware {
  private jsonParser = express.json();

  use(req: Request, res: Response, next: NextFunction) {
    if (req.baseUrl.startsWith('/api/auth')) {
      return next();
    }

    return this.jsonParser(req, res, next);

    // this.jsonParser(req, res, (err) => {
    //   if (err) {
    //     next(err); // Pass any errors to the error-handling middleware
    //     return;
    //   }
    //   express.urlencoded({ extended: true })(req, res, next);
    // });
  }
}
