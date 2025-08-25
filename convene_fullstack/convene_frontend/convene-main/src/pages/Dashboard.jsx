import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { meetings } from "../dummyData";
import FAB from "../components/FAB";
import AddMeetingModal from "../components/AddMeetingModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dashboard">
      <h1>Upcoming Meetings</h1>
      <div className="meeting-list">
        {meetings.map((meeting) => (
          <div
            className="meeting-card"
            key={meeting.id}
            onClick={() => navigate(`/dashboard/meeting/${meeting.id}`)}
          >
            <h3>{meeting.title}</h3>
            <p>{meeting.time}</p>
          </div>
        ))}
      </div>

      <FAB onClick={() => setShowModal(true)} />

      {showModal && <AddMeetingModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
