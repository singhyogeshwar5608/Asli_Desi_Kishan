import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiError } from '@utils/apiError';
import { AuthService } from './auth.service';

export const registerMember = asyncHandler(async (req: Request, res: Response) => {
  const { member, accessToken, refreshToken } = await AuthService.register(req.body);
  res.status(201).json({ member, accessToken, refreshToken });
});

export const loginMember = asyncHandler(async (req: Request, res: Response) => {
  const { member, accessToken, refreshToken } = await AuthService.login(req.body);
  res.status(200).json({ member, accessToken, refreshToken });
});

export const refreshSession = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  const { member, accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(token);
  res.status(200).json({ member, accessToken, refreshToken: newRefreshToken });
});

export const getCurrentMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }

  res.status(200).json({ member: req.user.member });
});
