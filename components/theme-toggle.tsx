'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme, isMounted, currentTheme } = useTheme()

  if (!isMounted) {
    return (
      <button
        className="p-2 text-foreground hover:text-cinema-orange transition-colors rounded-md hover:bg-secondary/50"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="w-5 h-5" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  const isDark = currentTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-foreground hover:text-cinema-orange transition-colors rounded-md hover:bg-secondary/50"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

