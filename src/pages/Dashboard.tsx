import { useAuth } from "../auth/AuthContext";
import { Button, Card, Field, Header, Input } from "../components/ui";
import { Link } from "react-router-dom";
import { buttonClass } from "../components/ui";
import { useActiveGoal } from "../features/goals/api";

function PlanCard() {
  const { data: goal, isPending, isError, error } = useActiveGoal();
  return (
    <Card title="🎯 Your Plan" className="md:col-span-2">
      {isPending && <p className="text-secondary">Loading your plan…</p>}
      {isError && <p className="text-danger">{error.message}</p>}
      {!isPending && !isError && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {goal ? (
            <div>
              <p className="text-xl font-semibold">
                {goal.goalName} · <span className="text-primary">{Number(goal.calorieGoal)} kcal</span>
              </p>
              <p className="text-secondary">
                Protein {Number(goal.proteinGoal)}g · Carbs {Number(goal.carbGoal)}g · Fat {Number(goal.fatGoal)}g
              </p>
            </div>
          ) : (
            <p className="text-secondary">No active plan yet.</p>
          )}
          <Link to="/welcome?step=plan" className={buttonClass("outline", "sm")}>
            {goal ? "Change plan" : "Choose a plan"}
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { userName, logout } = useAuth();

  return (
    <>
      <Header>
        <h3 className="text-lg font-semibold">{userName ? `Hello, ${userName}!` : "Hello!"}</h3>
        <Link to="/food-items" className={buttonClass("outline", "sm")}>
          Food Items
        </Link>
        <Button onClick={logout}>Log Out</Button>
      </Header>

      <main className="mx-auto grid max-w-6xl gap-8 px-[5%] py-8 md:grid-cols-2">
        <PlanCard />

        {/* Placeholders carried over from the static dashboard; not wired to the API yet. */}
        <Card title="🎯 Daily Goal Status">
          <div className="mb-6 rounded bg-[#f8f8f8] p-4">
            <p>Loading your current goals...</p>
          </div>
          <Button size="lg" disabled>Reset Day Goals</Button>
        </Card>

        <Card title="🍽️ Log Your Meal">
          <form onSubmit={(e) => e.preventDefault()}>
            <p className="mb-3">Select a food and quantity:</p>
            <Field label="Food Item ID (e.g., 1)" id="food-item">
              <Input type="number" id="food-item" defaultValue={1} />
            </Field>
            <Field label="Quantity (Servings)" id="quantity">
              <Input type="number" id="quantity" defaultValue={1} />
            </Field>
            <Button type="submit" size="lg" disabled>Add to Tracker</Button>
          </form>
        </Card>

        <Card title="📊 Recent Activity">
          <p>Your last logged meals will appear here.</p>
        </Card>
      </main>
    </>
  );
}
