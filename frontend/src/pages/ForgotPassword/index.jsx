import { useState } from "react";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [popup, setPopup] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // request a token
    async function requestToken() {
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

      if (!response.ok) {
        setPopup(`Cannot reset password: ${token.error}`);
        return;
      }

      // to create a link with the token
      setPopup(`/reset/${token.resetToken}`);

      // store email in localStorage
      localStorage.setItem("email", email);
    }

    requestToken();
  }

  return (
    <div style={{textAlign: "center"}}>
      <h4>Enter your email to reset your password</h4>

      <form onSubmit={handleSubmit}>
        <div className="form-field" style={{width: "50%"}}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <button type="submit" className="btn">
          Reset
        </button>
      </form>

      {popup !== "" && (
        <div style={{ paddingTop: "20px" }}>
          {popup.startsWith("/reset") ? (
            <>
              <p>Click here to reset your password</p>
              <Link to={popup}>Reset password</Link>
            </>
          ) : (
            <p style={{ color: "red" }}>{popup}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
