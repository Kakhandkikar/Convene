import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinMeetingModal({ onClose, onJoin, meetings }) {
  const [meetingId, setMeetingId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get authenticated user's email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEmail(data.user.email);
          }
        }
      } catch (error) {
        console.error("Failed to get user email:", error);
      }
    };

    getUserEmail();
  }, []);

  const handleJoin = async () => {
    if (!meetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mid = meetingId.trim().toUpperCase();
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      // First verify the meeting exists
      const respMeeting = await fetch(`${base}/api/meetings/mid/${mid}`, {
        credentials: "include",
      });
      if (!respMeeting.ok) {
        setError("Meeting not found");
        setLoading(false);
        return;
      }
      const meeting = await respMeeting.json();
      
      // Join meeting with authenticated user's email
      const joinResp = await fetch(`${base}/api/meetings/${mid}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });
      
      if (!joinResp.ok) {
        const errorData = await joinResp.json();
        setError(errorData.error || "Unable to join meeting");
        setLoading(false);
        return;
      }
      
      onJoin(meeting);
      onClose();
    } catch (e) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className="relative w-[92vw] max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Join Meeting
            </h2>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/50 dark:focus:ring-slate-600/50 rounded"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Meeting ID
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => {
                  setMeetingId(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter meeting ID (e.g., MTG001)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                placeholder="Loading your email..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Using your authenticated account email
              </p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Enter the meeting ID provided by the meeting organizer to join an existing meeting.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleJoin}
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Meeting"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
