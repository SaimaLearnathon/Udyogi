import { useEffect, useState } from "react";
import { listIncomingRequests } from "../api/requests";
import { useAuth } from "../context/AuthContext";

export function usePendingRequestCount() {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setCount(0);
      return;
    }
    let cancelled = false;

    listIncomingRequests(token)
      .then((data) => {
        if (!cancelled) setCount(data.filter((item) => item.status === "pending").length);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [token]);

  return count;
}
