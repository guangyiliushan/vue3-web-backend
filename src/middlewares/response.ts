import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '@utils/response';

declare global {
  namespace Express {
    interface Response {
      success: (data?: any, statusCode?: number) => Response;
    }
  }
}

export const responseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.success = (data?: any, statusCode: number = 200): Response => {
    return ResponseHelper.success(res, data, statusCode);
  };
  next();
};