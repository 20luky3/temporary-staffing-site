import { useState } from "react";
import "./EditProfile.css";
import LocationInput from "../LocationInput";

const regularUserFields = [
  { key: "first_name", label: "First name", required: true },
  { key: "last_name", label: "Last name", required: true },
  { key: "phone_number", label: "Phone number", type: "number" },
  { key: "postal_address", label: "Postal address" },
  { key: "birthday", label: "Birthday", type: "date" },
  { key: "biography", label: "Biography" },
];

const businessFields = [
  { key: "business_name", label: "Business name", required: true },
  { key: "owner_name", label: "Owner name", required: true },
  {
    key: "phone_number",
    label: "Phone number",
    type: "number",
    required: true,
  },
  { key: "postal_address", label: "Postal address", required: true },
  { key: "biography", label: "Biography" },
  { key: "location", label: "Location", type: "location", required: true },
];

function EditProfile({ user, onClose, onUpdate }) {
  const initialState =
    user.role === "regular"
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          postal_address: user.postal_address,
          birthday: user.birthday,
          biography: user.biography,
        }
      : {
          business_name: user.business_name,
          owner_name: user.owner_name,
          phone_number: user.phone_number,
          postal_address: user.postal_address,
          biography: user.biography,
          location: user.location,
        };

  const [updatedUser, setUpdatedUser] = useState(initialState);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const endpoint =
    user.role === "regular" ? `${backendUrl}/users/me` : `${backendUrl}/businesses/me`;

  const fields = user.role === "regular" ? regularUserFields : businessFields;

  async function updateUser() {
    // process fields: only include the ones that have been changed
    const payload = {};

    for (const field in updatedUser) {
      if (user[field] !== updatedUser[field]) {
        payload[field] = updatedUser[field];
      }
    }

    // update the user only if payload isn't empty
    if (Object.keys(payload).length > 0) {
      await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    }

    // update parent state
    onUpdate(payload);

    // close modal
    onClose();
  }

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

  return (
    <>
      <div className="top">
        <h3>Edit profile</h3>
        <button onClick={onClose}>X</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateUser();
        }}
      >
        {fields.map(({ key, label, type, required }) => {
          if (type === "date") {
            return (
              <div key={key} className="form-field">
                <label>
                  {label}
                  {required ? "*" : ""}
                </label>
                <input
                  type="date"
                  required={required}
                  value={updatedUser[key] || ""}
                  onChange={(e) =>
                    setUpdatedUser((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          }

          if (type === "location") {
            return (
              <div key={key} className="form-field">
                <label>
                  {label}
                  {required ? "*" : ""}
                </label>
                <LocationInput
                  lat={updatedUser.location.lat}
                  lon={updatedUser.location.lon}
                  required={required}
                  onChange={(lat, lon) =>
                    setUpdatedUser((prev) => ({
                      ...prev,
                      location: {
                        lat: lat,
                        lon: lon,
                      },
                    }))
                  }
                />
              </div>
            );
          }

          if (type === "number") {
            return (
              <div key={key} className="form-field">
                <label>
                  {label}
                  {required ? "*" : ""}
                </label>
                <input
                  type="number"
                  required={required}
                  value={updatedUser[key] || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setUpdatedUser((prev) => ({
                      ...prev,
                      [key]: value,
                    }));
                  }}
                />
              </div>
            );
          }

          return (
            <div key={key} className="form-field">
              <label>
                {label}
                {required ? "*" : ""}
              </label>
              <input
                type="text"
                required={required}
                value={updatedUser[key] || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setUpdatedUser((prev) => ({
                    ...prev,
                    [key]: value,
                  }));
                }}
              />
            </div>
          );
        })}

        {/* Special resume input handling only for regular user*/}

        {user.role === "regular" && (
          <div className="form-field">
            <label>Resume</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={async (e) => {
                const file = e.target.files[0];

                const resume = await upload(file, "resume");

                onUpdate(resume);
              }}
            />
          </div>
        )}

        <button className="btn" type="submit">
          Update user
        </button>
      </form>
    </>
  );
}

export default EditProfile;
