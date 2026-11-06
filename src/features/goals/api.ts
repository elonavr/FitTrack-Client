import { useQuery } from "@tanstack/react-query";
import { apiCall } from "../../lib/api";
import type { GoalPlan } from "../../lib/types";

export const GOALS_KEY = ["goals"];

export function useGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async () => {
      const res = await apiCall<{ goals: GoalPlan[] } | GoalPlan[]>("/goals");
      return Array.isArray(res) ? res : res.goals ?? [];
    },
  });
}

export function useActiveGoal() {
  const query = useGoals();
  return { ...query, data: query.data?.find((g) => g.status === "ACTIVE") };
}
