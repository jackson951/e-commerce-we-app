"use client";

import { api } from "@/lib/api";
import { AuthResponse, AuthUser } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

type ViewMode = "ADMIN" | "CUSTOMER";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  viewMode: ViewMode;
  hasAdminRole: boolean;
  isAdmin: boolean;
  effectiveCustomerId: number | null;
  canUseCustomerFeatures: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "ecommerce_auth";
const VIEW_MODE_KEY = "ecommerce_view_mode";

function userHasAdminRole(user: AuthUser | null) {
  return user?.roles?.includes("ROLE_ADMIN") ?? false;
}

function normalizeViewMode(user: AuthUser | null, preferred?: string | null): ViewMode {
  if (!userHasAdminRole(user)) return "CUSTOMER";
  return preferred === "CUSTOMER" ? "CUSTOMER" : "ADMIN";
}

function readStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

function persistAuth(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<ViewMode>("CUSTOMER");
  const [fallbackCustomerId, setFallbackCustomerId] = useState<number | null>(null);
  const [fallbackProbeDoneForUserId, setFallbackProbeDoneForUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    setUserState(stored.user);
    setToken(stored.accessToken);
    setFallbackCustomerId(stored.user.customerId ?? null);
    setFallbackProbeDoneForUserId(null);
    setViewModeState(normalizeViewMode(stored.user, localStorage.getItem(VIEW_MODE_KEY)));
    api
      .me(stored.accessToken)
      .then((nextUser) => {
        setUserState(nextUser);
        setFallbackCustomerId(nextUser.customerId ?? null);
        setFallbackProbeDoneForUserId(null);
        setViewModeState((prev) => normalizeViewMode(nextUser, prev));
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VIEW_MODE_KEY);
        setUserState(null);
        setToken(null);
        setViewModeState("CUSTOMER");
        setFallbackCustomerId(null);
        setFallbackProbeDoneForUserId(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const auth = await api.login(email, password);
    persistAuth(auth);
    setUserState(auth.user);
    setToken(auth.accessToken);
    setFallbackCustomerId(auth.user.customerId ?? null);
    setFallbackProbeDoneForUserId(null);
    const nextViewMode = normalizeViewMode(auth.user, localStorage.getItem(VIEW_MODE_KEY));
    localStorage.setItem(VIEW_MODE_KEY, nextViewMode);
    setViewModeState(nextViewMode);
  };

  const register = async (payload: RegisterPayload) => {
    const auth = await api.register(payload);
    persistAuth(auth);
    setUserState(auth.user);
    setToken(auth.accessToken);
    setFallbackCustomerId(auth.user.customerId ?? null);
    setFallbackProbeDoneForUserId(null);
    const nextViewMode = normalizeViewMode(auth.user, localStorage.getItem(VIEW_MODE_KEY));
    localStorage.setItem(VIEW_MODE_KEY, nextViewMode);
    setViewModeState(nextViewMode);
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const current = readStoredAuth();
    const nextUser = await api.me(token);
    setUserState(nextUser);
    setFallbackCustomerId(nextUser.customerId ?? null);
    setFallbackProbeDoneForUserId(null);
    setViewModeState((prev) => normalizeViewMode(nextUser, prev));
    if (current) {
      persistAuth({
        ...current,
        user: nextUser,
        accessToken: token
      });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
    setUserState(null);
    setToken(null);
    setViewModeState("CUSTOMER");
    setFallbackCustomerId(null);
    setFallbackProbeDoneForUserId(null);
  };

  const setUser = (nextUser: AuthUser | null) => {
    setUserState(nextUser);
    setFallbackCustomerId(nextUser?.customerId ?? null);
    setFallbackProbeDoneForUserId(null);
    setViewModeState((prev) => normalizeViewMode(nextUser, prev));
  };

  const setViewMode = useCallback(
    (nextMode: ViewMode) => {
      const normalized = normalizeViewMode(user, nextMode);
      setViewModeState(normalized);
      localStorage.setItem(VIEW_MODE_KEY, normalized);
    },
    [user]
  );

  const toggleViewMode = useCallback(() => {
    if (!userHasAdminRole(user)) return;
    const nextMode: ViewMode = viewMode === "ADMIN" ? "CUSTOMER" : "ADMIN";
    setViewModeState(nextMode);
    localStorage.setItem(VIEW_MODE_KEY, nextMode);
  }, [user, viewMode]);

  const hasAdminRole = userHasAdminRole(user);
  const isAdmin = hasAdminRole && viewMode === "ADMIN";
  const effectiveCustomerId = viewMode === "CUSTOMER" ? user?.customerId ?? fallbackCustomerId ?? null : null;
  const canUseCustomerFeatures = Boolean(effectiveCustomerId);

  useEffect(() => {
    const canProbeFallback =
      Boolean(token) &&
      viewMode === "CUSTOMER" &&
      Boolean(user?.id) &&
      userHasAdminRole(user) &&
      !user?.customerId &&
      fallbackProbeDoneForUserId !== user?.id;

    if (!canProbeFallback || !token || !user?.id) return;

    setFallbackProbeDoneForUserId(user.id);
    api
      .getCustomer(token, user.id)
      .then((customer) => {
        setFallbackCustomerId(customer.id);
      })
      .catch(() => {
        setFallbackCustomerId(null);
      });
  }, [token, user, viewMode, fallbackProbeDoneForUserId]);

  const value = {
    user,
    token,
    loading,
    viewMode,
    hasAdminRole,
    isAdmin,
    effectiveCustomerId,
    canUseCustomerFeatures,
    login,
    register,
    refreshUser,
    setUser,
    setViewMode,
    toggleViewMode,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
