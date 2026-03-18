import type { RequestHandler } from 'express';
import { JwtService } from '@services/jwt';
import { MemberModel } from '@modules/members/member.model';
import { ApiError } from '@utils/apiError';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    if (!token) {
      throw new ApiError(401, 'Authentication token missing');
    }

    const payload = JwtService.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };

    const member = await MemberModel.findById(payload.sub);
    if (member) {
      req.user.member = member;
    }

    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const requireRoles = (...roles: Array<'ADMIN' | 'MEMBER'>): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};
