import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, OnboardedRoute, ProtectedRoute } from "./auth/routes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<OnboardedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
