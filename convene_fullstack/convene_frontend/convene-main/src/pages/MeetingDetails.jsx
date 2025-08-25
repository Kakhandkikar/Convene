import { useParams } from "react-router-dom";
import RetrospectiveEditor from "../components/RetrospectiveEditor";

export default function MeetingDetails() {
  const { id } = useParams();

  return (
    <div className="meeting-details">
      <h2>Meeting ID: {id}</h2>
      <RetrospectiveEditor />
    </div>
  );
}
