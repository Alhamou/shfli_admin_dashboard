import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  useState,
  createContext,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import DashboardLayout from "./src/components/DashboardLayout";
import DashboardHome from "./src/pages/DashboardHome";
import { UserInfo } from "./src/pages/UsersPage";
import { ChatLogs } from "./src/pages/ChatLogs";
import SettingsPage from "./src/pages/SettingsPage";
import { LoginPage } from "./src/pages/LoginPage";
import Provider from "./src/context/MainProvider";
import { signin } from "@/services/authServices";
import { ILogin, IObjectToken } from "@/interfaces";
import { saveTokenInLocalStorage } from "@/lib/helpFunctions";
import { jwtDecode } from "jwt-decode";
import storageController from "@/controllers/storageController";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import Commercial from "@/pages/Commercial";
import { StatisticsPage } from "@/pages/ٍStatistics";
import { Admin } from "@/pages/Admin";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IObjectToken | null;
  login: (data: ILogin, asGuest?: boolean) => Promise<void>;
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
  const [user, setUser] = useState<IObjectToken | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setUser(
        jwtDecode<IObjectToken>(storageController.get("token") as string)
      );
    }
  }, []);

  const login = async (data: ILogin) => {
    try {
      const res = await signin(data);
      if (res.token) {
        saveTokenInLocalStorage(res.token);
        setIsAuthenticated(true);
        setUser(jwtDecode<IObjectToken>(res.token));
      }
      setIsAuthenticated(true);
    } catch (err) {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = storageController.get("language");
    if (language) {
      i18n.changeLanguage(language as string);
    }
  }, []);
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
