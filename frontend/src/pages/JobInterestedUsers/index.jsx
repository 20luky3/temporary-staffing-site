import { useParams } from "react-router-dom";
import { useState } from "react";
import PaginatedList from "../../components/PaginatedList";
import JobInterestedUsersComponent from "./JobInterestedUsersComponent";

const filterConfig = [{ type: "number", key: "limit" }];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function JobInterestedUsers() {
  const { jobId } = useParams();
  const [selected, setSelected] = useState(-1);
  const [popup, setPopup] = useState("");

  function handleStart() {
    if (selected < 0) {
      setPopup("You have not selected a candidate to negotiate with.");
      return;
    }

    // attempt to start negotiation
    async function startNegotiation() {
      const response = await fetch(`${backendUrl}/negotiations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interest_id: selected,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPopup(`Error when starting negotiation: ${data.error}`);
        return;
      }
      
      return;
    }

    startNegotiation();
  }

  return (
    <>
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <h1>Interested candidates</h1>
        <button className="btn" onClick={() => handleStart()}>
          Start negotiation
        </button>
      </div>
      <PaginatedList
        endpoint={`${backendUrl}/jobs/${jobId}/interests`}
        initialFilters={{}}
        filterConfig={filterConfig}
        authentication={localStorage.getItem("token")}
        emptyMessage="No interested users for this job."
        renderItem={(interest) => (
          <JobInterestedUsersComponent
            interest={interest}
            jobId={jobId}
            onSelect={(selectId) => setSelected(selectId)}
          />
        )}
      />
      {popup && (
        <div className="toast">
          <span>{popup}</span>
          <button onClick={() => setPopup("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default JobInterestedUsers;
