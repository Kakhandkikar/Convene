import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";
import { meetings as seedMeetings } from "../dummydata";
import FAB from "../components/FAB";
import AddMeetingModal from "../components/AddMeetingModal";
import JoinMeetingModal from "../components/JoinMeetingModal";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { theme, toggle } = useDarkMode();
  const [meetings, setMeetings] = useState(() => {
    const stored = localStorage.getItem("convene_meetings");
    return stored ? JSON.parse(stored) : seedMeetings;
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("convene_meetings", JSON.stringify(meetings));
  }, [meetings]);

  // Fetch meetings for current authenticated user
  useEffect(() => {
    const fetchUserMeetings = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${base}/api/meetings/by-email`, {
          credentials: "include", // Include session cookies
        });
        
        if (response.ok) {
          const list = await response.json();
          if (Array.isArray(list) && list.length) {
            const mapped = list.map(m => ({
              id: m._id,
              meetingId: m.meetingId,
              title: m.title,
              time: m.organizerTime,
              clientTime: m.clientTime,
              platform: m.platform,
              participants: []
            }));
            setMeetings(prev => {
              const byId = new Map(prev.map(p => [p.meetingId, p]));
              mapped.forEach(x => byId.set(x.meetingId, { ...byId.get(x.meetingId), ...x }));
              return Array.from(byId.values());
            });
          }
        } else if (response.status === 401) {
          // User not authenticated, redirect will be handled by ProtectedRoute
          console.log("User not authenticated");
        }
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      }
    };

    fetchUserMeetings();
  }, []);

  // ✅ Fix: Save meeting from Gemini with organizerTime/clientTime
  const handleMeetingCreated = (meeting) => {
    const updated = [{ ...meeting }, ...meetings];
    setMeetings(updated);
    localStorage.setItem("convene_meetings", JSON.stringify(updated));
  };

  const handleJoinMeeting = (meeting) => {
    const existingMeeting = meetings.find(
      (m) => m.meetingId === meeting.meetingId
    );

    if (!existingMeeting) {
      const joinedMeeting = {
        ...meeting,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString(),
      };
      const updated = [joinedMeeting, ...meetings];
      setMeetings(updated);
      localStorage.setItem("convene_meetings", JSON.stringify(updated));
    }

    navigate(`/dashboard/meeting/${meeting.meetingId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="grid grid-cols-12 gap-0">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r border-slate-200 dark:border-slate-800 min-h-screen px-5 py-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img
                src="/convene-logo.svg"
                alt="Convene Logo"
                className="w-8 h-8"
              />
              <div className="font-semibold text-slate-900 dark:text-white">
                Convene
              </div>
            </div>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {theme === "dark" ? (
                <Sun size={18} aria-hidden />
              ) : (
                <Moon size={18} aria-hidden />
              )}
            </button>
          </div>
          <nav className="space-y-1 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-slate-200/60 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800"
                }`
              }
              end
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Home</span>
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <section className="col-span-12 md:col-span-9 lg:col-span-10 px-6 md:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Upcoming Meetings
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your next meetings at a glance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40"
              >
                Join Meeting
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {meetings.map((meeting, idx) => (
              <motion.article
                key={meeting.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => {
                  try { localStorage.setItem("convene_active_meeting_id", meeting.meetingId); } catch {}
                  navigate(`/dashboard/meeting/${meeting.meetingId}`)
                }}
                className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Organizer: {meeting.time || meeting.organizerTime}
                    </p>
                    {meeting.clientTime && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Client: {meeting.clientTime}
                      </p>
                    )}
                    {meeting.meetingId && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ID: {meeting.meetingId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {meeting.platform || "Google Meet"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {meeting.participants?.length || 1} participants
                  </div>
                  <button className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40">
                    Open
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setShowModal(true)} />

      {/* Add Meeting Modal */}
      {showModal && (
        <AddMeetingModal
          onClose={() => setShowModal(false)}
          onCreate={handleMeetingCreated}
        />
      )}

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <JoinMeetingModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinMeeting}
          meetings={seedMeetings}
        />
      )}
    </main>
  );
}
