'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useTheme()

  if (!isMounted) {
    return (
      <button
        className="p-2 text-cinema-white-muted hover:text-cinema-orange transition-colors"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="w-5 h-5" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-cinema-white-muted hover:text-cinema-orange transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

