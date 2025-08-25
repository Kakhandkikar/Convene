import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import Dashboard from "../pages/Dashboard";
import MeetingDetails from "../pages/MeetingDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/meeting/:id" element={<MeetingDetails />} />
    </Routes>
  );
}
