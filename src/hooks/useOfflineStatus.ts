import { useEffect, useState } from "react";

const getInitialStatus = () => {
  if (typeof navigator === "undefined") return false;
  return !navigator.onLine;
};

export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(getInitialStatus);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
};

export default useOfflineStatus;
