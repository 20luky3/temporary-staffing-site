import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EditJob from "./EditJob";

const requiredFields = [
  {
    key: "business_name",
    label: "Business name",
    render: (job) => job.business?.business_name,
  },
  {
    key: "position_type",
    label: "Position type",
    render: (job) => job.position_type?.name,
  },
  {
    key: "status",
    label: "Job status",
  },
  {
    key: "salary",
    label: "Salary",
    render: (job) => `$${job.salary_min} - $${job.salary_max}`,
  },
  {
    key: "work_time_window",
    label: "Work time window",
    render: (job) => {
      const start = new Date(job.start_time);
      const end = new Date(job.end_time);

      return `${start.toLocaleString()} to ${end.toLocaleString()}`;
    },
  },
  {
    key: "note",
    label: "Note",
    render: (job) => (job.note ? job.note : "No note provided"),
  },
  {
    key: "worker",
    label: "Worker",
    render: (job) =>
      job.worker
        ? `${job.worker.first_name} ${job.worker.last_name}`
        : "No worker",
  },
  {
    key: "updatedAt",
    label: "Last updated",
    render: (job) => {
      const date = new Date(job.updatedAt);
      return date.toLocaleString();
    },
  },
];

const optionalFields = [
  {
    key: "distance",
    label: "Distance",
    render: (job) => `${Math.round(job.distance * 100) / 100} kilometers`,
  },
  {
    key: "eta",
    label: "Estimated travel time",
    render: (job) => `${Math.round(job.eta * 100) / 100} minutes`,
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function JobIndex() {
  const { jobId } = useParams();
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [searchParams, _setSearchParams] = useSearchParams();
  const [job, setJob] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestMessage, setInterestMessage] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [noShowError, setNoShowError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      const lat = searchParams.get("lat");
      const lon = searchParams.get("lon");

      const query = new URLSearchParams();

      if (lat != null && lon != null) {
        query.append("lat", Number(lat));
        query.append("lon", Number(lon));
      }

      const response = await fetch(`${backendUrl}/jobs/${jobId}?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setJob(data);
      setLoading(false);
      return;
    }

    fetchJob();
  }, []);

  function handleUpdateInterest(interest) {
    async function updateInterest(interest) {
      const response = await fetch(`${backendUrl}/jobs/${jobId}/interested`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          interested: interest,
        }),
      });

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

  function confirmAction() {
    // call API to delete the job
    async function deleteJob() {
      const response = await fetch(`${backendUrl}/businesses/me/jobs/${job.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setShowDeleteConfirm(false);

        navigate("/business/my-jobs");
        return;
      }

      // could not delete
      const data = await response.json();
      setDeleteError(data.error);
    }

    deleteJob();
  }

  function markNoShow() {
    // call API to mark the noo show
    async function callApi() {
      const response = await fetch(`${backendUrl}/jobs/${job.id}/no-show`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setJob((prev) => {
          return {
            ...prev,
            ...data,
          };
        });

        return;
      }

      // there was a conflict
      setNoShowError(`Could not mark worker as no-show: ${data.error}`);
    }

    callApi();
  }

  let fields;

  if (job.eta && job.distance) {
    fields = [...requiredFields, ...optionalFields];
  } else {
    fields = requiredFields;
  }

  if (loading) return <h3>Loading job...</h3>;

  if (error !== "") {
    return <h3>You are not allowed to view this job: {error}</h3>;
  }

  return (
    <>
      <div>
        <ul>
          {fields.map(({ key, label, render }) => (
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
          flexDirection: "column",
          paddingTop: "15px",
        }}
      >
        {role === "regular" ? (
          // only show if job is open
          job.status === "open" ? <div
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
          </div> : <></>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "row",
              }}
            >
              {/* only show if worker is filled */}
              {job.worker ? (
                <>
                  <button className="btn" onClick={() => markNoShow()}>
                    Mark no show
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      navigate(
                        `/business/jobs/${job.id}/candidates/${job.worker.id}`,
                      )
                    }
                  >
                    View worker
                  </button>
                </>
              ) : (
                <></>
              )}

              {/* only show if job is open */}
              {job.status === "open" ? (
                <>
                  <button
                    className="btn"
                    onClick={() =>
                      navigate(`/business/jobs/${job.id}/interested`)
                    }
                  >
                    Interested users
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      navigate(`/business/jobs/${job.id}/candidates`)
                    }
                  >
                    Discoverable users
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "row",
              }}
            >
              <button className="btn" onClick={() => setShowEdit(true)}>
                Edit
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setDeleteError("");
                }}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      {interestMessage && (
        <div className="toast">
          <span>{interestMessage}</span>
          <button onClick={() => setInterestMessage("")}>✕</button>
        </div>
      )}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditJob
              job={job}
              onClose={() => setShowEdit(false)}
              onUpdate={(updatedFields) => {
                setJob((prev) => ({
                  ...prev,
                  ...updatedFields,
                }));
              }}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal">
            <p>Are you sure you want to delete {job.position_type.name}?</p>
            <div style={{ display: "flex", gap: "3px" }}>
              <button className="btn" onClick={() => confirmAction()}>
                Yes
              </button>
              <button
                className="btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
            {deleteError !== "" ? (
              <p style={{ color: "red" }}>{deleteError}</p>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
      {noShowError && (
        <div className="toast">
          <span>{noShowError}</span>
          <button onClick={() => setNoShowError("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default JobIndex;
