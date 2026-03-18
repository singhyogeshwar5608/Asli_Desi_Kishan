export interface MemberSummary {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  profileImage?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  phone?: string;
  role?: 'ADMIN' | 'MEMBER';
  leg?: 'LEFT' | 'RIGHT';
  bv?: {
    total?: number;
    leftLeg?: number;
    rightLeg?: number;
  };
  stats?: {
    teamSize?: number;
    directRefs?: number;
    lastLoginAt?: string;
    leftTeam?: number;
    rightTeam?: number;
    leftChild?: string | null;
    rightChild?: string | null;
    leftBv?: number;
    rightBv?: number;
  };
  createdAt?: string;
}

export interface MemberDetail extends MemberSummary {
  sponsorId?: string | null;
  wallet?: {
    balance: number;
    totalEarned: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MemberTreeNode extends MemberDetail {
  placementPath: string;
  depth: number;
  leg?: 'LEFT' | 'RIGHT';
  sponsorId?: string | null;
}
