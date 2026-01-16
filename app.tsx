import {
  Suspense, lazy,
  useEffect,
  type ReactNode
} from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import DashboardLayout from "./src/components/DashboardLayout";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Provider from "./src/context/MainProvider";

const Admin = lazy(() => import("./src/pages/Admin").then(m => ({ default: m.default })));
const BidsScreen = lazy(() => import("./src/pages/Bids").then(m => ({ default: m.default })));
const Commercial = lazy(() => import("./src/pages/Commercial").then(m => ({ default: m.default })));
const PendingAds = lazy(() => import("./src/pages/PendingAds").then(m => ({ default: m.default })));
const StatisticsPage = lazy(() => import("./src/pages/Statistics").then(m => ({ default: m.default })));
const ChatLogs = lazy(() => import("./src/pages/ChatLogs").then(m => ({ default: m.ChatLogs })));
const DashboardHome = lazy(() => import("./src/pages/DashboardHome").then(m => ({ default: m.default })));
const LoginPage = lazy(() => import("./src/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const SettingsPage = lazy(() => import("./src/pages/SettingsPage").then(m => ({ default: m.default })));
const UserInfo = lazy(() => import("./src/pages/UsersPage").then(m => ({ default: m.UserInfo })));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const isAuthorized = user?.roles?.some((role: string) => ["admin", "team"].includes(role));
      if (!isAuthorized) {
        logout();
      }
    }
  }, [isAuthenticated, user, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user data to load before checking authorization
  if (isAuthenticated && !user) {
    return <div className="h-screen w-screen flex items-center justify-center">جاري التحقق من الصلاحيات...</div>;
  }

  const isAuthorized = user?.roles?.some((role: string) => ["admin", "team"].includes(role));
  if (!isAuthorized) {
    return <Navigate to="/login" replace state={{ error: "unauthorized" }} />;
  }

  return <>{children}</>;
}

function ProtectedRouteAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !user) {
    return <div className="h-screen w-screen flex items-center justify-center">جاري التحقق من الصلاحيات...</div>;
  }

  if (!user?.roles?.includes("admin")) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Provider>
        <Router>
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">جاري التحميل...</div>}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute>
                    <DashboardHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute>
                    <UserInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bids"
                element={
                  <ProtectedRoute>
                    <BidsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pending"
                element={
                  <ProtectedRoute>
                    <PendingAds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="statistics"
                element={
                  <ProtectedRoute>
                    <StatisticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chats"
                element={
                  <ProtectedRoute>
                    <ChatLogs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="admin"
                element={
                  <ProtectedRouteAdmin>
                    <Admin />
                  </ProtectedRouteAdmin>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="commercialAds"
                element={
                  <ProtectedRoute>
                    <Commercial />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  </AuthProvider>
  );
}
