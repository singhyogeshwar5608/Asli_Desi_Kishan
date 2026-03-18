import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { MemberModel } from './member.model';
import { resolvePlacement } from './member.helpers';
import {
  type CreateMemberDto,
  type ListMembersQuery,
  type MemberIdParams,
  type MoveMemberDto,
  type TreeQueryDto,
  type UpdateMemberDto,
} from './member.validation';
import { PasswordService } from '@services/password';
import { generateMemberId } from '@utils/id';
import { ApiError } from '@utils/apiError';
import { TreeService } from '@services/tree';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

const buildMemberFilter = (memberId: string) => {
  if (Types.ObjectId.isValid(memberId)) {
    return { _id: new Types.ObjectId(memberId) };
  }
  return { memberId };
};

const searchProjection = ['memberId', 'fullName', 'email'];

const buildSearchQuery = (search?: string) => {
  if (!search) return undefined;
  const regex = new RegExp(search, 'i');
  return {
    $or: searchProjection.map((field) => ({ [field]: regex })),
  };
};

const findMemberOrThrow = async (memberId: string) => {
  const member = await MemberModel.findOne(buildMemberFilter(memberId));
  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }
  return member;
};

export const MemberService = {
  listMembers: async (query: ListMembersQuery) => {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }

    const search = buildSearchQuery(query.search);
    if (search) {
      Object.assign(filter, search);
    }

    const [members, total] = await Promise.all([
      MemberModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberModel.countDocuments(filter),
    ]);

    return {
      data: members,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  getMember: async ({ memberId }: MemberIdParams) => {
    const member = await MemberModel.findOne(buildMemberFilter(memberId)).lean();
    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }
    return member;
  },

  createMember: async (payload: CreateMemberDto) => {
    const existingEmail = await MemberModel.findOne({ email: payload.email.toLowerCase() });
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

    return member;
  },

  updateMember: async ({ memberId }: MemberIdParams, payload: UpdateMemberDto) => {
    const member = await MemberModel.findOneAndUpdate(buildMemberFilter(memberId), payload, {
      new: true,
    }).lean();

    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    return member;
  },

  deleteMember: async ({ memberId }: MemberIdParams) => {
    const member = await MemberModel.findOneAndDelete(buildMemberFilter(memberId)).lean();
    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }
    return member;
  },

  moveMember: async ({ memberId }: MemberIdParams, payload: MoveMemberDto) => {
    const member = await findMemberOrThrow(memberId);

    if (payload.sponsorId === member.id || payload.sponsorId === member.memberId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot move member under themselves');
    }

    const { sponsor, leg, path, depth } = await resolvePlacement(payload.sponsorId, payload.leg, {
      excludeMemberId: member.id,
    });

    if (sponsor && TreeService.isAncestor(member.placementPath, sponsor.placementPath)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot move member under their downline');
    }

    const oldPath = member.placementPath;
    const depthDelta = depth - member.depth;
    const regex = new RegExp(`^${TreeService.escapePathRegex(oldPath)}`);
    const descendants = await MemberModel.find({ placementPath: { $regex: regex } });

    const bulk = descendants.map((doc) => {
      const trailing = doc.placementPath.substring(oldPath.length);
      const newPath = `${path}${trailing}`;
      const update: Record<string, unknown> = {
        placementPath: newPath,
        depth: doc.depth + depthDelta,
      };
      if (doc.id === member.id) {
        update.sponsorId = sponsor?._id ?? null;
        update.leg = leg ?? null;
      }
      return {
        updateOne: {
          filter: { _id: doc._id },
          update,
        },
      };
    });

    if (bulk.length) {
      await MemberModel.bulkWrite(bulk);
    }

    return MemberModel.findById(member._id).lean();
  },

  getTree: async ({ memberId }: MemberIdParams, query: TreeQueryDto) => {
    const member = await findMemberOrThrow(memberId);
    const depth = query.depth ?? 3;
    const maxDepth = member.depth + depth;

    const regex = new RegExp(`^${TreeService.escapePathRegex(member.placementPath)}`);
    const nodes = await MemberModel.find({
      placementPath: { $regex: regex },
      depth: { $lte: maxDepth },
    })
      .select('memberId fullName email placementPath depth sponsorId leg stats status role bv wallet createdAt')
      .sort({ depth: 1 })
      .limit(1500)
      .lean();

    return {
      root: member,
      nodes,
      meta: {
        depthLimit: depth,
        count: nodes.length,
      },
    };
  },

  getBvSummary: async ({ memberId }: MemberIdParams) => {
    const member = await findMemberOrThrow(memberId);
    return {
      memberId: member.memberId,
      bv: member.bv,
      wallet: member.wallet,
      stats: member.stats,
    };
  },
};
