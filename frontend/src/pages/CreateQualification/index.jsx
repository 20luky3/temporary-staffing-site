import PositionTypes from "../PositionTypes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function CreateQualification() {
  const [positionTypeId, setPositionTypeId] = useState(-1);
  const [note, setNote] = useState("");
  const [popup, setPopup] = useState("");

  const navigate = useNavigate();

  function submitQualification() {
    async function callApi() {
      const response = await fetch(`${backendUrl}/qualifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          position_type_id: Number(positionTypeId),
          note: note,
        }),
      });

      if (response.ok) {
        navigate("/user/qualifications");
        return;
      }

      const data = await response.json();
      setPopup(`Could not create request: ${data.error}`)
    }

    // check a position type has been set
    if (positionTypeId < 0) {
      setPopup("Select a position type");
      return;
    }

    callApi();
  }

  return (
    <>
      <h2>Create qualification request</h2>
      <h3>Available position types</h3>
      <PositionTypes onSelect={(id) => setPositionTypeId(id)} />

      <div
        style={{
          padding: "10px 0",
        }}
      >
        <label>Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginLeft: "4px", padding: "3px" }}
        />
      </div>

      <button className="btn" onClick={() => submitQualification()}>
        Create request
      </button>

      {popup && (
        <div className="toast">
          <span>{popup}</span>
          <button onClick={() => setPopup("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default CreateQualification;
