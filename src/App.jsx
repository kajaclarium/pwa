import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import User from "./pages/User";
import AuthProvider from "./context/AuthContext";
import useSync from "./hook/useSync";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

export default function App() {
  useSync();

  return (
    <AuthProvider>
      <BrowserRouter>
        
          <Routes>

            {/* Public route */}
            <Route path="/login" element={<Login  />} />

            {/* Protected pages */}
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
