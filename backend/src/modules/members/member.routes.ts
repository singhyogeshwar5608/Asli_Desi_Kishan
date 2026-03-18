import { Router } from 'express';
import { authenticate, requireRoles } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import {
  createMemberSchema,
  listMembersSchema,
  memberIdParamSchema,
  moveMemberSchema,
  updateMemberSchema,
  treeQuerySchema,
} from './member.validation';
import {
  createMember,
  getMember,
  listMembers,
  moveMember,
  updateMember,
  getMemberTree,
  getMemberBv,
  deleteMember,
} from './member.controller';

const memberRouter = Router();

memberRouter.use(authenticate);

memberRouter
  .route('/')
  .get(requireRoles('ADMIN'), validateRequest(listMembersSchema), listMembers)
  .post(requireRoles('ADMIN'), validateRequest(createMemberSchema), createMember);

memberRouter
  .route('/:memberId')
  .get(validateRequest(memberIdParamSchema), getMember)
  .patch(requireRoles('ADMIN'), validateRequest(updateMemberSchema.merge(memberIdParamSchema)), updateMember)
  .delete(requireRoles('ADMIN'), validateRequest(memberIdParamSchema), deleteMember);

memberRouter.post(
  '/:memberId/move',
  requireRoles('ADMIN'),
  validateRequest(moveMemberSchema.merge(memberIdParamSchema)),
  moveMember
);

memberRouter.get(
  '/:memberId/tree',
  requireRoles('ADMIN', 'MEMBER'),
  validateRequest(treeQuerySchema),
  getMemberTree
);

memberRouter.get(
  '/:memberId/bv',
  requireRoles('ADMIN', 'MEMBER'),
  validateRequest(memberIdParamSchema),
  getMemberBv
);

export { memberRouter };
