import { useState, type FormEvent } from "react";
import { Button, Field, Input, Message } from "../../components/ui";
import { useCreateGoal } from "./api";

const macroFields = [
  { name: "calorieGoal", label: "Calories (kcal)", min: 1000 },
  { name: "proteinGoal", label: "Protein (g)", min: 0 },
  { name: "carbGoal", label: "Carbs (g)", min: 0 },
  { name: "fatGoal", label: "Fat (g)", min: 0 },
] as const;

export function GoalForm() {
  const createGoal = useCreateGoal();
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const num = (k: string) => Number(form.get(k));
    const goalName = String(form.get("goalName")).trim();
    setSuccess(null);
    try {
      await createGoal.mutateAsync({
        goalName,
        calorieGoal: num("calorieGoal"),
        proteinGoal: num("proteinGoal"),
        carbGoal: num("carbGoal"),
        fatGoal: num("fatGoal"),
      });
      setSuccess(`Goal "${goalName}" added successfully!`);
      formEl.reset();
    } catch {
      // error shown from mutation state
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-[#f8f8f8] p-5">
      <Field label="Goal Name (e.g., Maintain Weight)" id="goalName">
        <Input type="text" id="goalName" name="goalName" required />
      </Field>
      <h3 className="mb-3 text-lg font-semibold">Nutritional Targets</h3>
      <div className="grid grid-cols-2 gap-x-4 lg:grid-cols-4">
        {macroFields.map((f) => (
          <Field key={f.name} label={f.label} id={f.name}>
            <Input type="number" id={f.name} name={f.name} min={f.min} step="any" required />
          </Field>
        ))}
      </div>
      <Button type="submit" size="lg" disabled={createGoal.isPending}>
        {createGoal.isPending ? "Adding…" : "Add Goal"}
      </Button>
      {createGoal.isError && <Message tone="error">Error adding goal: {createGoal.error.message}</Message>}
      {success && <Message tone="success">{success}</Message>}
    </form>
  );
}
