const ACCESS_TOKEN_KEY = 'netshop_access_token';
const REFRESH_TOKEN_KEY = 'netshop_refresh_token';

const isBrowser = () => typeof window !== 'undefined';

const setTokens = (accessToken: string, refreshToken: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const getAccessToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

const clearTokens = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const tokenStorage = {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
};
