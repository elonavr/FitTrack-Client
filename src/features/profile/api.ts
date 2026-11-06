import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../lib/api";
import { getToken } from "../../lib/session";
import type { BodyProfile, PlanType, PlansResponse, Profile } from "../../lib/types";
import { GOALS_KEY } from "../goals/api";

// Keyed by token so a different user logging in never sees a cached profile.
const profileKey = () => ["profile", getToken()];

export function useProfile() {
  return useQuery({
    queryKey: profileKey(),
    queryFn: () => apiCall<Profile>("/users/me"),
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyProfile) => apiCall<Profile>("/users/me/profile", "PUT", body),
    onSuccess: (profile) => {
      qc.setQueryData(profileKey(), profile);
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

/** Presets from the saved profile, or from `maintenanceCalories` when the profile was skipped. */
export function usePlans(maintenanceCalories: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["plans", getToken(), maintenanceCalories ?? null],
    queryFn: () =>
      apiCall<PlansResponse>(
        maintenanceCalories === undefined
          ? "/users/me/plans"
          : `/users/me/plans?maintenanceCalories=${maintenanceCalories}`
      ),
    enabled,
  });
}

/** Stores edited macros for one plan without making it the active plan. */
export function useSavePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, ...macros }: { type: PlanType; protein: number; carb: number; fat: number }) =>
      apiCall(`/users/me/plans/${type}`, "PUT", macros),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useChoosePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { type: PlanType; maintenanceCalories?: number }) =>
      apiCall("/users/me/plan", "POST", vars),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["profile"] }),
        qc.invalidateQueries({ queryKey: GOALS_KEY }),
      ]),
  });
}
