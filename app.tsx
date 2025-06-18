"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, createContext, useContext, type ReactNode } from "react"
import DashboardLayout from "./src/components/dashboard-layout"
import DashboardHome from "./src/pages/dashboard-home"
import UsersPage from "./src/pages/users-page"
import AnalyticsPage from "./src/pages/analytics-page"
import SettingsPage from "./src/pages/settings-page"
import { LoginPage } from "./src/pages/login-page"
import Provider from './src/context/MainProvider';
import { signin } from "@/services/authServices"
import { ILogin, IObjectToken } from "@/interfaces"
import { saveTokenInLocalStorage } from "@/lib/helpFunctions"
import {jwtDecode} from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean
  user: IObjectToken | null
  login: (data: ILogin, asGuest?: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<IObjectToken | null>(null)

  const login = async (data : ILogin) => {
    try{
const res = await signin(data)
        if (res.token) {
          saveTokenInLocalStorage(res.token);
          setIsAuthenticated(true);
          setUser(jwtDecode<IObjectToken>(res.token));
        }
          setIsAuthenticated(true)
    }catch (err){

    }

  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
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
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
      </Provider>
    </AuthProvider>
  )
}
