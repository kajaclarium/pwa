import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { runFullSync } from "./services/syncService"; // Your sync function
import useSync from "./hook/useSync";

export default function App() {

  useSync();

  return (
    <Layout>
      <Home />
    </Layout>
  );
}
