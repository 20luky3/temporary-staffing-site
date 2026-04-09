import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { connectSocket } from "../../socket";
import "./Login.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    async function login() {
      const response = await fetch(`${backendUrl}/auth/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // store login token and role
        const expiry = new Date(data.expiresAt).getTime();

        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", expiry);
        localStorage.setItem("role", data.role);

        // if user is not admin, also connect to socket
        if (data.role !== "admin") {
          connectSocket(data.token);
        }

        // navigate to home page
        navigate("/home");
        return;
      }

      setPopup(`Could not log in: ${data.error}`);
    }

    login();
  };

  return (
    <div className="content">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label for="email">Email</label>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="email"
          />
        </fieldset>
        <fieldset>
          <label for="password">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="password"
          />
        </fieldset>

        <button className="btn" type="submit">
          Log in
        </button>
      </form>

      <Link to="/forgot-password" className="link">
        Forgot password
      </Link>

      {popup !== "" && <p style={{ color: "red" }}>{popup}</p>}

      <div className="register">
        <h3>Don't have an account? Create one now!</h3>
        <div className="registerButtons">
          <Link className="btn" to="/register/user">
            Job seeker
          </Link>
          <Link className="btn" to="/register/business">
            Business
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
