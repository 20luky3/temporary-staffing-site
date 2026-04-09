import "./UserQualificationListComponent.css";
import EditQualificationComponent from "./EditQualificationComponent";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const fields = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "position_type",
    label: "Position type",
    render: (qual) =>
      `${qual.position_type?.name}`,
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "updatedAt",
    label: "Last updated",
    render: (qual) => {
      const date = new Date(qual.updatedAt);
      return date.toLocaleString();
    },
  },
  {
    key: "note",
    label: "Note",
    render: (qual) => (qual.note ? qual.note : "No note provided"),
  },
  {
    key: "document",
    label: "Document",
    render: (qual) => {
      if (!qual.document) return "No document uploaded";

      return (
        <a href={`${backendUrl}/${qual.document}`} target="_blank">
          Click to view document
        </a>
      );
    },
  },
];

function UserQualificationListComponent({ qualification }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [qual, setQual] = useState(qualification);
  
  // console.log(qualification);

  async function submitQual() {
    const newStatus = qual.status === "created" ? "submitted" : "revised";

    const response = await fetch(`${backendUrl}/qualifications/${qual.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    const data = await response.json();
    setQual(data);
  }

  return (
    <div className="listComponent">
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(qual) : qual[key]}
          </li>
        ))}
      </ul>

      {/* Only show modify buttons on created, approved, or rejected requsts */}
      {["created", "approved", "rejected"].includes(qual.status) ? (
        <div className="btnContainer">
          <button className="btn" onClick={() => setShowEdit(true)}>
            Edit
          </button>
          <button className="btn" onClick={() => setShowConfirm(true)}>
            Submit
          </button>
        </div>
      ) : (
        <></>
      )}

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditQualificationComponent
              qual={qual}
              onClose={() => setShowEdit(false)}
              onUpdate={(updatedFields) => {
                setQual((prev) => ({
                  ...prev,
                  ...updatedFields,
                }));
              }}
            />
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Are you sure you want to {qual.status !== "created" ? "re-" : ""}submit the request for{" "}
              {qual.position_type?.name}?
            </p>

            <div className="confirmButtons">
              <button
                className="btn"
                onClick={async () => {
                  await submitQual();
                  setShowConfirm(false);
                }}
              >
                Yes
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowConfirm(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserQualificationListComponent;
