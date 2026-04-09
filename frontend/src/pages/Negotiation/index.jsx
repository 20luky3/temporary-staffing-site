import { useEffect, useState } from "react";
import UserNotStarted from "./UserNotStarted";
import BusinessNotStarted from "./BusinessNotStarted";
import NegotiationInfo from "./NegotiationInfo";
import Timer from "./Timer";
import Chatbox from "./Chatbox";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Negotiation() {
  const [negotiation, setNegotiation] = useState({});
  const [popup, setPopup] = useState("");

  const [currName, setCurrName] = useState("");
  const [otherName, setOtherName] = useState("");

  const [loading, setLoading] = useState(true);

  async function setDecision(decision) {
    const response = await fetch(`${backendUrl}/negotiations/me/decision`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        negotiation_id: negotiation.id,
        decision: decision,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setPopup(`Could not set decision: ${data.error}`);
      return;
    }

    // update negotiation objecct with new decision values
    setNegotiation((prev) => {
      return {
        ...prev,
        decisions: {
          candidate: data.decisions.candidate,
          business: data.decisions.business,
        },
      };
    });
  }

  // onload: try to fetch active negotiation
  useEffect(() => {
    async function getActive() {
      try {
        const response = await fetch(`${backendUrl}/negotiations/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNegotiation(data);

          const regularName = `${data.user.first_name} ${data.user.last_name}`;
          const businessName = data.job.business.business_name;

          if (localStorage.getItem("role") === "regular") {
            setCurrName(regularName);
            setOtherName(businessName);
          } else {
            setCurrName(businessName);
            setOtherName(regularName);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    getActive();
  }, []);

  // trigger toast popup if decisions get changed
  useEffect(() => {
    // if both are accepts, say negotiation succes
    if (
      negotiation.decisions?.candidate === "accept" &&
      negotiation.decisions?.business === "accept"
    ) {
      setPopup("Negotiation success!");
    }

    // if one was decline, say negotiation failed
    if (negotiation.decisions?.candidate === "decline") {
      setPopup("Negotiation failed, candidate declined");
    }

    if (negotiation.decisions?.business === "decline") {
      setPopup("Negotation failed, business declined");
    }
  }, [negotiation.decisions?.candidate, negotiation.decisions?.business]);

  if (loading) {
    return <p>Loading negotiation...</p>;
  }

  const duration = Math.max(
    0,
    (new Date(negotiation.expiresAt) - new Date()) / 1000,
  );

  return (
    <div>
      {Object.keys(negotiation).length === 0 ? (
        localStorage.getItem("role") === "regular" ? (
          <UserNotStarted />
        ) : (
          <BusinessNotStarted />
        )
      ) : (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div>
              <NegotiationInfo
                negotiation={negotiation}
                onDecision={(decision) => {
                  const otherParty =
                    localStorage.getItem("role") === "regular"
                      ? "business"
                      : "candidate";

                  setNegotiation((prev) => {
                    return {
                      ...prev,
                      decisions: {
                        ...prev.decisions,
                        [otherParty]: decision,
                      },
                    };
                  });
                }}
              />
              <Timer duration={Math.floor(duration)} />
              <div style={{ display: "flex", gap: "10px", padding: "10px 0" }}>
                <button className="btn" onClick={() => setDecision("accept")}>
                  Accept
                </button>
                <button className="btn" onClick={() => setDecision("decline")}>
                  Decline
                </button>
              </div>
            </div>
            <Chatbox
              negotiationId={negotiation.id}
              currName={currName}
              otherName={otherName}
            />
          </div>
          {popup && (
            <div className="toast">
              <span>{popup}</span>
              <button onClick={() => setPopup("")}>✕</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Negotiation;
