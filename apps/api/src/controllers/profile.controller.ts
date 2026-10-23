import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@peerlume/shared';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import {
  getOwnProfile,
  updateOwnProfile,
  listSkills,
  updateTeachingSkills,
  updateLearningGoals,
} from '../services/profile.service.js';

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const profile = await getOwnProfile(req.user.id);
    sendSuccess(res, profile, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const profile = await updateOwnProfile(req.user.id, req.body);
    sendSuccess(res, profile, HTTP_STATUS.OK, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getSkills(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;
    const skills = await listSkills(query);
    sendSuccess(res, skills, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
}

export async function setTeachingSkills(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const profile = await updateTeachingSkills(req.user.id, req.body.skills);
    sendSuccess(res, profile, HTTP_STATUS.OK, 'Teaching skills updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function setLearningGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const profile = await updateLearningGoals(req.user.id, req.body.goals);
    sendSuccess(res, profile, HTTP_STATUS.OK, 'Learning goals updated successfully');
  } catch (error) {
    next(error);
  }
}
