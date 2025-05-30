import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '@utils/response';

// 自定义错误类，用于应用内部抛出带状态码的错误
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = '') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 验证相关错误（400 Bad Request）
export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

// 身份验证错误（401 Unauthorized）
export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized access', code: string = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
  }
}

// 权限错误（403 Forbidden）
export class ForbiddenError extends AppError {
  constructor(message: string = 'Permission denied', code: string = 'FORBIDDEN_ERROR') {
    super(message, 403, code);
  }
}

// 资源不存在错误（404 Not Found）
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND_ERROR') {
    super(message, 404, code);
  }
}

// 请求冲突错误（409 Conflict）
export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT_ERROR') {
    super(message, 409, code);
  }
}

// 全局错误处理中间件
const errorHandler = (err: any, req: Request, res: Response , next: NextFunction) => {
  console.error(`[err] ${err.name}: ${err.message}`);
  console.error(err.stack);

  // 处理 Prisma 错误
  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002': // 唯一约束失败
        return ResponseHelper.error(
          res,
          `Duplicate resource: ${err.meta?.target?.join(', ') || 'unique constraint violation'}`,
          409,
          err.code
        );
      case 'P2025': // 记录不存在
        return ResponseHelper.error(
          res,
          `Resource not found: ${err.meta?.cause || 'requested record not found'}`,
          404,
          err.code
        );
      default:
        return ResponseHelper.error(
          res,
          `Database error (${err.code}): ${err.message}`,
          500,
          err.code
        );
    }
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return ResponseHelper.error(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHelper.error(res, 'Token expired', 401, 'TOKEN_EXPIRED');
  }

  // 处理自定义应用错误
  if (err instanceof AppError) {
    return ResponseHelper.error(res, err.message, err.statusCode, err.code);
  }

  // 处理 Express 验证错误
  if (err.name === 'ValidationError') {
    return ResponseHelper.error(
      res, 
      err.message || 'Request validation failed',
      400, 
      'VALIDATION_ERROR'
    );
  }

  // 处理 Multer 错误（文件上传）
  if (err.name === 'MulterError') {
    return ResponseHelper.error(
      res,
      `File upload error: ${err.message}`,
      400,
      'FILE_UPLOAD_ERROR'
    );
  }

  // 默认处理其他未知错误
  return ResponseHelper.error(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : `Unhandled error: ${err.message}`,
    500,
    'INTERNAL_SERVER_ERROR'
  );
};

export const errorMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!err) {
      return next();
    }
    await errorHandler(err, req, res, next);
  } catch (error : any) {
    console.error(`[Unhandled Error] ${error}`);
    ResponseHelper.error(
      res,
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : `Unhandled error: ${error.message}`,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}