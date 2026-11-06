import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthLayout, Button, Field, Input, Message } from "../components/ui";
import { PlanPicker } from "../features/profile/PlanPicker";
import { useProfile, useSaveProfile } from "../features/profile/api";
import type { BodyProfile, Gender } from "../lib/types";

type NumericKey = Exclude<keyof BodyProfile, "gender">;

interface NumericStep {
  key: NumericKey;
  title: string;
  label: string;
  min: number;
  max: number;
  integer?: boolean;
}

// Ranges mirror the API validation in FitTrack-API profile.controller.ts.
const NUMERIC_STEPS: NumericStep[] = [
  { key: "age", title: "How old are you?", label: "Age (years)", min: 13, max: 100, integer: true },
  { key: "heightCm", title: "How tall are you?", label: "Height (cm)", min: 100, max: 250 },
  { key: "weightKg", title: "What do you weigh?", label: "Weight (kg)", min: 30, max: 300 },
  {
    key: "trainingDaysPerWeek",
    title: "How often do you train?",
    label: "Training days per week",
    min: 0,
    max: 7,
    integer: true,
  },
];

const PROFILE_STEPS = 1 + NUMERIC_STEPS.length; // gender + numeric steps
type Step = number | "result" | "plan"; // 0 = gender, 1..N = numeric steps

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export default function Welcome() {
  const [params] = useSearchParams();
  const profile = useProfile();
  const save = useSaveProfile();
  const [step, setStep] = useState<Step>(params.get("step") === "plan" ? "plan" : 0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [values, setValues] = useState<Partial<Record<NumericKey, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const skip = () => setStep("plan");
  const back = () => {
    setError(null);
    if (typeof step === "number" && step > 0) setStep(step - 1);
  };

  function onSubmitNumeric(e: FormEvent<HTMLFormElement>, s: NumericStep, index: number) {
    e.preventDefault();
    const n = Number(values[s.key]);
    if (values[s.key] === undefined || values[s.key] === "" || !Number.isFinite(n) || n < s.min || n > s.max ||
        (s.integer && !Number.isInteger(n))) {
      return setError(`Enter ${s.integer ? "a whole number" : "a value"} between ${s.min} and ${s.max}.`);
    }
    setError(null);
    if (index < NUMERIC_STEPS.length - 1) return setStep(index + 2);

    const body = Object.fromEntries(NUMERIC_STEPS.map((x) => [x.key, Number(values[x.key])])) as Record<
      NumericKey,
      number
    >;
    save.mutate({ gender: gender!, ...body }, { onSuccess: () => setStep("result") });
  }

  if (step === "plan") {
    return (
      <AuthLayout title="Choose your plan" subtitle="Pick a starting target. You can change it any time.">
        {profile.isPending ? (
          <p className="text-secondary">Loading…</p>
        ) : (
          <PlanPicker manual={profile.data?.maintenanceCalories == null} />
        )}
      </AuthLayout>
    );
  }

  if (step === "result") {
    const p = save.data ?? profile.data;
    return (
      <AuthLayout title="Your energy needs" subtitle="Estimated from your answers.">
        <dl className="mb-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-surface p-4">
            <dt className="text-sm text-secondary">At rest</dt>
            <dd className="text-2xl font-semibold">{p?.restingCalories} kcal</dd>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <dt className="text-sm text-secondary">Maintenance</dt>
            <dd className="text-2xl font-semibold text-primary">{p?.maintenanceCalories} kcal</dd>
          </div>
        </dl>
        <Button size="lg" onClick={() => setStep("plan")}>Choose a plan</Button>
      </AuthLayout>
    );
  }

  const progress = (
    <div className="mb-6 flex justify-center gap-2" aria-label={`Step ${step + 1} of ${PROFILE_STEPS}`}>
      {Array.from({ length: PROFILE_STEPS }, (_, i) => (
        <span key={i} className={`h-2 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-gray-200"}`} />
      ))}
    </div>
  );

  const footer = (submitLabel: string, disabled: boolean) => (
    <>
      <Button type="submit" size="lg" disabled={disabled}>{submitLabel}</Button>
      <div className="mt-4 flex justify-between text-sm">
        <button type="button" onClick={back} disabled={step === 0} className="text-secondary disabled:invisible">
          ← Back
        </button>
        <button type="button" onClick={skip} className="font-semibold text-primary hover:underline">
          Skip
        </button>
      </div>
      {(error || save.error) && <Message tone="error">{error ?? save.error?.message}</Message>}
    </>
  );

  if (step === 0) {
    return (
      <AuthLayout title="Welcome to FitTrack" subtitle="A few quick questions to estimate your daily calories.">
        {progress}
        <form onSubmit={(e) => { e.preventDefault(); if (gender) setStep(1); }}>
          <fieldset className="mb-5">
            <legend className="mb-2 font-semibold">Gender</legend>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map((g) => (
                <label
                  key={g.value}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-center font-semibold transition ${
                    gender === g.value ? "border-primary text-primary" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g.value}
                    checked={gender === g.value}
                    onChange={() => setGender(g.value)}
                    className="sr-only"
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </fieldset>
          {footer("Next", !gender)}
        </form>
      </AuthLayout>
    );
  }

  const index = step - 1;
  const s = NUMERIC_STEPS[index];
  const isLast = index === NUMERIC_STEPS.length - 1;
  return (
    <AuthLayout title={s.title} subtitle="Used only to estimate your calories.">
      {progress}
      <form key={s.key} onSubmit={(e) => onSubmitNumeric(e, s, index)} noValidate>
        <Field label={s.label} id={s.key}>
          <Input
            type="number"
            id={s.key}
            inputMode={s.integer ? "numeric" : "decimal"}
            min={s.min}
            max={s.max}
            step={s.integer ? 1 : "any"}
            value={values[s.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
            autoFocus
          />
        </Field>
        {footer(isLast ? (save.isPending ? "Calculating…" : "Calculate") : "Next", save.isPending)}
      </form>
    </AuthLayout>
  );
}
