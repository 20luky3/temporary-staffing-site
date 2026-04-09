import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Activate() {
  const [message, setMessage] = useState("Activating your account...");
  const { token } = useParams();
  const hasRun = useRef(false);

  useEffect(() => {
    // this prevents it from running twice and crashing
    if (hasRun.current) return;
    hasRun.current = true;

    async function activateAccount() {
      try {
        const response = await fetch(`${backendUrl}/auth/resets/${token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: localStorage.getItem("email"),
          }),
        });

        console.log(response);

        setMessage("Account activated! Please log in.");
        localStorage.removeItem("email");
      } catch (err) {
        console.error(`Activation failed: ${err.message}`);
      }
    }

    activateAccount();
  }, []);

  return (
    <>
      <p>{message}</p>
      {message.startsWith("Account activated!") ? (
        <Link to="/login">Click here to log in</Link>
      ) : (
        <></>
      )}
    </>
  );
}

export default Activate;
