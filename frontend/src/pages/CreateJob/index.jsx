import PositionTypes from "../PositionTypes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function CreateJob() {
  const [input, setInput] = useState({
    position_type_id: "",
    salary_min: "",
    salary_max: "",
    start_time: "",
    end_time: "",
    note: "",
  });

  const [popup, setPopup] = useState("");

  const navigate = useNavigate();

  function submitJob(e) {
    e.preventDefault();

    if (input.position_type_id === "") {
      setPopup("Please select a position type");
      return;
    }

    async function callApi() {
      const payload = {};

      Object.keys(input).forEach((key) => {
        if (input[key] !== "") {
          // Convert salary fields to numbers
          if (key === "salary_min" || key === "salary_max") {
            payload[key] = Number(input[key]);
          } else {
            payload[key] = input[key];
          }
        }
      });

      const response = await fetch(`${backendUrl}/businesses/me/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/business/my-jobs");
        return;
      }

      const data = await response.json();

      setPopup(`Cannot create job: ${data.error}`);
    }

    callApi();
  }

  return (
    <>
      <h2>Create new job</h2>
      <h3>Available position types</h3>
      <PositionTypes
        onSelect={(id) =>
          setInput((prev) => {
            console.log(id);
            return {
              ...prev,
              position_type_id: id,
            };
          })
        }
      />

      <div style={{ width: "40vw", padding: "10px 0" }}>
        <h3>Other fields</h3>
        <form onSubmit={submitJob}>
          {inputs.map(({ key, label, type, required }) => {
            return (
              <div key={key} className="form-field">
                <label style={{ paddingRight: "5px" }}>{label}{required ? "*" : ""}</label>
                <input
                  type={type}
                  value={input[key]}
                  required={required}
                  onChange={(e) =>
                    setInput((prev) => {
                      return {
                        ...prev,
                        [key]: e.target.value,
                      };
                    })
                  }
                />
              </div>
            );
          })}

          <button className="btn">Create</button>
        </form>
      </div>
      {popup && (
        <div className="toast">
          <span>{popup}</span>
          <button onClick={() => setPopup("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default CreateJob;
