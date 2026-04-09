"use strict";

const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const SECRET_KEY = "A2RyDMaJUiFVTi9PWwuIe8IpQbpjjeFTn9sgVO4cMzT";

let globalIo;

async function attach_sockets(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    let decoded;

    // authenticate the connection
    const token = socket.handshake.auth.token;

    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (e) {
      // verification failed, disconnect socket
      console.log("Authentication failed, disconnecting socket");
      return socket.disconnect();
    }

    // associate the socket with the authenticated user
    socket.userId = decoded.id;

    console.log("Socket connected userId:", decoded.id);

    // automatically join socket to the account:<accountId> room
    socket.join(`account:${decoded.id}`);

    // event listener when client emits a message
    socket.on("negotiation:message", async (payload) => {
      const negotiationId = payload.negotiation_id;
      const text = payload.text;

      // check user is authenticated
      if (!socket.userId) {
        return socket.emit("negotiation:error", {
          error: "Not authenticated",
          message: `This user is not authenticated, cannot emit messages`,
        });
      }

      // check negotiation exists/is active
      const currentTime = new Date();

      const negotiation = await prisma.negotiation.findFirst({
        where: {
          id: negotiationId,
          expiresAt: { gt: currentTime },
          status: "active",
        },
        include: { interest: true },
      });

      if (!negotiation) {
        return socket.emit("negotiation:error", {
          error: "Negotiation not found",
          message: `Negotiation ${negotiationId} does not exist or is not active`,
        });
      }

      // check authenticated user is part of this negotiation
      if (
        negotiation.interest.candidateId !== socket.userId &&
        negotiation.interest.businessId !== socket.userId
      ) {
        return socket.emit("negotiation:error", {
          error: "Not part of this negotiation",
          message: `Authenticated user is not part of this negotiation ${negotiationId}`,
        });
      }

      // check negotiation id is the authenticated user's active negotiation
      const userActiveNegotiation = await prisma.negotiation.findFirst({
        where: {
          interest: {
            is: {
              OR: [
                { candidateId: socket.userId },
                { businessId: socket.userId },
              ],
            },
          },
          expiresAt: { gt: currentTime },
          status: "active",
        },
      });

      if (
        !userActiveNegotiation ||
        userActiveNegotiation.id !== negotiationId
      ) {
        return socket.emit("negotiation:error", {
          error: "Negotiation mismatch",
          message: `Negotiation id is not the authenticated user's active negotiation`,
        });
      }

      // emit the message
      const response = {
        negotiation_id: negotiationId,
        sender: {
          role:
            negotiation.interest.businessId === socket.userId
              ? "business"
              : "candidate",
          id: socket.userId,
        },
        text,
        createdAt: new Date().toISOString(),
      };

      socket
        .to(`negotiation:${negotiationId}`)
        .emit("negotiation:message", response);
    });
  });

  globalIo = io;

  return io;
}

// starting a negotiation - add users to room
async function startNegotiation(negotiation) {
  const io = globalIo;

  const negotiationId = negotiation.id;
  const candidateId = negotiation.interest.candidateId;
  const businessId = negotiation.interest.businessId;

  const payload = {
    negotiation_id: negotiationId,
  };

  console.log("candidateId:", candidateId);
  console.log("businessId:", businessId);

  // notify both sides that a negotiation has started
  io.to(`account:${candidateId}`).emit("negotiation:started", payload);
  io.to(`account:${businessId}`).emit("negotiation:started", payload);

  // add users to the negotiation room
  io.in(`account:${candidateId}`).socketsJoin(`negotiation:${negotiationId}`);
  io.in(`account:${businessId}`).socketsJoin(`negotiation:${negotiationId}`);
}

// whenever a decision is made, let the other user know
async function decisionMade(negotiation, userDecision, senderRole) {
  const io = globalIo;

  const negotiationId = negotiation.id;
  const candidateId = negotiation.interest.candidateId;
  const businessId = negotiation.interest.businessId;

  const otherUserId = senderRole === "business" ? candidateId : businessId;

  const payload = {
    negotiation_id: negotiationId,
    decision: userDecision,
  };

  // emit message that decision was made
  io.to(`account:${otherUserId}`).emit("negotiation:decision", payload);
}

module.exports = { attach_sockets, startNegotiation, decisionMade };
