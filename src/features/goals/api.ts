import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../lib/api";
import type { GoalPlan, NewGoalPlan } from "../../lib/types";

const GOALS_KEY = ["goals"];

export function useGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async () => {
      const res = await apiCall<{ goals: GoalPlan[] } | GoalPlan[]>("/goals");
      return Array.isArray(res) ? res : res.goals ?? [];
    },
  });
}

function useGoalMutation<V>(fn: (vars: V) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export const useCreateGoal = () =>
  useGoalMutation((goal: NewGoalPlan) => apiCall("/goals", "POST", goal));

export const useSetGoalStatus = () =>
  useGoalMutation(({ id, active }: { id: number; active: boolean }) =>
    apiCall(`/goals/${id}/${active ? "activate" : "pause"}`, "PUT")
  );

export const useDeleteGoal = () =>
  useGoalMutation((id: number) => apiCall(`/goals/${id}`, "DELETE"));
