export interface AuthResponse {
  member: Member;
  accessToken: string;
  refreshToken: string;
}

export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface LoginPayload {
  email: string;
  password: string;
}
