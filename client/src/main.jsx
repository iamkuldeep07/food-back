// main react entry placeholder// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminPanel from "./pages/AdminPanel";
import { useAuthStore } from "./context/authStore";
import { setAuthToken } from "./api";

function Protected({ children, role }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
}

const App = () => {
  const { token } = useAuthStore();
  if (token) setAuthToken(token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <Protected>
              <StudentDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected role="admin">
              <AdminPanel />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);