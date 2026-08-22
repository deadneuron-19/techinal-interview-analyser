import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api";

function BackendStatus() {
  const [status, setStatus] = useState("Checking...");
  const [error, setError] = useState(false);

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setStatus(data.status);
      })
      .catch(() => {
        setStatus("Unavailable");
        setError(true);
      });
  }, []);

  return (
    <div>
      <strong>Backend:</strong>{" "}
      <span>{error ? "Unavailable" : status}</span>
    </div>
  );
}

export default BackendStatus;