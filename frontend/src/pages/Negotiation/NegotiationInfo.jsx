import { useEffect } from "react";
import { getSocket } from "../../socket";

function NegotiationInfo({ negotiation, onDecision }) {
  // listen for negotiation:decision event
  useEffect(() => {
    let socket = getSocket();

    const handler = (data) => {
      const decision = data.decision;
      console.log("received decision");

      onDecision(decision);
    };

    console.log("mounting decision handler");

    socket.on("negotiation:decision", handler);

    return () => {
      socket.off("negotiation:decision", handler);
    };
  }, []);

  return (
    <div>
      <h3>Negotiation info</h3>

      <div style={{ display: "flex", gap: "4rem" }}>
        <ul>
          <li>
            <strong>Worker:</strong> {negotiation.user.first_name}{" "}
            {negotiation.user.last_name}
          </li>
          <li>
            <strong>Business:</strong> {negotiation.job.business.business_name}
          </li>
          <li>
            <strong>Position:</strong> {negotiation.job.position_type.name}
          </li>
        </ul>

        <ul>
          <li>
            <strong>Worker decision: </strong>{" "}
            {negotiation.decisions.candidate === null
              ? "none"
              : negotiation.decisions.candidate}
          </li>
          <li>
            <strong>Business decision: </strong>{" "}
            {negotiation.decisions.business === null
              ? "none"
              : negotiation.decisions.business}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NegotiationInfo;
