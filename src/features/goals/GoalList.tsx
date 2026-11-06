import { useState } from "react";
import { Button, Message } from "../../components/ui";
import type { GoalPlan } from "../../lib/types";
import { useDeleteGoal, useGoals, useSetGoalStatus } from "./api";

function GoalItem({ goal }: { goal: GoalPlan }) {
  const setStatus = useSetGoalStatus();
  const deleteGoal = useDeleteGoal();
  const [confirming, setConfirming] = useState(false);
  const isActive = goal.status === "ACTIVE";
  const error = setStatus.error ?? deleteGoal.error;
  const busy = setStatus.isPending || deleteGoal.isPending;

  return (
    <li
      className={
        "rounded-xl border border-gray-300 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg " +
        (isActive ? "border-l-[5px] border-l-active bg-[#f6fff8]" : "")
      }
    >
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-center">
        <div>
          <div className={"text-xl font-bold " + (isActive ? "text-active" : "text-primary")}>{goal.goalName}</div>
          <span
            className={
              "mt-1 inline-block rounded px-2 py-0.5 text-sm font-bold text-white " +
              (isActive ? "bg-active" : "bg-paused")
            }
          >
            {goal.status}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-primary">🔥 {Number(goal.calorieGoal)} kcal</div>
        </div>
        <div className="flex gap-4 font-semibold sm:flex-col sm:gap-1 sm:border-l sm:border-gray-200 sm:px-5">
          <div>P: {Number(goal.proteinGoal)}g</div>
          <div>C: {Number(goal.carbGoal)}g</div>
          <div>F: {Number(goal.fatGoal)}g</div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          {confirming ? (
            <>
              <span className="text-sm font-semibold">Delete this goal?</span>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" disabled={busy} onClick={() => deleteGoal.mutate(goal.id)}>
                  Yes, delete
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={isActive ? "paused" : "active"}
                disabled={busy}
                onClick={() => setStatus.mutate({ id: goal.id, active: !isActive })}
              >
                {isActive ? "SET PAUSED" : "SET ACTIVE"}
              </Button>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => setConfirming(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      {error && <Message tone="error">Operation failed: {error.message}</Message>}
    </li>
  );
}

export function GoalList() {
  const { data: goals, isPending, error } = useGoals();

  if (isPending) return <p>Loading goals...</p>;
  if (error) return <Message tone="error">Error loading goals: {error.message}</Message>;
  if (goals.length === 0) return <p>No goals found. Please add a new goal above.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {goals.map((g) => (
        <GoalItem key={g.id} goal={g} />
      ))}
    </ul>
  );
}
