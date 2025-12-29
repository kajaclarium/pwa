import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import User from "./pages/User";
import useSync from "./hook/useSync";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import AuthProvider from "./context/authContext";

export default function App() {
  useSync();

  return (
    <AuthProvider>
      <BrowserRouter basename="/pwa/">
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Header />
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected User */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <Layout>
                  <Header />
                  <User />
                </Layout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
