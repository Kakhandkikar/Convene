import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddMeetingModal({ onClose, onCreate }) {
  const [context, setContext] = useState("organizational");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("online");
  const [step, setStep] = useState("form"); // 'form' | 'loading' | 'result'
  const [hostEmail, setHostEmail] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [participants, setParticipants] = useState([]);
  const [platform, setPlatform] = useState("Google Meet");
  const [orgTz, setOrgTz] = useState("Asia/Kolkata");
  const [clientTz, setClientTz] = useState("America/New_York");
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [allowWeekends, setAllowWeekends] = useState(false); // ✅ fixed
  const [allowHolidays, setAllowHolidays] = useState(false); // ✅ fixed
  const [result, setResult] = useState(null);

  const generateMeetingId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `MTG${timestamp}${random}`.toUpperCase();
  };

  const handleGenerate = async () => {
    setStep("loading");

    const payload = {
      title: title || `${platform} Meeting`,
      platform,
      hostEmail: hostEmail || undefined,
      context,
      organizerTimezone: orgTz,
      clientTimezone: context === "international" ? clientTz : null,
      month,
      weekNumber: parseInt(week, 10),
      allowWeekends,
      allowHolidays,
      participants
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gemini`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json(); // Gemini returns JSON only

      setResult(data);
      setStep("result");

      if (onCreate) {
        const newMeeting = {
          id: Date.now().toString(),
          meetingId: data.meetingId || generateMeetingId(),
          title: title || `${platform} Meeting`,
          time: data.organizerTime,
          clientTime: data.clientTime || null,
          platform,
          participants:
            participants.length > 0 ? participants : ["organizer@company.com"],
        };
        onCreate(newMeeting);
      }
    } catch (err) {
      console.error("Error generating meeting:", err);
      setStep("form");
    }
  };

  const handleAddEmail = () => {
    const value = (participantEmail || "").trim();
    if (!value) return;
    if (participants.includes(value)) return;
    setParticipants([...participants, value]);
    setParticipantEmail("");
  };

  const timezoneOptions = [
    "UTC",
    "Asia/Kolkata",
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Asia/Dubai",
    "Australia/Sydney",
    "Africa/Johannesburg",
    "America/Sao_Paulo",
  ];

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
          className="relative w-[92vw] max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Schedule a meeting
            </h2>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/50 dark:focus:ring-slate-600/50 rounded"
            >
              ✕
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Meeting title
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Client kickoff"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Host email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    placeholder="host@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Meeting type
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {type === "online" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                      Platform
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      <option>Google Meet</option>
                      <option>Zoom</option>
                      <option>Microsoft Teams</option>
                      <option>Other</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Context
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  >
                    <option value="organizational">Organizational</option>
                    <option value="international">International</option>
                  </select>
                </div>

                {context === "international" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Organizer timezone
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        value={orgTz}
                        onChange={(e) => setOrgTz(e.target.value)}
                      >
                        {timezoneOptions.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Client timezone
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        value={clientTz}
                        onChange={(e) => setClientTz(e.target.value)}
                      >
                        {timezoneOptions.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Month
                  </label>
                  <input
                    type="month"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Week (1–4)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                  />
                </div>
                {/* Time input intentionally omitted. The system will find the best slot. */}

                <div className="sm:col-span-2 flex items-center gap-4 text-sm text-slate-700 dark:text-slate-200">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={allowHolidays}
                      onChange={(e) => setAllowHolidays(e.target.checked)}
                    />
                    Allow holidays
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={allowWeekends}
                      onChange={(e) => setAllowWeekends(e.target.checked)}
                    />
                    Allow weekends
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Participants</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="participant@example.com"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      Add
                    </button>
                  </div>
                  {participants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {participants.map((p, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 mt-2">
                  <button
                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow"
                    onClick={handleGenerate}
                  >
                    Generate meeting
                  </button>
                </div>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div
                key="loading"
                className="py-14 flex flex-col items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                />
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  Finding best schedule…
                </div>
              </motion.div>
            )}

            {step === "result" && result && (
  <motion.div
    key="result"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="mt-4 space-y-4"
  >
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
        Best possible meeting time (calculated with Convene AI expertise)
      </div>
      <div className="mt-1 flex flex-col gap-2">
        <code className="text-indigo-700 dark:text-indigo-300 break-all">
          Organizer: {result.organizerTime}
        </code>
        {result.clientTime && (
          <code className="text-pink-700 dark:text-pink-300 break-all">
            Client: {result.clientTime}
          </code>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {result.reasoning}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-end">
      <button
        className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
        onClick={onClose}
      >
        Done
      </button>
    </div>
  </motion.div>
)}

          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
