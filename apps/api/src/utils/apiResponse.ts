import type { Response } from 'express';
import type { ApiResponse, ApiErrorResponse, ApiErrorDetail } from '@peerlume/shared';
import { HTTP_STATUS } from '@peerlume/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  message?: string
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code: string,
  message: string,
  details?: ApiErrorDetail[] | unknown
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}
