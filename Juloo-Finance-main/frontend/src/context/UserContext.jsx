import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setAccount(null);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("access");
    if (!token) {
      setUser(null);
      setAccount(null);
      setLoading(false);
      return;
    }

    try {
      const [profileRes, accountRes] = await Promise.all([
        api.get("auth/me/"),
        api.get("accounts/me/").catch((err) => {
          if (err.response?.status === 404) {
            return { data: null };
          }
          throw err;
        }),
      ]);

      setUser(profileRes.data);
      setAccount(accountRes?.data ?? null);
    } catch (_err) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const loginWithTokens = useCallback(
    async ({ access, refresh }) => {
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      await refreshData();
    },
    [refreshData]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = useMemo(
    () => ({
      user,
      account,
      hasAccount: Boolean(account),
      isAuthenticated: Boolean(user),
      loading,
      loginWithTokens,
      refreshData,
      logout,
    }),
    [user, account, loading, loginWithTokens, refreshData, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
