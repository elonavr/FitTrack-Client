import { useCallback, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, buttonClass, Card, Field, Header, Input, Message } from "../components/ui";
import ScannerButton from "../components/ScannerButton";
import { useLookupProduct } from "../features/products/api";
import { useCreateFoodItem } from "../features/foodItems/api";
import { ApiError } from "../lib/api";
import type { NewFoodItem, ScannedProduct } from "../lib/types";

const MACROS = [
  { key: "caloriesPerServing", from: "calories", label: "Calories (kcal)" },
  { key: "proteinPerServing", from: "protein", label: "Protein (g)" },
  { key: "carbPerServing", from: "carb", label: "Carbs (g)" },
  { key: "fatPerServing", from: "fat", label: "Fat (g)" },
] as const;

type Form = Record<keyof NewFoodItem, string>;

function toForm(p: ScannedProduct): Form {
  const showBrand = p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase());
  const form = { foodName: showBrand ? `${p.name} – ${p.brand}` : p.name } as Form;
  for (const m of MACROS) form[m.key] = p.per100g[m.from]?.toString() ?? "";
  return form;
}

const isComplete = (f: Form) => Object.values(f).every((v) => v.trim() !== "");

type CreateFoodItem = ReturnType<typeof useCreateFoodItem>;

function ProductResult({ product, create }: { product: ScannedProduct; create: CreateFoodItem }) {
  const [form, setForm] = useState(() => toForm(product));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form, foodName: form.foodName.trim() });
  };

  const duplicate = create.error instanceof ApiError && create.error.status === 409;

  return (
    <Card title="🔎 Scanned product" className="md:col-span-2">
      <div className="mb-4 flex gap-4">
        {product.imageUrl && (
          <img src={product.imageUrl} alt="" className="h-24 w-24 rounded object-contain" />
        )}
        <div>
          <p className="font-semibold">{product.name}</p>
          {product.brand && <p className="text-secondary">{product.brand}</p>}
          <p className="text-sm text-secondary">Barcode {product.barcode} · values per 100g</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <Field label="Food name" id="scan-name">
          <Input
            id="scan-name"
            required
            value={form.foodName}
            onChange={(e) => setForm({ ...form, foodName: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-x-4">
          {MACROS.map(({ key, label }) => (
            <Field key={key} label={label} id={`scan-${key}`}>
              <Input
                id={`scan-${key}`}
                type="number"
                min={0}
                step="any"
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
        </div>
        {!create.isSuccess && !duplicate && (
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add to my foods"}
          </Button>
        )}
      </form>

      {create.isSuccess && (
        <Message tone="success">
          Added to your foods.{" "}
          <Link to="/food-items" className="underline">
            View food items
          </Link>
        </Message>
      )}
      {duplicate && <Message tone="success">Already in your foods.</Message>}
      {create.isError && !duplicate && <Message tone="error">{create.error.message}</Message>}
    </Card>
  );
}

export default function Scan() {
  const { logout } = useAuth();
  const [manual, setManual] = useState("");
  const lookup = useLookupProduct();
  const create = useCreateFoodItem();
  const { mutate: lookupMutate } = lookup;
  const { mutate: createMutate, reset: createReset } = create;

  // Scan → look up → auto-add when Open Food Facts gave every value; otherwise the user fills the gaps.
  const onScan = useCallback(
    (code: string) => {
      createReset();
      lookupMutate(code, {
        onSuccess: (product) => {
          const form = toForm(product);
          if (isComplete(form)) createMutate(form);
        },
      });
    },
    [lookupMutate, createMutate, createReset]
  );
  const barcode = lookup.variables;

  return (
    <>
      <Header>
        <Link to="/dashboard" className={buttonClass("outline", "sm")}>
          Dashboard
        </Link>
        <Link to="/food-items" className={buttonClass("outline", "sm")}>
          Food Items
        </Link>
        <Button onClick={logout}>Log Out</Button>
      </Header>

      <main className="mx-auto grid max-w-6xl gap-8 px-[5%] py-8 md:grid-cols-3">
        <Card title="📷 Scan a product">
          <ScannerButton onScan={onScan} />
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              onScan(manual.trim());
            }}
          >
            <Field label="…or type the barcode" id="manual-barcode">
              <Input
                id="manual-barcode"
                inputMode="numeric"
                pattern="\d{8,14}"
                title="8 to 14 digits"
                required
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
            </Field>
            <Button type="submit" size="sm">
              Look up
            </Button>
          </form>
          <p className="mt-6 text-xs text-secondary">
            Product data from{" "}
            <a className="underline" href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">
              Open Food Facts
            </a>
            , available under the{" "}
            <a
              className="underline"
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              target="_blank"
              rel="noreferrer"
            >
              ODbL
            </a>
            .
          </p>
        </Card>

        {lookup.isPending && <p className="text-secondary">Looking up {barcode}…</p>}
        {lookup.isError && (
          <Card title="Not found" className="md:col-span-2">
            <p className="text-secondary">
              {lookup.error instanceof ApiError && lookup.error.status === 404
                ? `Barcode ${barcode} isn't in Open Food Facts yet.`
                : lookup.error.message}
            </p>
          </Card>
        )}
        {lookup.data && (
          <ProductResult key={lookup.data.barcode} product={lookup.data} create={create} />
        )}
      </main>
    </>
  );
}
