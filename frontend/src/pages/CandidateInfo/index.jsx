import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const userFields = [
  {
    key: "name",
    label: "Name",
    render: (user) => `${user.first_name} ${user.last_name}`,
  },
  {
    key: "biography",
    label: "Biography",
    render: (user) =>
      user.biography ? user.biography : "No biography provided",
  },
  {
    key: "resume",
    label: "Resume",
    render: (user) => {
      if (!user.resume) return "No resume uploaded";

      return (
        <a href={`${backendUrl}/${user.resume}`} target="_blank">
          Click to view resume
        </a>
      );
    },
  },
];

const otherFields = [
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone number" },
];

const qualFields = [
  {
    key: "document",
    label: "Document",
    render: (user) => {
      if (!user.qualification) return <></>;
      if (!user.qualification.document) return "No document uploaded";

      return (
        <a
          href={`${backendUrl}/${user.qualification.document}`}
          target="_blank"
        >
          Click to view document
        </a>
      );
    },
  },
  {
    key: "note",
    label: "Note",
    render: (user) =>
      user.qualification?.note ? user.qualification.note : "No note provided",
  },
  {
    key: "updatedAt",
    label: "Last updated",
    render: (user) => {
      if (!user.qualification) return <></>;

      const date = new Date(user.qualification.updatedAt);
      return date.toLocaleDateString();
    },
  },
];

const jobFields = [
  {
    key: "position_type",
    label: "Position type",
    render: (job) => job.position_type?.name,
  },
  {
    key: "work_window",
    label: "Work window",
    render: (job) => {
      if (!job.start_time) return <></>;

      const startDate = new Date(job.start_time);
      const endDate = new Date(job.end_time);

      return `${startDate.toLocaleString()} to ${endDate.toLocaleString()}`;
    },
  },
];

function CandidateInfo() {
  const { jobId, userId } = useParams();
  const [user, setUser] = useState({});
  const [job, setJob] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [interestMessage, setInterestMessage] = useState("");

  useEffect(() => {
    async function fetchCandidate() {
      const response = await fetch(`${backendUrl}/jobs/${jobId}/candidates/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Cannot see candidate details: ${data.error}`);
        return;
      }

      setUser(data.user);
      setJob(data.job);
      setLoading(false);
      return;
    }

    fetchCandidate();
  }, []);

  function handleUpdateInterest(interest) {
    async function updateInterest(interest) {
      const response = await fetch(
        `${backendUrl}/jobs/${jobId}/candidates/${userId}/interested`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            interested: interest,
          }),
        },
      );

      const data = await response.json();

      if (response.status === 400) {
        setInterestMessage(
          "Could not withdraw interest, you have not expressed interest before",
        );
        return;
      }

      if (!response.ok) {
        setInterestMessage(`Could not update interest: ${data.error}`);
        return;
      }

      interest
        ? setInterestMessage("Successfully expressed interest")
        : setInterestMessage("Successfully withdrew interest");
    }

    updateInterest(interest);
  }

  if (error !== "") {
    return <h3>{error}</h3>;
  }

  if (loading) {
    return <h3>Loading candidate info...</h3>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div className="userInfo">
        <h3>Candidate</h3>
        <ul>
          {userFields.map(({ key, label, render }) => (
            <li key={key}>
              <strong>{label}:</strong> {render ? render(user) : user[key]}
            </li>
          ))}

          {/* Only include these if they're provided */}
          {user.email ? (
            otherFields.map(({ key, label, render }) => (
              <li key={key}>
                <strong>{label}:</strong> {render ? render(user) : user[key]}
              </li>
            ))
          ) : (
            <></>
          )}
        </ul>
      </div>
      <div className="qualificationInfo">
        <h3>Candidate's qualification</h3>
        <ul>
          {qualFields.map(({ key, label, render }) => (
            <li key={key}>
              <strong>{label}:</strong> {render ? render(user) : user[key]}
            </li>
          ))}
        </ul>
      </div>
      <div className="jobInfo">
        <h3>Job info</h3>
        <ul>
          {jobFields.map(({ key, label, render }) => (
            <li key={key}>
              <strong>{label}:</strong> {render ? render(job) : job[key]}
            </li>
          ))}
        </ul>
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "row",
        }}
      >
        <button className="btn" onClick={() => handleUpdateInterest(true)}>
          Express interest
        </button>
        <button className="btn" onClick={() => handleUpdateInterest(false)}>
          Withdraw interest
        </button>
      </div>
      {interestMessage && (
        <div className="toast">
          <span>{interestMessage}</span>
          <button onClick={() => setInterestMessage("")}>✕</button>
        </div>
      )}
    </div>
  );
}

export default CandidateInfo;
