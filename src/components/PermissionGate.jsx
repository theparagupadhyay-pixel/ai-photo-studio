import { useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  MonitorUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "aiStudioPermissionGateCompleted_v2";

function PermissionGate({ children }) {
const [completed, setCompleted] = useState(
  sessionStorage.getItem(STORAGE_KEY) === "true"
);
  );

  const [loading, setLoading] = useState(false);
  const [shareForSupport, setShareForSupport] = useState(false);

  const [statuses, setStatuses] = useState({
    notification: "pending",
    location: "pending",
    screen: "not requested",
  });

  const screenStreamRef = useRef(null);

  const requestLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("unsupported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve("granted"),
        () => resolve("denied"),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });

  const requestAllPermissions = async () => {
    setLoading(true);

    let notificationStatus = "unsupported";

    if ("Notification" in window) {
      if (Notification.permission === "default") {
        notificationStatus =
          await Notification.requestPermission();
      } else {
        notificationStatus = Notification.permission;
      }
    }

    setStatuses((previous) => ({
      ...previous,
      notification: notificationStatus,
    }));

    const locationStatus = await requestLocation();

    setStatuses((previous) => ({
      ...previous,
      location: locationStatus,
    }));

    let screenStatus = "not requested";

    if (shareForSupport) {
      try {
        const stream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });

        screenStreamRef.current = stream;
        screenStatus = "sharing";

        const screenTrack = stream.getVideoTracks()[0];

        screenTrack?.addEventListener("ended", () => {
          screenStreamRef.current = null;

          setStatuses((previous) => ({
            ...previous,
            screen: "stopped",
          }));
        });
      } catch {
        screenStatus = "cancelled";
      }
    }

    setStatuses((previous) => ({
      ...previous,
      screen: screenStatus,
    }));

  sessionStorage.setItem(STORAGE_KEY, "true");
    setLoading(false);
    setCompleted(true);
  };

  const continueWithoutOptionalPermissions = () => {
   sessionStorage.setItem(STORAGE_KEY, "true");
    setCompleted(true);
  };

  if (completed) {
    return children;
  }

  return (
    <main className="permission-gate-page">
      <div className="permission-gate-glow permission-glow-one" />
      <div className="permission-gate-glow permission-glow-two" />

      <section className="permission-gate-card">
        <div className="permission-gate-logo">
          <Sparkles size={24} />
        </div>

        <div className="permission-gate-badge">
          <ShieldCheck size={16} />
          Secure permission setup
        </div>

        <h1>Welcome to AI Photo Studio</h1>

        <p className="permission-gate-description">
          Enable optional permissions for notifications,
          location-based support and Live Support screen sharing.
          You remain in control of every permission.
        </p>

        <div className="permission-gate-list">
          <article>
            <span className="permission-gate-icon">
              <Bell size={22} />
            </span>

            <div>
              <strong>Notifications</strong>
              <small>
                Receive editing and website updates
              </small>
            </div>

            <span className="permission-status">
              {statuses.notification}
            </span>
          </article>

          <article>
            <span className="permission-gate-icon">
              <MapPin size={22} />
            </span>

            <div>
              <strong>Location</strong>
              <small>
                Used only after browser permission
              </small>
            </div>

            <span className="permission-status">
              {statuses.location}
            </span>
          </article>

          <article>
            <span className="permission-gate-icon">
              <MonitorUp size={22} />
            </span>

            <div>
              <strong>Live Support screen sharing</strong>
              <small>
                Optional — your browser will let you select
                a screen, window or tab
              </small>
            </div>

            <span className="permission-status">
              {statuses.screen}
            </span>
          </article>
        </div>

        <label className="screen-support-option">
          <input
            type="checkbox"
            checked={shareForSupport}
            onChange={(event) =>
              setShareForSupport(event.target.checked)
            }
          />

          <span>
            Start optional Live Support screen sharing
          </span>
        </label>

        <button
          className="permission-continue-button"
          disabled={loading}
          onClick={requestAllPermissions}
        >
          {loading ? (
            <>
              <LoaderCircle
                className="permission-loading-icon"
                size={20}
              />
              Requesting permissions...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Continue to AI Studio
            </>
          )}
        </button>

        <button
          className="permission-skip-button"
          disabled={loading}
          onClick={continueWithoutOptionalPermissions}
        >
          Continue without optional permissions
        </button>

        <p className="permission-privacy-note">
          Screen sharing starts only when the Live Support
          option is selected. Chrome’s sharing indicator cannot
          be removed by website code.
        </p>
      </section>
    </main>
  );
}

export default PermissionGate;