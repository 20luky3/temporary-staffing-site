import PaginatedList from "../../components/PaginatedList";
import { useState } from "react";
import { Link } from "react-router-dom";

const fields = [
  {
    key: "business",
    label: "Business",
    render: (interest) => interest.job.business.business_name,
  },
  {
    key: "job",
    label: "Position type",
    render: (interest) => interest.job.position_type.name,
  },
  {
    key: "mutual",
    label: "Mutual",
    render: (interest) => (interest.mutual ? "Yes" : "No"),
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserNotStarted() {
  const [selected, setSelected] = useState(-1);
  const [popup, setPopup] = useState("");

  function startNegotiation() {
    if (selected < 0) {
      setPopup("You have not selected a job to negotiate");
      return;
    }

    // api call to start a negotiation
    async function callApi() {
      const response = await fetch(`${backendUrl}/negotiations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interest_id: Number(selected) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPopup(`Could not start negotiation: ${data.error}`);
        return;
      }
    }

    callApi();
  }

  return (
    <div>
      <h3>
        You have no active negotiation. Select a job to start negotiating.
      </h3>
      <PaginatedList
        endpoint={`${backendUrl}/users/me/interests`}
        initialFilters={{}}
        filterConfig={[]}
        authentication={localStorage.getItem("token")}
        emptyMessage="No interested jobs found."
        renderItem={(interest) => {
          return (
            <div>
              <input
                type="radio"
                onChange={() => setSelected(interest.interest_id)}
              />

              <Link to={`/jobs/${interest.job.id}`} className="listComponent">
                <ul>
                  {fields.map(({ key, label, render }) => (
                    <li key={key}>
                      <strong>{label}:</strong>{" "}
                      {render ? render(interest) : interest[key]}
                    </li>
                  ))}
                </ul>
              </Link>
            </div>
          );
        }}
      />

      <button
        className="btn"
        onClick={() => startNegotiation()}
        style={{ marginTop: "10px" }}
      >
        Start negotiation
      </button>
      {popup && (
            <div className="toast">
              <span>{popup}</span>
              <button onClick={() => setPopup("")}>✕</button>
            </div>
          )}
    </div>
  );
}

export default UserNotStarted;
