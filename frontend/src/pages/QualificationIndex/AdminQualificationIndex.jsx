import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const qualFields = [
  {
    key: "note",
    label: "Note",
    render: (qual) => (qual.note ? qual.note : "No note provided"),
  },
  {
    key: "status",
    label: "Status",
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

const userFields = [
  {
    key: "name",
    label: "Name",
    render: (qual) => `${qual.user?.first_name} ${qual.user?.last_name}`,
  },
  {
    key: "email",
    label: "Email",
    render: (qual) => qual.user?.email,
  },
  {
    key: "phone_number",
    label: "Phone number",
    render: (qual) => qual.user?.phone_number,
  },
  {
    key: "postal_address",
    label: "Postal address",
    render: (qual) => qual.user?.postal_address,
  },
  {
    key: "suspended",
    label: "Suspended",
    render: (qual) => (qual.user?.suspended ? "True" : "False"),
  },
];

const positionTypeFields = [
  {
    key: "name",
    label: "Name",
    render: (qual) => qual.position_type?.name,
  },
  {
    key: "description",
    label: "Description",
    render: (qual) => qual.position_type?.description,
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function AdminQualificationIndex() {
  const { qualId } = useParams();
  const [qual, setQual] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // function for retrieving a qualification
    async function getQual() {
      const response = await fetch(`${backendUrl}/qualifications/${qualId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setQual(data);
      console.log(data);
    }

    getQual();
  }, []);

  async function updateQual(status) {
    const response = await fetch(`${backendUrl}/qualifications/${qual.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        status: status,
      }),
    });

    console.log(response);
  }

  return (
    <>
      <h1>
        {qual.user?.first_name} {qual.user?.last_name}'s qualification request for{" "}
        {qual.position_type?.name}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div id="qualInfo">
          <ul>
            {qualFields.map(({ key, label, render }) => (
              <li key={key}>
                <strong>{label}:</strong> {render ? render(qual) : qual[key]}
              </li>
            ))}
          </ul>
        </div>
        <div id="userInfo">
          <h3>User info</h3>
          <ul>
            {userFields.map(({ key, label, render }) => (
              <li key={key}>
                <strong>{label}:</strong> {render ? render(qual) : qual[key]}
              </li>
            ))}
            <li key="resume">
              {qual.user?.resume ? (
                <>
                  <strong>Resume: </strong>
                  <a
                    href={`${backendUrl}/${qual.user?.resume}`}
                    target="_blank"
                  >
                    Click to open resume
                  </a>
                </>
              ) : (
                <></>
              )}
            </li>
          </ul>
        </div>
        <div id="positionTypeInfo">
          <h3>Position type info</h3>
          <ul>
            {positionTypeFields.map(({ key, label, render }) => (
              <li key={key}>
                <strong>{label}:</strong> {render ? render(qual) : qual[key]}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            className="btn"
            onClick={() => {
              updateQual("approved");
              navigate("/admin/qualifications");
            }}
          >
            Approve
          </button>
          <button
            className="btn"
            onClick={() => {
              updateQual("rejected");
              navigate("/admin/qualifications");
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminQualificationIndex;
