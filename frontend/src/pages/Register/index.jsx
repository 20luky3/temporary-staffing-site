import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import LocationInput from "../../components/LocationInput";
import "./Register.css";

const regularUserFields = [
  { key: "first_name", label: "First name", required: true },
  { key: "last_name", label: "Last name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Password", type: "password", required: true },
  { key: "phone_number", label: "Phone number", type: "number" },
  { key: "postal_address", label: "Postal address" },
  { key: "birthday", label: "Birthday", type: "date" },
];

const businessFields = [
  { key: "business_name", label: "Business name", required: true },
  { key: "owner_name", label: "Owner name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Password", type: "password", required: true },
  {
    key: "phone_number",
    label: "Phone number",
    type: "number",
    required: true,
  },
  { key: "postal_address", label: "Postal address", required: true },
  { key: "location", label: "Location", type: "location", required: true },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function validatePassword(password) {
  if (password.length < 8 || password.length > 20) {
    console.log("too short");
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    return false;
  }

  if (!/[a-z]/.test(password)) {
    return false;
  }

  if (!/[0-9]/.test(password)) {
    return false;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return false;
  }

  return true;
}

function Register() {
  const { userType } = useParams();

  const fieldConfig = {
    user: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone_number: "",
      postal_address: "",
      birthday: "",
    },
    business: {
      business_name: "",
      owner_name: "",
      email: "",
      password: "",
      phone_number: "",
      postal_address: "",
      location: {
        lat: "",
        lon: "",
      },
    },
  };

  const [formData, setFormData] = useState({
    ...(fieldConfig[userType] || {}),
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fields = userType === "user" ? regularUserFields : businessFields;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check password requirements
    if (!validatePassword(formData.password)) {
      setShowPopup(true);
      setPopupMessage("Password does not meet the requirements");
      return;
    }

    const endpoint =
      userType === "user" ? `${backendUrl}/users` : `${backendUrl}/businesses`;

    // create a new account for this user
    async function createUser() {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const user = await response.json();

      return user;
    }

    const result = await createUser();

    // if user creation was unsuccessful, display an error message
    if (result.error) {
      setShowPopup(true);
      setPopupMessage(`Could not create user: ${result.error}`);
      return;
    }

    // if user creation was successful, create an activation link
    async function createToken(email) {
      const response = await fetch(`${backendUrl}/auth/resets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const token = await response.json();

      return token;
    }

    const tokenResponse = await createToken(result.email);

    // Store link in state
    setPopupMessage(`/activate/${tokenResponse.resetToken}`);
    setShowPopup(true);

    // store email in localStorage
    localStorage.setItem("email", result.email);
  };

  return (
    <div className="content" id="register">
      <h1>Register {userType}</h1>
      <p>
        <em>Fields marked with an asterisk (*) are required</em>
      </p>
      <form onSubmit={handleSubmit}>
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
                  value={formData[key] || ""}
                  required={required}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          }

          if (type === "password") {
            return (
              <div key={key} className="form-field">
                <label className="label-with-tooltip">
                  {label}
                  {required ? "*" : ""}

                  <span className="tooltip-icon">?</span>

                  <span className="tooltip-text">
                    Password must be 8 to 20 characters, include a number, an
                    uppercase letter, a lowercase character, and a special
                    character.
                  </span>
                </label>

                <input
                  type="password"
                  value={formData[key] || ""}
                  required={required}
                  onChange={(e) =>
                    setFormData((prev) => ({
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
                  lat={formData.location.lat}
                  lon={formData.location.lon}
                  required={required}
                  onChange={(lat, lon) =>
                    setFormData((prev) => ({
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
                  value={formData[key] || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({
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
                value={formData[key] || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    [key]: value,
                  }));
                }}
              />
            </div>
          );
        })}

        <button className="btn" type="submit">
          Register
        </button>
      </form>

      <Link to="/login" className="link">
        Already have an account? Click here to log in
      </Link>

      {showPopup && (
        <div style={{ marginTop: "10px" }}>
          {popupMessage.startsWith("/activate") ? (
            <>
              <p>Account created! Click here to activate</p>
              <Link to={popupMessage}>Activate Account</Link>
            </>
          ) : (
            <p style={{ color: "red" }}>{popupMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Register;
