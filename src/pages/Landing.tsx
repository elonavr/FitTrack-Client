import { Link } from "react-router-dom";
import { Header, buttonClass } from "../components/ui";
import { useAuth } from "../auth/AuthContext";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Header>
        {isAuthenticated ? (
          <Link to="/dashboard" className={buttonClass("primary")}>Dashboard</Link>
        ) : (
          <>
            <Link to="/login" className={buttonClass("outline")}>Log In</Link>
            <Link to="/signup" className={buttonClass("primary")}>Sign Up</Link>
          </>
        )}
      </Header>
      <main className="mb-5 bg-gradient-to-br from-[#e9ecef] to-[#adb5bd] px-[5%] py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[#212529] sm:text-5xl">
          Track Your Progress. Achieve Your Goals.
        </h1>
        <p className="mb-8 text-xl text-secondary">
          Join FitTrack today and start your personalized fitness journey.
        </p>
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className={buttonClass("primary") + " px-6 py-3 text-lg font-bold hover:-translate-y-0.5"}
        >
          Start Tracking Now
        </Link>
      </main>
    </>
  );
}
