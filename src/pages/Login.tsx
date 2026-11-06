import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthLayout, Button, Field, Input, Message } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password")).trim();
    if (!email || !password) return setError("You must fill all fields.");

    setError(null);
    setSubmitting(true);
    try {
      await login(email, password); // GuestRoute redirects to /dashboard once the session is saved
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to track your fitness progress.">
      <form onSubmit={onSubmit} className="mt-4">
        <Field label="Email Address" id="email">
          <Input type="email" id="email" name="email" placeholder="enter your email" autoComplete="email" required />
        </Field>
        <Field label="Password" id="password">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-lg"
            >
              {showPassword ? "🔒" : "👁️"}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Logging in…" : "Log In"}
        </Button>
        {error && <Message tone="error">{error}</Message>}
      </form>
      <p className="mt-6 text-center text-[0.95rem]">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
      </p>
    </AuthLayout>
  );
}
