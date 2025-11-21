import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { setupOnlineSync } from "./services/syncService.js";
import store from "./store/store.js";

export default function App() {

  window.addEventListener("online", async () => {
    const unsynced = await db.offline_timesheet.toArray();
    if (unsynced.length === 0) return;
  
    const user = await supabase.auth.getUser();
  
    const payload = unsynced.map(p => ({
      ...p,
      user_id: user.data.user.id,
    }));
  
    const { error } = await supabase.from("timesheet").insert(payload);
  
    if (!error) {
      await db.offline_timesheet.clear();
      alert("Offline data synced to server.");
    }
  });

  
  window.addEventListener("offline", () => {
    alert("You are offline. Data will be saved locally.");
  });
  
  window.addEventListener("online", () => {
    alert("You are online. Syncing data...");
  });

  useEffect(() => {
    setupOnlineSync(store);
    },[]);
  

  return (
    <Layout>
      <Home />
    </Layout>
  );
}
