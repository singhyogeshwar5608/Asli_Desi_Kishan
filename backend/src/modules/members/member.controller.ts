import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { MemberService } from './member.service';
import {
  type ListMembersQuery,
  type MemberIdParams,
  type MoveMemberDto,
  type TreeQueryDto,
  type UpdateMemberDto,
  type CreateMemberDto,
} from './member.validation';

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await MemberService.listMembers(req.query as ListMembersQuery);
  res.json(result);
});

export const getMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await MemberService.getMember(req.params as MemberIdParams);
  res.json({ member });
});

export const createMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await MemberService.createMember(req.body as CreateMemberDto);
  res.status(201).json({ member });
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await MemberService.updateMember(
    req.params as MemberIdParams,
    req.body as UpdateMemberDto
  );
  res.json({ member });
});

export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await MemberService.deleteMember(req.params as MemberIdParams);
  res.json({ member });
});

export const moveMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await MemberService.moveMember(
    req.params as MemberIdParams,
    req.body as MoveMemberDto
  );
  res.json({ member });
});

export const getMemberTree = asyncHandler(async (req: Request, res: Response) => {
  const tree = await MemberService.getTree(
    req.params as MemberIdParams,
    req.query as TreeQueryDto
  );
  res.json(tree);
});

export const getMemberBv = asyncHandler(async (req: Request, res: Response) => {
  const summary = await MemberService.getBvSummary(req.params as MemberIdParams);
  res.json(summary);
});
