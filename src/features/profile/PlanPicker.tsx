import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Field, Input, Message } from "../../components/ui";
import type { PlanTargets, PlanType } from "../../lib/types";
import { useGoals } from "../goals/api";
import { useChoosePlan, usePlans, useSavePlan } from "./api";

// Ranges mirror the API validation in FitTrack-API profile.controller.ts.
const MIN_CALORIES = 800;
const MAX_CALORIES = 6000;
const MAX_MACRO_GRAMS = 1000;
const ARROW_STEP = 50; // arrow keys / spinner move by this; typing any value still works
const KCAL = { protein: 4, carb: 4, fat: 9 } as const;

type Macro = keyof typeof KCAL;
type Macros = Record<Macro, number>;

const PLAN_COPY: Record<PlanType, { title: string; blurb: string }> = {
  CUT: { title: "Cut", blurb: "Lose fat with a moderate calorie deficit." },
  MAINTENANCE: { title: "Maintenance", blurb: "Hold your current weight." },
  BULK: { title: "Bulk", blurb: "Build muscle with a small surplus." },
};

const MACRO_LABELS: Record<Macro, string> = { protein: "Protein (g)", carb: "Carbs (g)", fat: "Fat (g)" };

const sumCalories = (m: Macros) => m.protein * KCAL.protein + m.carb * KCAL.carb + m.fat * KCAL.fat;

