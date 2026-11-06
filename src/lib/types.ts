export type GoalStatus = "ACTIVE" | "PAUSED" | "DRAFT" | "COMPLETED";

// Prisma Decimal fields serialize as strings in JSON.
type Decimal = string | number;

export interface GoalPlan {
  id: number;
  goalName: string;
  calorieGoal: Decimal;
  proteinGoal: Decimal;
  carbGoal: Decimal;
  fatGoal: Decimal;
  status: GoalStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface NewGoalPlan {
  goalName: string;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface LoginResponse {
  token: string;
  user: { username: string };
}
