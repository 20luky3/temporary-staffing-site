import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditQualificationComponent({ qual, onClose, onUpdate }) {
  const [updatedQual, setUpdatedQual] = useState({
    note: qual.note,
    document: qual.document,
  });

  const [uploaded, setUploaded] = useState(false);

  async function updateQual() {
    // only include note if it was changed
    const payload = {};

    if (qual.note !== updatedQual.note) {
      payload.note = updatedQual.note;
    }

    const response = await fetch(`${backendUrl}/qualifications/${qual.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // after update, also include the document in payload if it was changed
    if (uploaded) {
      payload.document = updatedQual.document;
    }

    // also include the updatedAt time
    payload.updatedAt = data.updatedAt;

    // update parent state
    onUpdate(payload);
    setUploaded(false);

    // close modal
    onClose();
  }

  async function upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${backendUrl}/qualifications/${qual.id}/document`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  }

  return (
    <>
      <div className="top">
        <h3>Edit qualification request</h3>
        <button onClick={onClose}>X</button>
      </div>
      <p style={{ textAlign: "center", paddingBottom: "4px" }}>
        Position type: {qual.position_type?.name}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateQual();
        }}
      >
        <div className="form-field">
          <label>Note</label>
          <input
            type="text"
            value={updatedQual.note || ""}
            onChange={(e) => {
              setUpdatedQual((prev) => ({
                ...prev,
                note: e.target.value,
              }));
            }}
          />
        </div>

        <div className="form-field">
          <label>Document</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={async (e) => {
              const file = e.target.files[0];
              const document = await upload(file);
              setUploaded(true);
              setUpdatedQual((prev) => ({
                ...prev,
                document: document.document,
              }));
            }}
          />
        </div>

        <button className="btn">Update</button>
      </form>
    </>
  );
}

export default EditQualificationComponent;
