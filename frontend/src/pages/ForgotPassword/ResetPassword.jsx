import { useParams, Link } from "react-router-dom";
import { useState } from "react";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();

    // try to reset password with token
    async function reset() {
      const response = await fetch(`${backendUrl}/auth/resets/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
          password: password,
        }),
      });

      if (response.ok) {
        setPopup("Password reset successful! Please try to log in");
        localStorage.removeItem("email");
        return;
      }

      // password reset failed
      const data = await response.json();
      setPopup(`Cannot reset password: ${data.error}`);
      return;
    }

    // validate password
    if (!validatePassword(password)) {
      setPopup("Cannot reset password, does not meet the requirements");
      return;
    }

    reset();
  }

  return (
    <div style={{ textAlign: "center" }}>
      <form onSubmit={handleSubmit}>
        <div className="form-field" style={{ width: "60%" }}>
          <label>
            <strong>Enter your new password</strong>
          </label>
          <em>
            Password must be 8 to 20 characters, include a number, an uppercase
            letter, a lowercase character, and a special character.
          </em>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn">
          Submit
        </button>
      </form>

      {popup !== "" && (
        <div style={{ marginTop: "10px" }}>
          {popup.startsWith("Password") ? (
            <>
              <p style={{ marginBottom: "10px" }}>{popup}</p>
              <Link to="/login" className="btn">
                Login
              </Link>
            </>
          ) : (
            <p style={{ color: "red" }}>{popup}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
