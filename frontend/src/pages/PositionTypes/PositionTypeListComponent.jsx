import "./PositionTypeListComponent.css";
import { useState } from "react";
import EditPositionType from "./EditPositionType";

const normalFields = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
];

const adminFields = [
  {
    key: "hidden",
    label: "Hidden",
    render: (positionType) => (positionType.hidden ? "True" : "False"),
  },
  {
    key: "num_qualified",
    label: "Number of qualified users",
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PositionTypeListComponent({ positionType: posType, onDelete }) {
  const [positionType, setPositionType] = useState(posType);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isAdmin = localStorage.getItem("role") === "admin";

  const fields = !isAdmin ? normalFields : [...normalFields, ...adminFields];

  async function deletePositionType() {
    const response = await fetch(`${backendUrl}/position-types/${positionType.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
        return { success: response.ok }
    }

    const data = await response.json();
    return { success: response.ok, message: data };
  }

  return (
    <div className="listComponent">
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong>{" "}
            {render ? render(positionType) : positionType[key]}
          </li>
        ))}
      </ul>
      <div className="modifyButtons">
        <button className="btn" onClick={() => setShowEdit(true)}>
          Edit
        </button>
        <button className="btn" onClick={() => setShowDelete(true)}>
          Delete
        </button>
      </div>
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditPositionType
              positionType={positionType}
              onUpdate={(updatedFields) => {
                setPositionType((prev) => ({
                  ...prev,
                  ...updatedFields,
                }));
              }}
              onClose={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Are you sure you want to delete position {positionType.name} (id{" "}
              {positionType.id})?
            </p>

            <div className="confirmButtons">
              <button
                className="btn"
                onClick={async () => {
                  const { success, message } = await deletePositionType();
                  if (!success) {
                    success;
                    setDeleteError(
                      `Could not delete position type: ${message.error}`,
                    );
                    return;
                  }
                  setShowDelete(false);
                  onDelete(); // force list to refresh
                }}
              >
                Yes
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowDelete(false);
                  setDeleteError("");
                }}
              >
                No
              </button>
            </div>
            {deleteError && <p className="error-message">{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionTypeListComponent;