/** `manual`: the profile was skipped, so the user supplies maintenance calories. */
export function PlanPicker({ manual }: { manual: boolean }) {
  const navigate = useNavigate();
  const [rawMaintenance, setRawMaintenance] = useState("");
  const typed = Number(rawMaintenance);
  const maintenanceValid =
    rawMaintenance !== "" && Number.isFinite(typed) && typed >= MIN_CALORIES && typed <= MAX_CALORIES;
  const maintenance = manual && maintenanceValid ? Math.round(typed) : undefined;

  const plans = usePlans(maintenance, !manual || maintenanceValid);
  const { data: goals } = useGoals();
  const choose = useChoosePlan();

  function chooseType(type: PlanType, macros?: Macros) {
    choose.mutate(
      { type, maintenanceCalories: maintenance, ...macros },
      { onSuccess: () => navigate("/dashboard") }
    );
  }

  return (
    <div>
      {manual && (
        <Field label="Your maintenance calories (kcal/day)" id="maintenance">
          <Input
            type="number"
            id="maintenance"
            inputMode="numeric"
            min={MIN_CALORIES}
            max={MAX_CALORIES}
            placeholder="e.g. 2200"
            value={rawMaintenance}
            onChange={(e) => setRawMaintenance(e.target.value)}
          />
          {rawMaintenance !== "" && !maintenanceValid && (
            <p className="mt-1 text-sm text-danger">
              Enter a value between {MIN_CALORIES} and {MAX_CALORIES}.
            </p>
          )}
        </Field>
      )}

      {plans.data && (
        <ul className="grid gap-3">
          {plans.data.plans.map((p) => {
            const current = goals?.find((g) => g.goalName === PLAN_COPY[p.type].title); // saved version, any status
            return (
              <li key={p.type}>
                <PlanCard
                  preset={p}
                  saved={
                    current && {
                      protein: Number(current.proteinGoal),
                      carb: Number(current.carbGoal),
                      fat: Number(current.fatGoal),
                    }
                  }
                  savedCalories={current && Number(current.calorieGoal)
                  }
                  isCurrent={current?.status === "ACTIVE"}
                  busy={choose.isPending}
                  onChoose={(macros) => chooseType(p.type, macros)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {plans.isLoading && <p className="text-secondary">Calculating plans…</p>}
      {plans.isError && <Message tone="error">{plans.error.message}</Message>}
      {choose.isError && <Message tone="error">{choose.error.message}</Message>}
      <p className="mt-4 text-xs text-secondary">Estimates only, not medical advice.</p>
    </div>
  );
}

function PlanCard({
  preset,
  saved,
  savedCalories,
  isCurrent,
  busy,
  onChoose,
}: {
  preset: PlanTargets;
  saved?: Macros;
  savedCalories?: number;
  isCurrent: boolean;
  busy: boolean;
  onChoose: (macros?: Macros) => void;
}) {
  const start: Macros = saved ?? { protein: preset.protein, carb: preset.carb, fat: preset.fat };
  const [editing, setEditing] = useState(false);
  const savePlan = useSavePlan();
  const [rawCalories, setRawCalories] = useState<string | null>(null); // text while typing in the calories box
  const [macros, setMacros] = useState<Record<Macro, string>>({
    protein: String(start.protein),
    carb: String(start.carb),
    fat: String(start.fat),
  });

  const parsed = Object.fromEntries(
    (Object.keys(KCAL) as Macro[]).map((k) => [k, Number(macros[k])])
  ) as Macros;
  const macrosValid = (Object.keys(KCAL) as Macro[]).every(
    (k) => macros[k] !== "" && Number.isInteger(parsed[k]) && parsed[k] >= 0 && parsed[k] <= MAX_MACRO_GRAMS
  );
  const calories = macrosValid ? sumCalories(parsed) : null;
  const caloriesValid = calories !== null && calories >= MIN_CALORIES && calories <= MAX_CALORIES;
  const shown = editing ? calories : savedCalories ?? preset.calories;
  const shownMacros = editing ? parsed : start;

  function cancel() {
    setMacros({ protein: String(start.protein), carb: String(start.carb), fat: String(start.fat) });
    setRawCalories(null);
    savePlan.reset();
    setEditing(false);
  }

  /** Editing calories keeps protein and fat and lets carbs absorb the difference. */
  function onCaloriesChange(raw: string) {
    setRawCalories(raw);
    const kcal = Number(raw);
    if (raw === "" || !Number.isFinite(kcal)) return;
    const rest = kcal - parsed.protein * KCAL.protein - parsed.fat * KCAL.fat;
    setMacros((m) => ({ ...m, carb: String(Math.max(0, Math.round(rest / KCAL.carb))) }));
  }

  const { title, blurb } = PLAN_COPY[preset.type];

  return (
    <div
      className={`rounded-xl border-2 p-4 transition ${
        isCurrent || editing ? "border-primary" : "border-gray-200"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold">
          {title}
          {isCurrent && <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Current</span>}
          {!isCurrent && saved && <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-secondary">Saved</span>}
        </span>
        <span className="text-lg font-semibold text-primary">{shown ?? "—"} kcal</span>
      </div>
      <p className="text-sm text-secondary">{blurb}</p>

      {editing ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm font-semibold">
            Calories (kcal)
            <Input
              type="number"
              inputMode="numeric"
              step={ARROW_STEP}
              value={rawCalories ?? calories ?? ""}
              onChange={(e) => onCaloriesChange(e.target.value)}
              onBlur={() => setRawCalories(null)}
              className="mt-1"
            />
          </label>
          {(Object.keys(KCAL) as Macro[]).map((k) => (
            <label key={k} className={`text-sm font-semibold ${k === "fat" ? "col-span-2" : ""}`}>
              {MACRO_LABELS[k]}
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_MACRO_GRAMS}
                step={ARROW_STEP}
                value={macros[k]}
                onChange={(e) => {
                  setRawCalories(null);
                  setMacros((m) => ({ ...m, [k]: e.target.value }));
                }}
                className="mt-1"
              />
            </label>
          ))}
          {!macrosValid && (
            <p className="col-span-2 text-sm text-danger">Grams must be whole numbers from 0 to {MAX_MACRO_GRAMS}.</p>
          )}
          {macrosValid && !caloriesValid && (
            <p className="col-span-2 text-sm text-danger">
              Total must be between {MIN_CALORIES} and {MAX_CALORIES} kcal.
            </p>
          )}
          {savePlan.isError && (
            <p className="col-span-2 text-sm text-danger">{savePlan.error.message}</p>
          )}
          <div className="col-span-2 flex gap-2">
            <Button
              size="sm"
              disabled={busy || savePlan.isPending || !caloriesValid}
              onClick={() => savePlan.mutate({ type: preset.type, ...parsed }, { onSuccess: () => setEditing(false) })}
            >
              {savePlan.isPending ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm">
            Protein {shownMacros.protein}g · Carbs {shownMacros.carb}g · Fat {shownMacros.fat}g
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => onChoose(saved)}>
              {isCurrent ? "Keep" : "Choose"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Customize
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
