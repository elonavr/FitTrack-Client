import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { apiCall } from "../lib/api";
import { clearSession, getToken, getUserName, saveSession, subscribe } from "../lib/session";
import type { LoginResponse } from "../lib/types";

interface AuthValue {
  isAuthenticated: boolean;
  userName: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

async function login(email: string, password: string) {
  const res = await apiCall<LoginResponse>("/users/login", "POST", { email, password });
  if (!res.token || !res.user?.username) {
    throw new Error("Login failed: Missing authentication token.");
  }
  saveSession(res.token, res.user.username);
}

async function signup(username: string, email: string, password: string) {
  const res = await apiCall<LoginResponse>("/users/signup", "POST", { username, email, password });
  if (!res.token || !res.user?.username) {
    throw new Error("Sign up failed: Missing authentication token.");
  }
  saveSession(res.token, res.user.username); // GuestRoute then moves the user into the app
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribe, getToken);
  const userName = useSyncExternalStore(subscribe, getUserName);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, userName, login, signup, logout: clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
