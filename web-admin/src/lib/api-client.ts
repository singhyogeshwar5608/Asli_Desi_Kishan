import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { tokenStorage } from './token-storage';

interface AuthenticatedRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    refreshPromise = apiClient
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      })
      .then(({ data }) => {
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      })
      .catch((error) => {
        tokenStorage.clearTokens();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as AuthenticatedRequestConfig;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401) {
      tokenStorage.clearTokens();
    }

    return Promise.reject(error);
  }
);
