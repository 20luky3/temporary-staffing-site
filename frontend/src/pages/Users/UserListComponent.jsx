import { useState } from "react";

const userFields = [
  { key: "id", label: "ID" },
  {
    key: "full_name",
    label: "Name",
    render: (user) => `${user.first_name} ${user.last_name}`,
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "postal_address",
    label: "Postal address",
  },
  {
    key: "phone_number",
    label: "Phone number",
  },
  {
    key: "activated",
    label: "Activated",
    render: (user) => (user.activated ? "True" : "False"),
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserListComponent({ user }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [suspended, setSuspended] = useState(user.suspended);

  function onToggleSuspend() {
    // display popup to confirm action
    setShowConfirm(true);
  }

  function confirmAction() {
    setShowConfirm(false);

    // call API to suspend the user
    async function suspendUser() {
      await fetch(`${backendUrl}/users/${user.id}/suspended`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          suspended: !suspended,
        }),
      });
    }

    suspendUser();
    setSuspended(!suspended);
  }

  function cancelAction() {
    setShowConfirm(false);
  }

  return (
    <div className="listComponent">
      <ul>
        {userFields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(user) : user[key]}
          </li>
        ))}

        <li>
          <strong>Suspended: </strong>
          <label className="switch">
            <input
              type="checkbox"
              checked={suspended}
              onChange={(e) => {
                e.preventDefault();
                onToggleSuspend();
              }}
            />
          </label>
        </li>
      </ul>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              {suspended
                ? `Unsuspend ${user.first_name} ${user.last_name} (id ${user.id})?`
                : `Suspend ${user.first_name} ${user.last_name} (id ${user.id})?`}
            </p>

            <div style={{ display: "flex", gap: "3px" }}>
              <button className="btn" onClick={confirmAction}>
                Yes
              </button>
              <button className="btn" onClick={cancelAction}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserListComponent;
