import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/public/Landingpage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppRoutes from "./routes/AppRoutes";
import LearnerRoutes from "./routes/LearnerRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function RolePlaceholder({ label }) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <h1 className="text-2xl">
        {label} dashboard — coming soon.
      </h1>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ThemeProvider>
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/home"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/org-login"
        element={
          <RolePlaceholder label="Organization Login" />
        }
      />

      {/* =========================
          ADMIN
      ========================= */}

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* =========================
          LEARNER
      ========================= */}

      <Route
        path="/learner/*"
        element={
          <ProtectedRoute allowedRoles={["Learner", "Admin"]}>
            <LearnerRoutes />
          </ProtectedRoute>
        }
      />

      {/* =========================
          INSTRUCTOR
      ========================= */}

      <Route
        path="/instructor/*"
        element={
          <ProtectedRoute allowedRoles={["Instructor"]}>
            <RolePlaceholder label="Instructor" />
          </ProtectedRoute>
        }
      />

      {/* =========================
          TA
      ========================= */}

      <Route
        path="/ta/*"
        element={
          <ProtectedRoute allowedRoles={["TA"]}>
            <RolePlaceholder label="TA" />
          </ProtectedRoute>
        }
      />

      {/* =========================
          404
      ========================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
    </ThemeProvider>
  );
}

export default App;
