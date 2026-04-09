import { useState } from "react";
import "./EditPositionType.css";

const fields = [
  { key: "name", label: "Name", required: true },
  { key: "description", label: "Description", required: true },
  { key: "hidden", label: "Hidden", type: "select" },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditPositionType({ positionType, onClose, onUpdate }) {
  const initialState = {
    name: positionType.name,
    description: positionType.description,
    hidden: positionType.hidden,
  };

  const [updatedPositionType, setUpdatedPositionType] = useState(initialState);
  const endpoint = `${backendUrl}/position-types/${positionType.id}`;

  async function updatePositionType() {
    // process fields: only include the ones that have been changed
    const payload = {};

    for (const field in updatedPositionType) {
      if (positionType[field] !== updatedPositionType[field]) {
        payload[field] = updatedPositionType[field];
      }
    }

    // do the actual update
    await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    // update parent state
    onUpdate(payload);

    // close modal
    onClose();
  }

  return (
    <>
      <div className="top">
        <h3>Edit position type</h3>
        <button onClick={onClose}>X</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updatePositionType();
        }}
      >
        {fields.map(({ key, label, type, required}) => {
          if (type === "select") {
            return (
              <div key={key} className="form-field">
                <label>{label}</label>
                <select
                  value={String(updatedPositionType[key] ?? "true")}
                  onChange={(e) => {
                    const value = e.target.value === "true";

                    setUpdatedPositionType((prev) => ({
                      ...prev,
                      [key]: value,
                    }));
                  }}
                >
                  <option value="true" key="true">
                    True
                  </option>
                  <option value="false" key="false">
                    False
                  </option>
                </select>
              </div>
            );
          }

          return (
            <div key={key} className="form-field">
              <label>{label}*</label>
              <input
                type="text"
                value={updatedPositionType[key] || ""}
                required={required}
                onChange={(e) => {
                  const value = e.target.value;

                  setUpdatedPositionType((prev) => ({
                    ...prev,
                    [key]: value,
                  }));
                }}
              />
            </div>
          );
        })}

        <button className="btn" type="submit">
          Update position type
        </button>
      </form>
    </>
  );
}

export default EditPositionType;
