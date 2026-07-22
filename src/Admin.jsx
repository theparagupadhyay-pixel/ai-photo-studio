import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : window.location.origin;

function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState("");

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const userSocketIdRef = useRef(null);

  const connectAdmin = () => {
    setMessage("");

    if (!adminKey.trim()) {
      setMessage("Admin key enter karo.");
      return;
    }

    socketRef.current?.disconnect();

    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("admin:join", { key: adminKey }, (response) => {
        if (!response?.success) {
          setMessage(response?.message || "Admin login failed.");
          socket.disconnect();
          return;
        }

        setConnected(true);
        setMessage("Admin panel connected.");
      });
    });

    socket.on("admin:sessions", (sessionList) => {
      setSessions(Array.isArray(sessionList) ? sessionList : []);
    });

    socket.on(
      "signal:offer",
      async ({ sessionId, userSocketId, offer }) => {
        try {
          peerRef.current?.close();

          const peer = new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302",
              },
            ],
          });

          peerRef.current = peer;
          userSocketIdRef.current = userSocketId;

          peer.ontrack = (event) => {
            const stream = event.streams?.[0];

            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream;
            }
          };

          peer.onicecandidate = (event) => {
            if (!event.candidate || !userSocketIdRef.current) {
              return;
            }

            socket.emit("signal:ice", {
              targetSocketId: userSocketIdRef.current,
              candidate: event.candidate,
            });
          };

          await peer.setRemoteDescription(offer);

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.emit("signal:answer", {
            userSocketId,
            answer: peer.localDescription,
          });

          setSelectedSession(sessionId);
          setMessage(`Watching session: ${sessionId}`);
        } catch (error) {
          console.error(error);
          setMessage("Live screen connection failed.");
        }
      }
    );

    socket.on("signal:ice", async ({ candidate }) => {
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });
  };

  const watchSession = (sessionId) => {
    if (!socketRef.current || !connected) {
      setMessage("Pehle admin login karo.");
      return;
    }

    setSelectedSession(sessionId);
    setMessage("User screen connection ka wait ho raha hai...");

    socketRef.current.emit(
      "admin:watch",
      { sessionId },
      (response) => {
        if (!response?.success) {
          setMessage(response?.message || "Session watch nahi ho saka.");
        }
      }
    );
  };

  useEffect(() => {
    return () => {
      peerRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <main className="app admin-page">
      <section className="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">PHOTO SAFETY</p>
            <h1>Admin Panel</h1>
          </div>

          <div>
            <span>
              Status: {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </header>

        {!connected && (
          <section className="panel">
            <h2>Admin login</h2>

            <input
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
            />

            <button
              className="primary-button"
              onClick={connectAdmin}
            >
              Connect admin panel
            </button>

            <p>
              Abhi server ki default key:
              <strong> change-this-admin-key</strong>
            </p>
          </section>
        )}

        {message && (
          <section className="panel">
            <p>{message}</p>
          </section>
        )}

        <section className="status-grid">
          <article className="status-card">
            <div>
              <strong>Total sessions</strong>
              <p>{sessions.length}</p>
            </div>
          </article>

          <article className="status-card">
            <div>
              <strong>Online users</strong>
              <p>
                {
                  sessions.filter(
                    (session) => session.status === "online"
                  ).length
                }
              </p>
            </div>
          </article>

          <article className="status-card">
            <div>
              <strong>Screen active</strong>
              <p>
                {
                  sessions.filter(
                    (session) => session.screenActive
                  ).length
                }
              </p>
            </div>
          </article>
        </section>

        <section className="panel">
          <h2>User sessions</h2>

          {sessions.length === 0 ? (
            <p>Abhi koi user session available nahi hai.</p>
          ) : (
            <div className="admin-session-list">
              {sessions.map((session) => (
                <article
                  className="status-card"
                  key={session.sessionId}
                >
                  <div>
                    <strong>{session.sessionId}</strong>

                    <p>Status: {session.status}</p>

                    <p>
                      Screen:
                      {session.screenActive
                        ? " Sharing"
                        : " Not sharing"}
                    </p>

                    <p>
                      Notification:
                      {session.notification || "pending"}
                    </p>

                    {session.location ? (
                      <>
                        <p>
                          Latitude:
                          {session.location.latitude}
                        </p>

                        <p>
                          Longitude:
                          {session.location.longitude}
                        </p>

                        <p>
                          Accuracy:
                          {Math.round(
                            session.location.accuracy || 0
                          )}{" "}
                          metres
                        </p>
                      </>
                    ) : (
                      <p>Location unavailable</p>
                    )}

                    <button
                      className="primary-button"
                      disabled={
                        session.status !== "online" ||
                        !session.screenActive
                      }
                      onClick={() =>
                        watchSession(session.sessionId)
                      }
                    >
                      Watch live screen
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>
            Live screen
            {selectedSession
              ? ` — ${selectedSession}`
              : ""}
          </h2>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="media-preview"
          />

          {!selectedSession && (
            <p>
              Online screen-sharing user select karo.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default Admin;