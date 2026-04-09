import "./Chatbox.css";
import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../socket";

function Chatbox({ negotiationId, currName, otherName }) {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const bottomRef = useRef(null);

  // set up listener for receiving messages
  useEffect(() => {
    let socket = getSocket();

    const handler = (data) => {
      const date = new Date(data.createdAt);
      setMessageList((prev) => [
        ...prev,
        { date: date, message: data.text, sender: otherName },
      ]);
    };

    socket.on("negotiation:message", handler);

    return () => {
      socket.off("negotiation:message", handler);
    };
  }, []);

  // scroll to bottom when messageList changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  function handleSubmit(e) {
    e.preventDefault();

    // add message to messageList
    setMessageList((prev) => [
      ...prev,
      { date: new Date(), message: message, sender: currName },
    ]);

    // emit message to server
    let socket = getSocket();
    socket.emit("negotiation:message", {
      negotiation_id: negotiationId,
      text: message,
    });

    // clear message
    setMessage("");
  }

  return (
    <div id="chatbox">
      <div className="messages">
        {messageList.map(({ date, message, sender }) => {
          return (
            <div
              key={date}
              className={`message ${sender === currName ? "selfMessage" : "otherMessage"}`}
            >
              <div>{message}</div>
              <div className="messageInfo">
                {sender} | {date.toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" class="btn">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbox;
