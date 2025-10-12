import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { meetings as seedMeetings } from "../dummydata";
import { formatDateTime } from "../utils/timeUtils";

const TEMPLATES = {
  "Start / Stop / Continue": ["Start", "Stop", "Continue"],
  "Mad / Sad / Glad": ["Mad", "Sad", "Glad"],
  "4Ls (Liked, Learned, Lacked, Longed for)": [
    "Liked",
    "Learned",
    "Lacked",
    "Longed for",
  ],
};

export default function MeetingDetails() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTemplate, setSelectedTemplate] = useState(
    "Start / Stop / Continue"
  );
  const [fields, setFields] = useState({});
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authenticated user first
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.user);
          }
        }

        // Fetch meeting data
        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const meetingResponse = await fetch(`${base}/api/meetings/mid/${meetingId}`, {
          credentials: "include",
        });
        
        if (meetingResponse.ok) {
          const m = await meetingResponse.json();
          const mapped = {
            id: m._id,
            meetingId: m.meetingId,
            title: m.title,
            time: m.organizerTime,
            clientTime: m.clientTime,
            platform: m.platform,
            participants: []
          };
          setMeeting(mapped);

          // Check if current user is a participant
          const participantResponse = await fetch(`${base}/api/meetings/${meetingId}/participants`, {
            credentials: "include",
          });
          
          if (participantResponse.ok) {
            const participants = await participantResponse.json();
            const userEmail = user?.email?.toLowerCase();
            const userIsParticipant = participants.some(p => p.email === userEmail);
            setIsParticipant(userIsParticipant);

            // Check if user has already submitted a retrospective
            if (userIsParticipant) {
              const retrospectiveResponse = await fetch(`${base}/api/retrospectives/meeting/${meetingId}`, {
                credentials: "include",
              });
              
              if (retrospectiveResponse.ok) {
                const retrospectives = await retrospectiveResponse.json();
                const userHasSubmitted = retrospectives.some(r => r.email === userEmail);
                setHasSubmitted(userHasSubmitted);
              }
            }
          }
        } else {
          navigate("/dashboard");
        }
      } catch (e) {
        console.error("Error fetching meeting data:", e);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [meetingId, navigate, user?.email]);

  const labels = TEMPLATES[selectedTemplate];

  const handleFieldChange = (label, value) => {
    setFields((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = () => {
    if (!isParticipant) {
      alert("You must be a participant in this meeting to submit a retrospective.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit a retrospective.");
      return;
    }

    if (hasSubmitted) {
      alert("You have already submitted a retrospective for this meeting.");
      return;
    }

    const payload = labels.reduce((acc, label) => {
      acc[label] = fields[label] || "";
      return acc;
    }, {});

    // Show confirmation dialog with user's input
    setSubmissionData({ template: selectedTemplate, values: payload });
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${base}/api/retrospectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          meetingId: meetingId,
          content: JSON.stringify(submissionData),
          scores: {} // Can be extended later
        })
      });

      if (response.ok) {
        setHasSubmitted(true);
        setShowConfirmation(false);
        setFields({});
        setSubmissionData(null);
        alert("Retrospective submitted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to submit retrospective: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting retrospective:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
    setSubmissionData(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper-50 dark:bg-night-900 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!meeting) {
    return (
      <main className="min-h-screen bg-paper-50 dark:bg-night-900 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Meeting Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The meeting you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper-50 dark:bg-night-900 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {meeting.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span>ID: {meeting.meetingId}</span>
            <span>•</span>
            <span>Organizer: {formatDateTime(meeting.time)}</span>
            {meeting.clientTime && (
              <>
                <span>•</span>
                <span>Client: {formatDateTime(meeting.clientTime)}</span>
              </>
            )}
            <span>•</span>
            <span>{meeting.platform}</span>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            className={`px-4 py-2 text-sm rounded-t-md ${
              activeTab === "overview"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-b-transparent border-slate-200 dark:border-slate-800"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-t-md ${
              activeTab === "sprint"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-b-transparent border-slate-200 dark:border-slate-800"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            onClick={() => setActiveTab("sprint")}
          >
            Sprint Review
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === "overview" && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Meeting Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Participants
                </h3>
                <div className="space-y-1">
                  {meeting.participants?.map((participant, index) => (
                    <div
                      key={index}
                      className="text-sm text-slate-600 dark:text-slate-300"
                    >
                      • {participant}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Meeting Info
                </h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <div>Platform: {meeting.platform}</div>
                  <div>Organizer Time: {formatDateTime(meeting.time)}</div>
                  {meeting.clientTime && (
                    <div>Client Time: {formatDateTime(meeting.clientTime)}</div>
                  )}
                  <div>Meeting ID: {meeting.meetingId}</div>
                </div>
              </div>
            </div>
            
            {/* Generate Meeting Link Button */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                className="px-3 py-2 text-xs rounded-md bg-indigo-600 text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40 transition-all"
                onClick={() => {
                  const links = {
                    "Google Meet": "https://meet.google.com/",
                    "Zoom": "https://zoom.us/meeting/schedule",
                    "Microsoft Teams": "https://teams.microsoft.com/calendar",
                    "Other": "#",
                  };

                  window.open(
                    links[meeting.platform] || links["Other"],
                    "_blank",
                    "width=800,height=600,top=100,left=100,resizable=yes,scrollbars=yes"
                  );
                }}
              >
                Generate {meeting.platform} Link
              </button>
            </div>
          </section>
        )}

        {activeTab === "sprint" && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            {!isParticipant ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Access Restricted
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  You must be a participant in this meeting to submit a retrospective.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Contact the meeting organizer to be added as a participant.
                </p>
              </div>
            ) : hasSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Retrospective Submitted
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Thank you for submitting your retrospective for this meeting.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You can only submit one retrospective per meeting.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Choose Retrospective Format
                  </label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setFields({});
                }}
                className="w-full sm:w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                {Object.keys(TEMPLATES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labels.map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3"
                >
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {label}
                  </div>
                  <textarea
                    rows={4}
                    value={fields[label] || ""}
                    onChange={(e) => handleFieldChange(label, e.target.value)}
                    placeholder={`Write about ${label.toLowerCase()}...`}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              ))}
            </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 shadow-soft hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40"
                  >
                    Submit Retrospective
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && submissionData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur" onClick={handleCancelSubmit} />
            <div className="relative w-[92vw] max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Confirm Retrospective Submission
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Please review your retrospective before submitting:
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Template: {submissionData.template}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(submissionData.values).map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                          {label}
                        </div>
                        <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                          {value || <span className="text-slate-400 italic">No response</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:brightness-105"
                >
                  Submit Retrospective
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
