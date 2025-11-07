"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const currentTheme = resolvedTheme || systemTheme || "dark"

  return {
    theme,
    setTheme,
    toggleTheme,
    isMounted,
    currentTheme,
    isDark: currentTheme === "dark",
  }
}

