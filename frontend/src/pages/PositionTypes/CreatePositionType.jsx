import { useState } from "react";

const fields = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "hidden", label: "Hidden", type: "select" },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function CreatePositionType({ onClose, onUpdate }) {
  const initialState = {
    name: "",
    description: "",
    hidden: true,
  };

  const [positionType, setPositionType] = useState(initialState);

  async function createPositionType() {
    await fetch(`${backendUrl}/position-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(positionType),
    });

    // update the parent state
    onUpdate();

    // close modal
    onClose();
  }

  return (
    <>
      <div className="top">
        <h3>Create position type</h3>
        <button onClick={onClose}>X</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPositionType();
        }}
      >
        {fields.map(({ key, label, type }) => {
          if (type === "select") {
            return (
              <div key={key} className="form-field">
                <label>{label}</label>
                <select
                  value={String(positionType[key] ?? "true")}
                  onChange={(e) => {
                    const value = e.target.value === "true";

                    setPositionType((prev) => ({
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
                required
                value={positionType[key] || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setPositionType((prev) => ({
                    ...prev,
                    [key]: value,
                  }));
                }}
              />
            </div>
          );
        })}

        <button className="btn" type="submit">
          Create position type
        </button>
      </form>
    </>
  );
}

export default CreatePositionType;
