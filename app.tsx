"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, createContext, useContext, type ReactNode } from "react"
import DashboardLayout from "./components/dashboard-layout"
import LoginPage from "./pages/login-page"
import DashboardHome from "./pages/dashboard-home"
import UsersPage from "./pages/users-page"
import AnalyticsPage from "./pages/analytics-page"
import SettingsPage from "./pages/settings-page"

interface AuthContextType {
  isAuthenticated: boolean
  user: { name: string; email: string } | null
  login: (asGuest?: boolean) => void
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
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const login = (asGuest = false) => {
    setIsAuthenticated(true)
    if (asGuest) {
      setUser({ name: "Guest User", email: "guest@example.com" })
    } else {
      setUser({ name: "Admin User", email: "admin@shfli.com" })
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
    </AuthProvider>
  )
}
