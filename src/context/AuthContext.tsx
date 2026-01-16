import storageController from "@/controllers/storageController";
import { IObjectToken, IUser } from "@/interfaces";
import { saveTokenInLocalStorage } from "@/lib/helpFunctions";
import { signin, verifyOtp as verifyOtpService } from "@/services/authServices";
import { getUserInfo } from "@/services/restApiServices";
import { jwtDecode } from "jwt-decode";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: (IObjectToken & Partial<IUser>) | null;
  sendLoginOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otpCode: string) => Promise<void>;
  logout: () => void;
  setIsAuthenticated: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
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
          const fullUser = await getUserInfo(decoded.id.toString());
          setUser(prev => ({ ...prev, ...fullUser }));
        } catch (err) {
          console.error("Auth initialization failed", err);
          storageController.clear();
          setIsAuthenticated(false);
          setUser(null);
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
      const res = await verifyOtpService({ identifier, otp_code: otpCode });
      if (res.token) {
        saveTokenInLocalStorage(res.token);
        setIsAuthenticated(true);
        const decoded = jwtDecode<IObjectToken>(res.token);
        setUser(decoded);

        // Fetch full user info using the correct endpoint
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
      value={{ isAuthenticated, user, sendLoginOtp, verifyOtp, logout, setIsAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
