import "./Profile.css";
import Unauthorised from "../../components/Unauthorised";
import EditProfile from "../../components/EditProfile";
import { CgProfile } from "react-icons/cg";

import { useState, useEffect } from "react";
import { useRef } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const userFields = [
  {
    key: "name",
    label: "Name",
    render: (user) => `${user.first_name} ${user.last_name}`,
  },
  {
    key: "biography",
    label: "Biography",
    render: (user) =>
      user.biography ? user.biography : "No biography provided",
  },
  { key: "email", label: "Email" },
  {
    key: "phone_number",
    label: "Phone number",
    render: (user) =>
      user.phone_number ? user.phone_number : "No phone number",
  },
  {
    key: "postal_address",
    label: "Postal address",
    render: (user) =>
      user.postal_address ? user.postal_address : "No postal address",
  },
  {
    key: "birthday",
    label: "Birthday",
    render: (user) => {
      if (!user.birthday) return "No birthday provided";
      const [year, month, day] = user.birthday.split("-");

      return `${Number(day)}/${Number(month)}/${year}`;
    },
  },
  {
    key: "createdAt",
    label: "Date created",
    render: (user) => {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    key: "activated",
    label: "Activated",
    render: (user) => (user.activated ? "Yes" : "No"),
  },
  {
    key: "suspended",
    label: "Suspended",
    render: (user) => (user.suspended ? "Yes" : "No"),
  },
  {
    key: "available",
    label: "Available for discovery",
    render: (user) => (user.available ? "Yes" : "No"),
  },
  {
    key: "resume",
    label: "Resume",
    render: (user) => {
      if (!user.resume) return "No resume uploaded";

      return (
        <a href={`${backendUrl}/${user.resume}`} target="_blank">
          Click to view resume
        </a>
      );
    },
  },
];

const businessFields = [
  { key: "business_name", label: "Business name" },
  { key: "owner_name", label: "Owner name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: " Phone number" },
  { key: "postal_address", label: "Postal address" },
  {
    key: "biography",
    label: "Biography",
    render: (business) =>
      business.biography ? business.biography : "No biography provided",
  },
  {
    key: "location",
    label: "Location",
    render: (business) => {
      if (!business.location) return <></>;

      const location = business.location;
      const url = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=15/${location.lat}/${location.lon}`;

      return (
        <a href={url} target="_blank" className="link">
          View location here
        </a>
      );
    },
  },
  {
    key: "activated",
    label: "Activated",
    render: (user) => (user.activated ? "Yes" : "No"),
  },
  {
    key: "verified",
    label: "Verified",
    render: (user) => (user.veriifed ? "Yes" : "No"),
  },
  {
    key: "createdAt",
    label: "Date created",
    render: (user) => {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString();
    },
  },
];

function Profile() {
  const role = localStorage.getItem("role");
  const [user, setUser] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState("");

  const endpoint = role === "regular" ? `${backendUrl}/users/me` : `${backendUrl}/businesses/me`;
  const fields = role === "regular" ? userFields : businessFields;

  const token = localStorage.getItem("token");
  const fileInputRef = useRef();

  // fetch user
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);

      try {
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        setUser(data);
        console.log(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    async function upload(file, type) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${endpoint}/${type}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      return data;
    }

    try {
      const data = await upload(file, "avatar");

      setUser((prev) => ({
        ...prev,
        avatar: data.avatar,
      }));
    } catch (e) {
      console.log(e);
    }
  }

  async function toggleAvailability(newAvailable) {
    async function callApi() {
      const response = await fetch(`${backendUrl}/users/me/available`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ available: newAvailable }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          available: data.available,
        }));
        return;
      }

      // setting availability did not work
      setPopup(`Could not toggle availability: ${data.error}`);
    }

    callApi();
  }

  if (role === "admin") {
    return <Unauthorised />;
  }

  if (loading) {
    return <h3>Loading profile...</h3>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
        }}
      >
        {/* Render profile image if avatar is not null */}
        {/* If it is null, return the normal icon */}
        {user.avatar ? (
          <div className="avatar-container">
            {user.avatar && (
              <>
                <img src={`${backendUrl}/${user.avatar}`} className="avatar" />

                <div className="avatar-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  <button
                    className="avatar-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Replace
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="avatar-container">
            <CgProfile className="CgProfile" />
            <div className="avatar-overlay">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <button
                className="avatar-btn"
                onClick={() => fileInputRef.current.click()}
              >
                Upload
              </button>
            </div>
          </div>
        )}
        <div>
          <ul>
            {fields.map(({ key, label, render }) => (
              <li key={key}>
                <strong>{label}:</strong> {render ? render(user) : user[key]}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {role === "regular" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn" onClick={() => toggleAvailability(true)}>
                Set available
              </button>
              <button className="btn" onClick={() => toggleAvailability(false)}>
                Set unavailable
              </button>
            </div>
          )}
          <button className="btn" onClick={() => setShowEdit(true)}>
            Edit profile
          </button>
        </div>
        {popup && (
          <div className="toast">
            <span>{popup}</span>
            <button onClick={() => setPopup("")}>✕</button>
          </div>
        )}
      </div>

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditProfile
              user={user}
              onUpdate={(updatedFields) => {
                setUser((prev) => ({
                  ...prev,
                  ...updatedFields,
                }));
              }}
              onClose={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
