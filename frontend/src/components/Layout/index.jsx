import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { connectSocket, getSocket } from "../../socket";
import { useEffect, useState } from "react";

function Layout() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let socket = getSocket();

    // make sure we have connected to socket
    if (!socket) {
      socket = connectSocket(localStorage.getItem("token"));
    }

    const handler = (data) => {
      console.log(`Negotiation start received: ${data}`);

      setNotification(
        "A negotiation has been started! Check the negotiation tab.",
      );
    };

    const onConnect = () => {
      socket.on("negotiation:started", handler);
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.on("connect", onConnect);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("negotiation:started", handler);
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>

      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#333",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "250px",
          }}
        >
          <span style={{ flex: 1 }}>{notification}</span>

          <button
            onClick={() => setNotification(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Layout;
