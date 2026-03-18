import { apiClient } from '../../lib/api-client';
import { tokenStorage } from '../../lib/token-storage';
import type { AuthResponse, LoginPayload, Member } from './types';

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const fetchCurrentMember = async () => {
  const { data } = await apiClient.get<{ member: Member }>('/auth/me');
  return data.member;
};

export const logout = () => {
  tokenStorage.clearTokens();
};
