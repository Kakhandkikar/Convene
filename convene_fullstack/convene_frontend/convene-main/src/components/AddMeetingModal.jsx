import { useState } from "react";

export default function AddMeetingModal({ onClose }) {
  const [type, setType] = useState("online");
  const [context, setContext] = useState("organizational");
  const [title, setTitle] = useState("");
  const [step, setStep] = useState("form"); // 'form' | 'loading' | 'result'
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState([]);

  const handleGenerate = () => {
    setStep("loading");

    // Fake delay to simulate processing
    setTimeout(() => {
      const fakeLink = `https://convene.meeting/${Math.floor(
        Math.random() * 100000
      )}`;
      setLink(fakeLink);
      setStep("result");
    }, 2000);
  };

  const handleAddEmail = () => {
    if (!email || participants.includes(email)) return;
    setParticipants([...participants, email]);
    setEmail("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    alert("Meeting link copied to clipboard!");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal large-modal">
        {step === "form" && (
          <>
            <h2>Schedule a Meeting</h2>

            <div className="modal-form-group">
              <label>Meeting Title</label>
              <input
                type="text"
                placeholder="Enter meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label>Meeting Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {type === "online" && (
              <div className="modal-form-group">
                <label>Platform</label>
                <select>
                  <option>Google Meet</option>
                  <option>Zoom</option>
                  <option>Microsoft Teams</option>
                  <option>Other</option>
                </select>
              </div>
            )}

            <div className="modal-form-group">
              <label>Meeting Context</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
              >
                <option value="organizational">Organizational</option>
                <option value="international">International</option>
              </select>
            </div>

            {context === "international" && (
              <>
                <div className="modal-form-group">
                  <label>Organizer Timezone</label>
                  <input placeholder="Asia/Kolkata" />
                </div>
                <div className="modal-form-group">
                  <label>Client Timezone</label>
                  <input placeholder="America/New_York" />
                </div>
              </>
            )}

            <div className="modal-form-group">
              <label>Month</label>
              <input type="month" />
            </div>

            <div className="modal-form-group">
              <label>Week (1–4)</label>
              <input type="number" min="1" max="4" />
            </div>

            <div className="checkboxes">
              <label>
                <input type="checkbox" /> Allow holidays
              </label>
              <label>
                <input type="checkbox" /> Allow weekends
              </label>
            </div>

            <div className="modal-buttons">
              <button onClick={handleGenerate}>Generate Meeting</button>
              <button className="close-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="loading-screen">
            <h2>📅 Finding the best time for your meeting...</h2>
            <p>Please wait a moment.</p>
          </div>
        )}

        {step === "result" && (
          <div className="result-screen">
            <h2>✅ Meeting Scheduled!</h2>
            <p>Here’s your meeting link:</p>
            <div className="link-box">
              <code>{link}</code>
              <button onClick={handleCopy}>Copy</button>
            </div>

            <div className="modal-form-group">
              <label>Add Participant Email</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleAddEmail}>Add</button>
              </div>
            </div>

            {participants.length > 0 && (
              <div className="modal-form-group">
                <label>Participants:</label>
                <ul>
                  {participants.map((mail, i) => (
                    <li key={i}>📧 {mail}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-buttons">
              <button className="close-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
