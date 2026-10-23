import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getRecommendedPartners,
  searchStudents,
  getStudentPublicDetails,
} from '../services/discovery.service.js';

export async function handleGetRecommendedPartners(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const currentUserId = req.user!.id;
    const filters = req.query as any;
    const recommendations = await getRecommendedPartners(currentUserId, filters);
    sendSuccess(res, recommendations, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleSearchStudents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const currentUserId = req.user!.id;
    const filters = req.query as any;
    const results = await searchStudents(currentUserId, filters);
    sendSuccess(res, results, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function handleGetStudentDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const currentUserId = req.user!.id;
    const studentId = req.params.studentId as string;
    const details = await getStudentPublicDetails(currentUserId, studentId);
    sendSuccess(res, details, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}
