import { useState } from "react";

const inputs = [
  {
    key: "salary_min",
    label: "Minimum salary",
    type: "number",
    required: true,
  },
  {
    key: "salary_max",
    label: "Maximum salary",
    type: "number",
    required: true,
  },
  {
    key: "start_time",
    label: "Start time",
    type: "datetime-local",
    required: true,
  },
  {
    key: "end_time",
    label: "End time",
    type: "datetime-local",
    required: true,
  },
  { key: "note", label: "Note", type: "text" },
];

function formatDateTimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  // convert to local time and format properly
  const pad = (n) => String(n).padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditJob({ job, onClose, onUpdate }) {
  const [updatedJob, setUpdatedJob] = useState({
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    start_time: formatDateTimeLocal(job.start_time),
    end_time: formatDateTimeLocal(job.end_time),
    note: job.note ? job.note : "",
  });

  const [popup, setPopup] = useState("");

  async function updateJob() {
    // process fields: only include the ones that have been changed
    const payload = {};

    for (const field in updatedJob) {
      let value = updatedJob[field];

      // convert known numeric fields
      if (["salary_min", "salary_max"].includes(field)) {
        value = value === "" ? null : Number(value);
      }

      if (job[field] !== value) {
        payload[field] = value;
      }
    }

    // update job only if payload isn't empty
    if (Object.keys(payload).length > 0) {
      const response = await fetch(`${backendUrl}/businesses/me/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setPopup(`Could not update job: ${data.error}`);
        return;
      }
    }

    // update parent state
    onUpdate(payload);

    // close
    onClose();
  }

  return (
    <>
      <div className="top">
        <h3>Edit job</h3>
        <button onClick={onClose}>X</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateJob();
        }}
      >
        {inputs.map(({ key, label, type, required }) => {
          return (
            <div key={key} className="form-field">
              <label>{label}{required ? "*" : ""}</label>
              <input
                type={type}
                required={required}
                value={updatedJob[key]}
                onChange={(e) =>
                  setUpdatedJob((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
              />
            </div>
          );
        })}

        <button className="btn" type="submit">
          Update job
        </button>
      </form>
      {popup && (
        <div className="toast">
          <span>{popup}</span>
          <button onClick={() => setPopup("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default EditJob;
