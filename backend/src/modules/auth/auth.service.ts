import { StatusCodes } from 'http-status-codes';
import { MemberModel } from '@modules/members/member.model';
import { PasswordService } from '@services/password';
import { JwtService } from '@services/jwt';
import { ApiError } from '@utils/apiError';
import { generateMemberId } from '@utils/id';
import { resolvePlacement } from '@modules/members/member.helpers';
import type { RegisterDto, LoginDto } from './auth.validation';

export const AuthService = {
  register: async (payload: RegisterDto) => {
    const existingEmail = await MemberModel.findOne({ email: payload.email });
    if (existingEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use');
    }

    const { sponsor, leg, path, depth } = await resolvePlacement(payload.sponsorId, payload.leg);

    const passwordHash = await PasswordService.hash(payload.password);
    const member = await MemberModel.create({
      memberId: generateMemberId(),
      sponsorId: sponsor?._id ?? null,
      leg: leg ?? null,
      placementPath: path,
      depth,
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      role: payload.role ?? 'MEMBER',
      passwordHash,
      status: 'ACTIVE',
    });

    const accessToken = JwtService.signAccessToken({ sub: member.id, role: member.role });
    const refreshToken = JwtService.signRefreshToken({ sub: member.id, role: member.role });

    return { member, accessToken, refreshToken };
  },

  login: async (payload: LoginDto) => {
    const member = await MemberModel.findOne({ email: payload.email.toLowerCase() });
    if (!member) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    const isValid = await PasswordService.compare(payload.password, member.passwordHash);
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    const accessToken = JwtService.signAccessToken({ sub: member.id, role: member.role });
    const refreshToken = JwtService.signRefreshToken({ sub: member.id, role: member.role });

    return { member, accessToken, refreshToken };
  },

  refresh: async (refreshToken: string) => {
    const payload = JwtService.verifyRefreshToken(refreshToken);
    const member = await MemberModel.findById(payload.sub);
    if (!member) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }
    const accessToken = JwtService.signAccessToken({ sub: member.id, role: member.role });
    const newRefreshToken = JwtService.signRefreshToken({ sub: member.id, role: member.role });
    return { member, accessToken, refreshToken: newRefreshToken };
  },
};
