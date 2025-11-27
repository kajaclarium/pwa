import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { runFullSync } from "./services/syncService"; // Your sync function

export default function App() {

  useEffect(() => {
    // Trigger sync when the app goes online
    if (navigator.onLine) {
      console.log("🟢 You are online. Syncing data...");
      runFullSync();
    }

    // Listen for online status change
    const handleOnline = () => {
      console.log("🟢 You are online. Syncing data...");
      runFullSync();
    };

    const handleOffline = () => {
      console.log("🔴 You are offline. Data will be saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Layout>
      <Home />
    </Layout>
  );
}
