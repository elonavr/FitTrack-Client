import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cx("font-bold tracking-wide text-primary no-underline", className ?? "text-3xl")}>
      FitTrack
    </Link>
  );
}

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-white px-[5%] py-4 shadow">
      <Logo />
      <nav className="flex flex-wrap items-center gap-3">{children}</nav>
    </header>
  );
}

type Variant = "primary" | "outline" | "active" | "paused" | "danger";

const variants: Record<Variant, string> = {
  primary: "border-primary bg-primary text-white hover:border-primary-dark hover:bg-primary-dark",
  outline: "border-primary bg-transparent text-primary hover:opacity-90",
  active: "border-active bg-active text-white hover:opacity-90",
  paused: "border-paused bg-paused text-white hover:opacity-90",
  danger: "border-danger bg-danger text-white hover:bg-danger-dark",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-4 py-2",
  lg: "w-full px-5 py-3 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: keyof typeof sizes = "md") {
  return cx(
    "inline-block rounded-lg border-2 text-center font-semibold no-underline transition disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size]
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <button className={cx(buttonClass(variant, size), className)} {...props} />;
}

export function Field({
  label,
  id,
  children,
}: {
  label: ReactNode;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/25";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputClass, className)} {...props} />;
}

export function Card({ title, className, children }: { title: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cx("h-fit rounded-xl bg-white p-6 shadow-md sm:p-8", className)}>
      <h2 className="mb-5 border-b border-gray-200 pb-2 text-2xl font-semibold text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function Message({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "mt-3 rounded-lg px-4 py-2 text-sm font-semibold",
        tone === "error" ? "bg-red-50 text-danger" : "bg-green-50 text-green-700"
      )}
    >
      {children}
    </p>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo className="text-4xl" />
        </div>
        <main className="rounded-xl bg-white p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-10">
          <h1 className="mb-2 text-3xl font-semibold">{title}</h1>
          <p className="mb-8 text-secondary">{subtitle}</p>
          <div className="text-left">{children}</div>
        </main>
      </div>
    </div>
  );
}
