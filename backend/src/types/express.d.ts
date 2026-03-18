import type { MemberDocument } from '@modules/members/member.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'ADMIN' | 'MEMBER';
        member?: MemberDocument;
      };
      requestId?: string;
    }
  }
}

export {};
