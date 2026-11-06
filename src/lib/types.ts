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

export interface LoginResponse {
  token: string;
  user: { username: string };
}

export type Gender = "MALE" | "FEMALE";

export interface BodyProfile {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  trainingDaysPerWeek: number;
}

export type Profile = { [K in keyof BodyProfile]: BodyProfile[K] | null } & {
  onboardingCompleted: boolean;
  restingCalories: number | null;
  maintenanceCalories: number | null;
};

export type PlanType = "CUT" | "MAINTENANCE" | "BULK";

export interface PlanTargets {
  type: PlanType;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

export interface PlansResponse {
  maintenanceCalories: number;
  plans: PlanTargets[];
}
