import { useEffect, useState } from "react";
import { runFullSync } from "../services/syncService";

export default function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {

    async function syncIfOnline() {
      if (navigator.onLine) {
        console.log("🟢 Online — syncing...");
        setIsOnline(true);
        await runFullSync();
      } else {
        console.log("🔴 Offline — data stored locally.");
        setIsOnline(false);
      }
    }

    // Run once
    syncIfOnline();

    // Event when coming online
    const handleOnline = () => {
      setIsOnline(true);
      syncIfOnline();
    };

    // Event when going offline
    const handleOffline = () => {
      console.log("🔴 Went offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
