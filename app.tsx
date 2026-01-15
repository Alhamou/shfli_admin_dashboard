import storageController from "@/controllers/storageController";
import { ILogin, IObjectToken, IUser } from "@/interfaces";
import { saveTokenInLocalStorage } from "@/lib/helpFunctions";
import { Admin } from "@/pages/Admin";
import BidsScreen from "@/pages/Bids";
import Commercial from "@/pages/Commercial";
import PendingAds from "@/pages/PendingAds";
import { StatisticsPage } from "@/pages/ٍStatistics";
import { signin } from "@/services/authServices";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import DashboardLayout from "./src/components/DashboardLayout";
import Provider from "./src/context/MainProvider";
import { ChatLogs } from "./src/pages/ChatLogs";
import DashboardHome from "./src/pages/DashboardHome";
import { LoginPage } from "./src/pages/LoginPage";
import SettingsPage from "./src/pages/SettingsPage";
import { UserInfo } from "./src/pages/UsersPage";

interface AuthContextType {
  isAuthenticated: boolean;
  user: (IObjectToken & Partial<IUser>) | null;
  sendLoginOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otpCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    storageController.has("token")
  );
  const [user, setUser] = useState<(IObjectToken & Partial<IUser>) | null>(
    null
  );

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated) {
        const token = storageController.get("token") as string;
        try {
          const decoded = jwtDecode<IObjectToken>(token);
          setUser(decoded);

          // Fetch full user info using the correct endpoint
          const { getUserInfo } = await import("@/services/restApiServices");
          const fullUser = await getUserInfo(decoded.id.toString());
          setUser(prev => ({ ...prev, ...fullUser }));
        } catch (err) {
          console.error("Auth initialization failed", err);
        }
      }
    };
    initAuth();
  }, [isAuthenticated]);

  const sendLoginOtp = async (identifier: string) => {
    try {
      await signin({ identifier, password: "" });
    } catch (err) {
      throw err;
    }
  };

  const verifyOtp = async (identifier: string, otpCode: string) => {
    try {
      const { verifyOtp: verifyOtpService } = await import("@/services/authServices");
      const res = await verifyOtpService({ identifier, otp_code: otpCode });
      if (res.token) {
        saveTokenInLocalStorage(res.token);
        setIsAuthenticated(true);
        const decoded = jwtDecode<IObjectToken>(res.token);
        setUser(decoded);

        // Fetch full user info using the correct endpoint
        const { getUserInfo } = await import("@/services/restApiServices");
        const fullUser = await getUserInfo(decoded.id.toString());
        setUser((prev) => ({ ...prev, ...fullUser }));
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    storageController.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, sendLoginOtp, verifyOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function ProtectedRouteAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.roles.includes("admin") ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Provider>
        <Router>
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
        </Router>
        <Toaster position="top-right" richColors closeButton />
      </Provider>
    </AuthProvider>
  );
}
