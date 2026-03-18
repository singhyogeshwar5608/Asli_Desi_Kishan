import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import type { MemberDocument, MemberLeg } from './member.model';
import { MemberModel } from './member.model';
import { TreeService } from '@services/tree';
import { ApiError } from '@utils/apiError';

interface ResolveOptions {
  excludeMemberId?: string;
}

export const resolvePlacement = async (
  sponsorId?: string,
  leg?: MemberLeg,
  options: ResolveOptions = {}
): Promise<{ sponsor?: MemberDocument | null; leg?: MemberLeg; path: string; depth: number }> => {
  if (!sponsorId) {
    const existingRoot = await MemberModel.findOne({ sponsorId: null }).lean();
    if (existingRoot) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Sponsor is required once root exists');
    }
    const rootPath = TreeService.rootPath();
    return { sponsor: null, leg: undefined, path: rootPath, depth: 0 };
  }

  const sponsor = Types.ObjectId.isValid(sponsorId)
    ? await MemberModel.findById(sponsorId)
    : await MemberModel.findOne({ memberId: sponsorId });
  if (!sponsor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }
  if (!leg) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Leg (LEFT/RIGHT) is required');
  }

  const existingChild = await MemberModel.findOne({ sponsorId: sponsor._id, leg });
  if (existingChild && existingChild._id.toString() !== options.excludeMemberId) {
    throw new ApiError(StatusCodes.CONFLICT, `Sponsor already has ${leg.toLowerCase()} leg filled`);
  }

  const path = TreeService.childPath(sponsor.placementPath, leg);
  const depth = sponsor.depth + 1;
  return { sponsor, leg, path, depth };
};
