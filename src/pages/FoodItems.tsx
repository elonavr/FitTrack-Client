import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, buttonClass, Card, Field, Header, Input, Message } from "../components/ui";
import { useCreateFoodItem, useFoodItems } from "../features/foodItems/api";
import type { NewFoodItem } from "../lib/types";

const MACRO_FIELDS = [
  { key: "caloriesPerServing", label: "Calories (kcal)" },
  { key: "proteinPerServing", label: "Protein (g)" },
  { key: "carbPerServing", label: "Carbs (g)" },
  { key: "fatPerServing", label: "Fat (g)" },
] as const;

const EMPTY_FORM: Record<keyof NewFoodItem, string> = {
  foodName: "",
  caloriesPerServing: "",
  proteinPerServing: "",
  carbPerServing: "",
  fatPerServing: "",
};

function AddFoodItemCard() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState<string | null>(null);
  const create = useCreateFoodItem();

  const set = (key: keyof NewFoodItem, value: string) => {
    setSuccess(null);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      { ...form, foodName: form.foodName.trim() },
      {
        onSuccess: (item) => {
          setForm(EMPTY_FORM);
          setSuccess(`"${item.foodName}" added.`);
        },
      }
    );
  };

  return (
    <Card title="➕ Add Food Item">
      <form onSubmit={onSubmit}>
        <Field label="Food name" id="foodName">
          <Input
            id="foodName"
            required
            value={form.foodName}
            onChange={(e) => set("foodName", e.target.value)}
          />
        </Field>
        <p className="mb-3 text-sm text-secondary">Nutrition per serving:</p>
        <div className="grid grid-cols-2 gap-x-4">
          {MACRO_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label} id={key}>
              <Input
                id={key}
                type="number"
                min={0}
                step="any"
                required
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? "Adding…" : "Add Food Item"}
        </Button>
        {create.isError && <Message tone="error">{create.error.message}</Message>}
        {success && <Message tone="success">{success}</Message>}
      </form>
    </Card>
  );
}

function FoodItemsListCard() {
  const { data, isPending, isError, error } = useFoodItems();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const items = (data ?? [])
    .filter((item) => item.foodName.toLowerCase().includes(query))
    .sort((a, b) => a.foodName.localeCompare(b.foodName));

  return (
    <Card title="🥗 My Food Items" className="md:col-span-2">
      <Field label="Search" id="food-search">
        <Input
          id="food-search"
          type="search"
          placeholder="Filter by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Field>
      {isPending && <p className="text-secondary">Loading food items…</p>}
      {isError && <p className="text-danger">{error.message}</p>}
      {!isPending && !isError && items.length === 0 && (
        <p className="text-secondary">
          {data.length === 0 ? "No food items yet. Add your first one!" : "No food items match your search."}
        </p>
      )}
      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 text-sm text-secondary">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">kcal</th>
                <th className="py-2 pr-4">Protein</th>
                <th className="py-2 pr-4">Carbs</th>
                <th className="py-2">Fat</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 font-semibold">{item.foodName}</td>
                  <td className="py-2 pr-4">{Number(item.caloriesPerServing)}</td>
                  <td className="py-2 pr-4">{Number(item.proteinPerServing)}g</td>
                  <td className="py-2 pr-4">{Number(item.carbPerServing)}g</td>
                  <td className="py-2">{Number(item.fatPerServing)}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function FoodItems() {
  const { logout } = useAuth();

  return (
    <>
      <Header>
        <Link to="/dashboard" className={buttonClass("outline", "sm")}>
          Dashboard
        </Link>
        <Link to="/scan" className={buttonClass("outline", "sm")}>
          Scan
        </Link>
        <Button onClick={logout}>Log Out</Button>
      </Header>

      <main className="mx-auto grid max-w-6xl gap-8 px-[5%] py-8 md:grid-cols-3">
        <AddFoodItemCard />
        <FoodItemsListCard />
      </main>
    </>
  );
}
