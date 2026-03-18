import { z } from 'zod';

export const memberIdParamSchema = z.object({
  params: z.object({
    memberId: z.string().min(1),
  }),
});

export const createMemberSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    sponsorId: z.string().optional(),
    leg: z.enum(['LEFT', 'RIGHT']).optional(),
  }),
});

export const updateMemberSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
      leg: z.enum(['LEFT', 'RIGHT']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const moveMemberSchema = z.object({
  body: z.object({
    sponsorId: z.string().min(1),
    leg: z.enum(['LEFT', 'RIGHT']),
  }),
});

export const listMembersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  }),
});

export const treeQuerySchema = memberIdParamSchema.extend({
  query: z.object({
    depth: z.coerce.number().int().min(1).max(10).optional(),
  }),
});

export const bvQuerySchema = memberIdParamSchema;

export const updateMemberRequestSchema = memberIdParamSchema.merge(updateMemberSchema);
export const moveMemberRequestSchema = memberIdParamSchema.merge(moveMemberSchema);
export const bvRequestSchema = memberIdParamSchema;

export type CreateMemberDto = z.infer<typeof createMemberSchema>['body'];
export type UpdateMemberDto = z.infer<typeof updateMemberSchema>['body'];
export type MoveMemberDto = z.infer<typeof moveMemberSchema>['body'];
export type ListMembersQuery = z.infer<typeof listMembersSchema>['query'];
export type TreeQueryDto = z.infer<typeof treeQuerySchema>['query'];
export type MemberIdParams = z.infer<typeof memberIdParamSchema>['params'];
