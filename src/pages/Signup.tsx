import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthLayout, Button, Field, Input, Message } from "../components/ui";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    const password = String(form.get("password")).trim();
    if (!username || !email || !password) return setError("You must fill all fields.");

    setError(null);
    setSubmitting(true);
    try {
      await signup(username, email, password);
      navigate("/login", { state: { signedUp: true } });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Start Your Journey" subtitle="Create your FitTrack account to begin tracking your goals.">
      <form onSubmit={onSubmit}>
        <Field label="Full Name" id="name">
          <Input type="text" id="name" name="name" placeholder="John Doe" autoComplete="name" required />
        </Field>
        <Field label="Email Address" id="email">
          <Input type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
        </Field>
        <Field label="Password" id="password">
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="•••••••• (min 8 characters)"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </Field>
        <div className="mb-5 flex items-center gap-2">
          <input type="checkbox" id="terms" required className="h-4 w-4 accent-primary" />
          <label htmlFor="terms">
            I agree to the <a href="#" className="text-primary">Terms and Conditions</a>
          </label>
        </div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign Up"}
        </Button>
        {error && <Message tone="error">{error}</Message>}
      </form>
      <p className="mt-6 text-center text-[0.95rem]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">Log In</Link>
      </p>
    </AuthLayout>
  );
}
