import { useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function SystemSettings() {
  const [resetCooldown, setResetCooldown] = useState(1);
  const [negotiationWindow, setNegotiationWindow] = useState(900);
  const [jobStartWindow, setJobStartWindow] = useState(168);
  const [availabilityTimeout, setAvailabilityTimeout] = useState(300);

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [popup, setPopup] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsUpdating(true);
    setPopup("");

    async function updateSettings() {
      // update all settings
      await fetch(`${backendUrl}/system/reset-cooldown`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reset_cooldown: resetCooldown,
        }),
      });

      await fetch(`${backendUrl}/system/negotiation-window`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          negotiation_window: negotiationWindow * 60,
        }),
      });

      await fetch(`${backendUrl}/system/job-start-window`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_start_window: jobStartWindow * 24,
        }),
      });

      const response = await fetch(`${backendUrl}/system/availability-timeout`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availability_timeout: availabilityTimeout * 60,
        }),
      });

      setIsUpdating(false);

      if (response.ok) {
        setPopup("Successfully updated settings");
        return;
      }

      const data = await response.json();
      setPopup(`Could not update settings: ${data.error}`);
    }

    updateSettings();
  };

  useEffect(() => {
    async function fetchSettings() {
      const response = await fetch(`${backendUrl}/system/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      setResetCooldown(data.resetCooldown);
      setNegotiationWindow(data.negotiationWindow / 60);
      setJobStartWindow(data.jobStartWindow / 24);
      setAvailabilityTimeout(data.availabilityTimeout / 60);

      setLoading(false);
    }

    fetchSettings();
  }, []);

  if (loading) {
    return <p>Loading system settings...</p>;
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>Reset cooldown (seconds)</label>
        <input
          type="number"
          value={resetCooldown}
          onChange={(e) => setResetCooldown(Number(e.target.value))}
        />{" "}
        <label>Negotiation window (minutes)</label>
        <input
          type="number"
          value={negotiationWindow}
          onChange={(e) => setNegotiationWindow(Number(e.target.value))}
        />{" "}
        <label>Job start window (days)</label>
        <input
          type="number"
          value={jobStartWindow}
          onChange={(e) => setJobStartWindow(Number(e.target.value))}
        />{" "}
        <label>Availability timeout (minutes)</label>
        <input
          type="number"
          value={availabilityTimeout}
          onChange={(e) => setAvailabilityTimeout(Number(e.target.value))}
        />{" "}
        <button className="btn" type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </form>

      {popup && (
        <div className="toast">
          <span>{popup}</span>
          <button onClick={() => setPopup("")}>✕</button>
        </div>
      )}
    </>
  );
}

export default SystemSettings;
