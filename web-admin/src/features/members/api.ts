import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { MemberDetail, MemberSummary, PaginatedResponse, MemberTreeNode } from './types';

const MEMBERS_KEY = ['members'];
const memberKey = (id: string) => ['member', id];

export const fetchMembers = async () => {
  const { data } = await apiClient.get<PaginatedResponse<MemberSummary>>('/members', {
    params: { page: 1, limit: 10 },
  });
  return data;
};

export const useMembers = () => {
  return useQuery({ queryKey: MEMBERS_KEY, queryFn: fetchMembers });
};

export const useMemberDetail = (memberId?: string, enabled = true) => {
  return useQuery({
    queryKey: memberId ? memberKey(memberId) : ['member', 'unknown'],
    queryFn: async () => {
      if (!memberId) throw new Error('memberId is required');
      const { data } = await apiClient.get<{ member: MemberDetail }>(`/members/${memberId}`);
      return data.member;
    },
    enabled: Boolean(memberId) && enabled,
  });
};

export interface UploadedProfileMedia {
  url: string;
  secureUrl: string;
  publicId: string;
  bytes: number;
  width: number | null;
  height: number | null;
  format: string;
  name: string;
}

export const useUploadMemberProfile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ file: UploadedProfileMedia }>(
        '/media/members/profile',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return data.file;
    },
  });
};

interface TreeQueryParams {
  memberId?: string;
  depth?: number;
}

export interface MemberTreeResponse {
  root: MemberTreeNode;
  nodes: MemberTreeNode[];
  meta: { depthLimit: number; count: number };
}

export const useMemberTree = ({ memberId, depth = 3 }: TreeQueryParams, enabled = true) => {
  return useQuery({
    queryKey: memberId ? ['memberTree', memberId, depth] : ['memberTree', 'unknown'],
    queryFn: async () => {
      if (!memberId) throw new Error('memberId is required');
      const { data } = await apiClient.get<MemberTreeResponse>(`/members/${memberId}/tree`, {
        params: { depth },
      });
      return data;
    },
    enabled: Boolean(memberId) && enabled,
  });
};

interface CreateMemberPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  sponsorId: string;
  leg: 'LEFT' | 'RIGHT';
  profileImage?: string;
}

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMemberPayload) => {
      const { data } = await apiClient.post<{ member: MemberSummary }>('/members', payload);
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
    },
  });
};

interface UpdateMemberPayload {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  leg?: 'LEFT' | 'RIGHT' | '';
  profileImage?: string;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateMemberPayload) => {
      const { data } = await apiClient.patch<{ member: MemberSummary }>(`/members/${id}`, payload);
      return data.member;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: memberKey(variables.id) });
      }
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/members/${id}`);
      return id;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
      if (id) {
        queryClient.removeQueries({ queryKey: memberKey(id) });
      }
    },
  });
};
