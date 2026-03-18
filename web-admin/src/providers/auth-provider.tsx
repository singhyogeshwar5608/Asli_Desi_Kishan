import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentMember, login as loginRequest, logout as logoutRequest } from '../features/auth/api';
import type { LoginPayload, Member } from '../features/auth/types';
import { tokenStorage } from '../lib/token-storage';

interface AuthContextValue {
  member: Member | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentMember()
      .then((data) => setMember(data))
      .catch(() => {
        tokenStorage.clearTokens();
        setMember(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const { member: loggedInMember } = await loginRequest(payload);
    setMember(loggedInMember);
  };

  const logout = () => {
    logoutRequest();
    setMember(null);
  };

  const value = useMemo(
    () => ({
      member,
      isLoading,
      login,
      logout,
    }),
    [member, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
