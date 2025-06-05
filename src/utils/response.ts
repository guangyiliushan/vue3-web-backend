import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
  errorCode?: string;
}

export class ResponseHelper {
  static success<T>(res: Response, data?: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode?: string
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: message,
      code: statusCode,
      errorCode,
    });
  }
}