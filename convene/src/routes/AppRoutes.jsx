import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import Dashboard from "../pages/Dashboard";
import MeetingDetails from "../pages/MeetingDetails";
import SprintReview from "../pages/SprintReview";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><LandingPage /></Page>} />
        <Route path="/auth" element={<Page><AuthPage /></Page>} />
        <Route path="/dashboard" element={<Page><ProtectedRoute><Dashboard /></ProtectedRoute></Page>} />
        <Route path="/dashboard/meeting/:meetingId" element={<Page><ProtectedRoute><MeetingDetails /></ProtectedRoute></Page>} />
        <Route path="/dashboard/sprint-review" element={<Page><ProtectedRoute><SprintReview /></ProtectedRoute></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

function Page({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}
