import express from "express";
import http from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);  

const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-admin-key";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);


app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const sessions = new Map();

function getPublicSession(sessionId, session) {
  return {
    sessionId,
    userSocketId: session.userSocketId,
    status: session.status,
    notification: session.notification,
    location: session.location,
    screenActive: session.screenActive,
    connectedAt: session.connectedAt,
    lastSeen: session.lastSeen,
  };
}

function getAllSessions() {
  return Array.from(sessions.entries()).map(([sessionId, session]) =>
    getPublicSession(sessionId, session)
  );
}

function sendSessionsToAdmins() {
  io.to("admins").emit("admin:sessions", getAllSessions());
}

app.get("/api/health", (request, response) => {
  response.json({
    success: true,
    message: "Photo Safety backend is running",
  });
});

app.get("/health", (request, response) => {
  response.json({
    success: true,
    activeSessions: sessions.size,
  });
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("admin:join", ({ key } = {}, callback) => {
    if (key !== ADMIN_KEY) {
      callback?.({
        success: false,
        message: "Invalid admin key",
      });

      return;
    }

    socket.data.role = "admin";
    socket.join("admins");

    callback?.({
      success: true,
      message: "Admin connected",
    });

    socket.emit("admin:sessions", getAllSessions());
  });

  socket.on("user:join", ({ sessionId } = {}, callback) => {
    const validSessionId =
      typeof sessionId === "string" &&
      /^[a-zA-Z0-9_-]{6,50}$/.test(sessionId);

    if (!validSessionId) {
      callback?.({
        success: false,
        message: "Invalid session ID",
      });

      return;
    }

    socket.data.role = "user";
    socket.data.sessionId = sessionId;

    sessions.set(sessionId, {
      userSocketId: socket.id,
      status: "online",
      notification: "pending",
      location: null,
      screenActive: false,
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    });

    callback?.({
      success: true,
      sessionId,
    });

    sendSessionsToAdmins();
  });

  socket.on("notification:update", ({ status } = {}) => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session || socket.data.role !== "user") {
      return;
    }

    session.notification = status;
    session.lastSeen = new Date().toISOString();

    sendSessionsToAdmins();
  });

  socket.on("location:update", ({ latitude, longitude, accuracy } = {}) => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session || socket.data.role !== "user") {
      return;
    }

    const coordinatesAreValid =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (!coordinatesAreValid) {
      return;
    }

    session.location = {
      latitude,
      longitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
      updatedAt: new Date().toISOString(),
    };

    session.lastSeen = new Date().toISOString();

    sendSessionsToAdmins();
  });

  socket.on("screen:update", ({ active } = {}) => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session || socket.data.role !== "user") {
      return;
    }

    session.screenActive = Boolean(active);
    session.lastSeen = new Date().toISOString();

    sendSessionsToAdmins();
  });

  socket.on("admin:watch", ({ sessionId } = {}, callback) => {
    if (socket.data.role !== "admin") {
      callback?.({
        success: false,
        message: "Admin access required",
      });

      return;
    }

    const session = sessions.get(sessionId);

    if (!session || session.status !== "online") {
      callback?.({
        success: false,
        message: "User session is not online",
      });

      return;
    }

    io.to(session.userSocketId).emit("user:admin-ready", {
      adminSocketId: socket.id,
    });

    callback?.({
      success: true,
    });
  });

  socket.on(
    "signal:offer",
    ({ adminSocketId, sessionId, offer } = {}) => {
      if (socket.data.role !== "user" || !adminSocketId || !offer) {
        return;
      }

      io.to(adminSocketId).emit("signal:offer", {
        sessionId,
        userSocketId: socket.id,
        offer,
      });
    }
  );

  socket.on("signal:answer", ({ userSocketId, answer } = {}) => {
    if (socket.data.role !== "admin" || !userSocketId || !answer) {
      return;
    }

    io.to(userSocketId).emit("signal:answer", {
      adminSocketId: socket.id,
      answer,
    });
  });

  socket.on("signal:ice", ({ targetSocketId, candidate } = {}) => {
    if (!targetSocketId || !candidate) {
      return;
    }

    io.to(targetSocketId).emit("signal:ice", {
      senderSocketId: socket.id,
      candidate,
    });
  });

  socket.on("disconnect", () => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (session && session.userSocketId === socket.id) {
      session.status = "offline";
      session.screenActive = false;
      session.lastSeen = new Date().toISOString();

      sendSessionsToAdmins();
    }

    console.log("Disconnected:", socket.id);
  });
});
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.use((request, response, next) => {
  if (
    request.path.startsWith("/api/") ||
    request.path === "/health" ||
    request.path.startsWith("/socket.io")
  ) {
    return next();
  }

  response.sendFile(path.join(distPath, "index.html"));
});
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Admin key: ${ADMIN_KEY}`);
});