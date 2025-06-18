import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof localStorage !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme
      }
    }
    return "system"
  })

  useEffect(() => {
    const root = window.document.documentElement
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"

    const appliedTheme = theme === "system" ? systemTheme : theme

    root.classList.remove("light", "dark")
    root.classList.add(appliedTheme)
    
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  return {
    theme,
    setTheme,
  }
}