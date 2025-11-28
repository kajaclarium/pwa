import { useEffect } from "react";
import { runFullSync } from "../services/syncService";

export default function useSync() {
  useEffect(() => {
    if (navigator.onLine) {
      console.log("🟢 Online — syncing...");
      runFullSync();
    }

    const handleOnline = () => {
      console.log("🟢 Online — syncing...");
      runFullSync();
    };

    const handleOffline = () => {
      console.log("🔴 Offline — data stored locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);


    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
}
