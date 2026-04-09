import { useState } from "react";

const userFields = [
  { key: "id", label: "ID" },
  {
    key: "business_name",
    label: "Business name",
  },
  {
    key: "owner_name",
    label: "Owner name",
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

function AdminBusinessListComponent({ business }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [verified, setVerified] = useState(business.verified);

  function onToggleVerify() {
    // display popup to confirm action
    setShowConfirm(true);
  }

  function confirmAction() {
    setShowConfirm(false);

    // call API to verify the business
    async function verifyBusiness() {
      await fetch(`${backendUrl}/businesses/${business.id}/verified`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          verified: !verified,
        }),
      });
    }

    verifyBusiness();
    setVerified(!verified);
  }

  function cancelAction() {
    setShowConfirm(false);
  }

  return (
    <div className="listComponent">
      <ul>
        {userFields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong>{" "}
            {render ? render(business) : business[key]}
          </li>
        ))}

        <li>
          <strong>Verified: </strong>
          <label className="switch">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => {
                e.preventDefault();
                onToggleVerify();
              }}
            />
          </label>
        </li>
      </ul>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              {verified
                ? `Unverify ${business.business_name} (id ${business.id})?`
                : `Verify ${business.business_name} (id ${business.id})?`}
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

export default AdminBusinessListComponent;
