import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useProfile } from "../features/profile/api";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Sends users who haven't finished onboarding to the welcome flow. Nest inside ProtectedRoute. */
export function OnboardedRoute() {
  const { data, isPending, isError } = useProfile();
  if (isPending) return <p className="p-8 text-center text-secondary">Loading…</p>;
  if (!isError && !data.onboardingCompleted) return <Navigate to="/welcome" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
