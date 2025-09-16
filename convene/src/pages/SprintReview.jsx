import { useState } from "react";
import RetrospectiveEditor from "../components/RetrospectiveEditor";
import { motion } from "framer-motion";

export default function SprintReview() {
  const [toast, setToast] = useState("");
  const meetingId = localStorage.getItem("convene_active_meeting_id") || "";
  const userEmail = localStorage.getItem("convene_user_email") || "";

  const handleSubmitted = () => {
    setToast("Feedback submitted successfully");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <main className="min-h-screen bg-paper-50 dark:bg-night-900 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">Sprint Review</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Share feedback anonymously before the meeting</p>
        </div>
        <RetrospectiveEditor onSubmitted={handleSubmitted} meetingId={meetingId} userEmail={userEmail} />

        {toast && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-emerald-600 text-white shadow-lg">
            {toast}
          </motion.div>
        )}
      </div>
    </main>
  );
}


