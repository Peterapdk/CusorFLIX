# Theming Implementation Plan - CinemaRebel

**Created:** 2025-01-27  
**Status:** 📋 Ready for Implementation  
**Source:** v0-cursorflix repository (https://github.com/Peterapdk/v0-cursorflix.git)  
**Priority:** Medium-High (User Experience Enhancement)

---

## Executive Summary

This plan outlines the integration of a comprehensive theming system from the v0-cursorflix repository into CinemaRebel. The implementation will add dark/light mode support, theme persistence, and a modern color system using OKLCH color space while maintaining the existing CinemaOS-inspired design aesthetic.

**Key Features:**
- ✅ Dark/Light mode toggle
- ✅ System preference detection
- ✅ Theme persistence (localStorage)
- ✅ Smooth theme transitions
- ✅ OKLCH color space for better color consistency
- ✅ Integration with existing CinemaOS color palette

---

## Current State Analysis

### Existing Theming (CinemaRebel)
- **Colors:** Custom CSS variables with hex values
- **Palette:** CinemaOS-inspired (black, gray, orange, red, green, yellow)
- **Mode:** Single dark theme only
- **Storage:** No theme persistence
- **Toggle:** No theme switching capability

### Target Theming (v0-cursorflix)
- **Colors:** CSS variables with OKLCH color space
- **Palette:** Minimalist design with Netflix red accent
- **Mode:** Dark/Light mode support
- **Storage:** localStorage persistence
- **Toggle:** Theme provider with system preference detection
- **Library:** `next-themes` for theme management

---

## Implementation Phases

## Phase 1: Dependencies & Setup (High Priority)

### 1.1 Install Required Packages

**Action:** Add `next-themes` package

```bash
npm install next-themes
```

**Files Affected:**
- `package.json`

**Complexity:** 1/5  
**Estimated Time:** 5 minutes

---

### 1.2 Create Theme Provider Component

**Action:** Create theme provider wrapper component

**File:** `components/theme-provider.tsx`

```typescript
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Complexity:** 1/5  
**Estimated Time:** 10 minutes

---

### 1.3 Create Theme Hook (Optional Enhancement)

**Action:** Create custom theme hook for additional functionality

**File:** `hooks/use-theme.ts`

```typescript
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
```

**Complexity:** 2/5  
**Estimated Time:** 15 minutes

---

## Phase 2: Color System Migration (High Priority)

### 2.1 Update CSS Variables with OKLCH Colors

**Action:** Migrate from hex to OKLCH color space while preserving CinemaOS aesthetic

**File:** `app/globals.css`

**Current Colors (Hex):**
- `--cinema-black: #000000`
- `--cinema-orange: #ff4757`
- `--cinema-gray-dark: #1a1a1a`

**Target Colors (OKLCH with CinemaOS palette):**

```css
:root {
  /* Light mode - CinemaOS-inspired light theme */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.15 0 0);
  --card: oklch(0.96 0 0);
  --card-foreground: oklch(0.15 0 0);
  --popover: oklch(0.96 0 0);
  --popover-foreground: oklch(0.15 0 0);
  
  /* CinemaOS Orange as Primary */
  --primary: oklch(0.6 0.22 25); /* CinemaOS orange */
  --primary-foreground: oklch(1 0 0);
  
  --secondary: oklch(0.85 0.02 0);
  --secondary-foreground: oklch(0.15 0 0);
  --muted: oklch(0.6 0 0);
  --muted-foreground: oklch(0.5 0 0);
  --accent: oklch(0.6 0.22 25);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.55 0.22 25); /* CinemaOS red */
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.88 0.01 0);
  --input: oklch(0.96 0 0);
  --ring: oklch(0.6 0.22 25);
  
  /* CinemaOS-specific colors */
  --cinema-black: oklch(0 0 0);
  --cinema-black-light: oklch(0.05 0 0);
  --cinema-gray-dark: oklch(0.15 0 0);
  --cinema-gray-medium: oklch(0.25 0 0);
  --cinema-gray-light: oklch(0.35 0 0);
  --cinema-orange: oklch(0.6 0.22 25);
  --cinema-orange-light: oklch(0.65 0.22 25);
  --cinema-red: oklch(0.55 0.22 25);
  --cinema-green: oklch(0.7 0.15 150);
  --cinema-yellow: oklch(0.75 0.15 80);
  --cinema-white: oklch(1 0 0);
  --cinema-white-muted: oklch(0.7 0 0);
  --cinema-white-dim: oklch(0.5 0 0);
  
  --radius: 0.5rem;
}

/* Dark mode - CinemaOS dark theme (default) */
.dark {
  --background: oklch(0.06 0 0); /* CinemaOS black */
  --foreground: oklch(0.95 0.01 0);
  --card: oklch(0.12 0.01 0); /* CinemaOS gray-dark */
  --card-foreground: oklch(0.95 0.01 0);
  --popover: oklch(0.12 0.01 0);
  --popover-foreground: oklch(0.95 0.01 0);
  
  /* CinemaOS Orange as Primary */
  --primary: oklch(0.6 0.22 25); /* CinemaOS orange */
  --primary-foreground: oklch(1 0 0);
  
  --secondary: oklch(0.18 0.01 0); /* CinemaOS gray-medium */
  --secondary-foreground: oklch(0.9 0.01 0);
  --muted: oklch(0.35 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.6 0.22 25);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.55 0.22 25); /* CinemaOS red */
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.2 0.01 0);
  --input: oklch(0.12 0.01 0);
  --ring: oklch(0.6 0.22 25);
  
  /* CinemaOS-specific colors (dark mode) */
  --cinema-black: oklch(0 0 0);
  --cinema-black-light: oklch(0.05 0 0);
  --cinema-gray-dark: oklch(0.12 0.01 0);
  --cinema-gray-medium: oklch(0.18 0.01 0);
  --cinema-gray-light: oklch(0.25 0.01 0);
  --cinema-orange: oklch(0.6 0.22 25);
  --cinema-orange-light: oklch(0.65 0.22 25);
  --cinema-red: oklch(0.55 0.22 25);
  --cinema-green: oklch(0.7 0.15 150);
  --cinema-yellow: oklch(0.75 0.15 80);
  --cinema-white: oklch(0.95 0.01 0);
  --cinema-white-muted: oklch(0.7 0 0);
  --cinema-white-dim: oklch(0.5 0 0);
}
```

**Complexity:** 3/5  
**Estimated Time:** 30 minutes  
**Note:** OKLCH conversion requires careful color matching to preserve CinemaOS aesthetic

---

### 2.2 Update Tailwind Config

**Action:** Extend Tailwind config to use CSS variables

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: ['class'], // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme support
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Keep existing CinemaOS colors for backward compatibility
        cinema: {
          black: 'var(--cinema-black)',
          'black-light': 'var(--cinema-black-light)',
          'gray-dark': 'var(--cinema-gray-dark)',
          'gray-medium': 'var(--cinema-gray-medium)',
          'gray-light': 'var(--cinema-gray-light)',
          orange: 'var(--cinema-orange)',
          'orange-light': 'var(--cinema-orange-light)',
          red: 'var(--cinema-red)',
          green: 'var(--cinema-green)',
          yellow: 'var(--cinema-yellow)',
          white: 'var(--cinema-white)',
          'white-muted': 'var(--cinema-white-muted)',
          'white-dim': 'var(--cinema-white-dim)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // ... existing fontSize, spacing, aspectRatio, animation, keyframes
    },
  },
  plugins: [],
} satisfies Config;
```

**Complexity:** 2/5  
**Estimated Time:** 20 minutes

---

## Phase 3: Integration (High Priority)

### 3.1 Update Root Layout

**Action:** Wrap app with ThemeProvider

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'CinemaRebel - Your Premium Movie & TV Experience',
  description: 'Discover trending movies and TV shows. Stream with CinemaOS integration. Your ultimate entertainment destination.',
  keywords: 'movies, tv shows, streaming, cinema, entertainment, tmdb',
  openGraph: {
    title: 'CinemaRebel - Premium Movie & TV Experience',
    description: 'Discover trending movies and TV shows with CinemaOS streaming integration',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-cinema-black text-white antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cinema-orange focus:text-white focus:rounded"
          >
            Skip to main content
          </a>
          <ErrorBoundary>
            <Navbar />
            <main id="main-content" className="relative">
              {children}
            </main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Changes:**
- Add `suppressHydrationWarning` to `<html>` tag
- Wrap children with `<ThemeProvider>`
- Configure ThemeProvider with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`

**Complexity:** 2/5  
**Estimated Time:** 15 minutes

---

### 3.2 Create Theme Toggle Component

**Action:** Create theme toggle button for Navbar

**File:** `components/theme-toggle.tsx`

```typescript
'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useTheme()

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 hover:bg-cinema-gray-medium transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-cinema-orange" />
      ) : (
        <Moon className="h-5 w-5 text-cinema-orange" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Dependencies:**
- `lucide-react` (may need to install)
- `@/components/ui/button` (check if exists, may need to create)

**Complexity:** 2/5  
**Estimated Time:** 20 minutes

---

### 3.3 Add Theme Toggle to Navbar

**Action:** Integrate theme toggle into existing Navbar

**File:** `components/Navbar.tsx`

```typescript
// Add import
import { ThemeToggle } from '@/components/theme-toggle'

// Add to Navbar component (near other navigation items)
<ThemeToggle />
```

**Complexity:** 1/5  
**Estimated Time:** 10 minutes

---

## Phase 4: Component Updates (Medium Priority)

### 4.1 Update Components to Use Theme Variables

**Action:** Migrate hardcoded colors to CSS variables

**Files to Update:**
- `components/ui/MediaCard.tsx`
- `components/ui/HeroSection.tsx`
- `components/ui/ContentCarousel.tsx`
- `components/Navbar.tsx`
- All error boundaries
- All loading states

**Pattern:**
```typescript
// Before:
className="bg-cinema-black text-white"

// After:
className="bg-background text-foreground"
// OR keep CinemaOS-specific classes if they're theme-aware:
className="bg-cinema-black dark:bg-cinema-black text-foreground"
```

**Complexity:** 3/5  
**Estimated Time:** 2-3 hours (depending on component count)

---

### 4.2 Add Transition Animations

**Action:** Add smooth theme transition animations

**File:** `app/globals.css`

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  body {
    @apply bg-background text-foreground;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}
```

**Complexity:** 1/5  
**Estimated Time:** 10 minutes

---

## Phase 5: Testing & Refinement (Medium Priority)

### 5.1 Test Theme Switching

**Action:** Verify theme toggle works across all pages

**Test Cases:**
- ✅ Toggle between dark/light modes
- ✅ System preference detection
- ✅ Theme persistence after page reload
- ✅ Theme persistence across navigation
- ✅ No flash of wrong theme (FOUC prevention)
- ✅ All components render correctly in both themes
- ✅ Images and media maintain visibility
- ✅ Contrast ratios meet accessibility standards

**Complexity:** 2/5  
**Estimated Time:** 1 hour

---

### 5.2 Accessibility Audit

**Action:** Ensure theme switching is accessible

**Checks:**
- ✅ Keyboard navigation for theme toggle
- ✅ Screen reader announcements
- ✅ Color contrast ratios (WCAG AA minimum)
- ✅ Focus indicators visible in both themes
- ✅ ARIA labels on theme toggle

**Complexity:** 2/5  
**Estimated Time:** 30 minutes

---

### 5.3 Performance Testing

**Action:** Verify theme switching doesn't impact performance

**Metrics:**
- Theme toggle response time (< 100ms)
- No layout shift during theme change
- Smooth transitions
- No console errors

**Complexity:** 1/5  
**Estimated Time:** 20 minutes

---

## Phase 6: Optional Enhancements (Low Priority)

### 6.1 Theme Persistence in Database

**Action:** Store user theme preference in database (if user auth exists)

**File:** `lib/theme.ts` (new)

```typescript
import { getUserId } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getUserTheme(userId: string): Promise<'light' | 'dark' | 'system'> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { theme: true },
  })
  return (user?.theme as 'light' | 'dark' | 'system') || 'system'
}

export async function setUserTheme(userId: string, theme: 'light' | 'dark' | 'system') {
  await db.user.update({
    where: { id: userId },
    data: { theme },
  })
}
```

**Complexity:** 3/5  
**Estimated Time:** 1 hour  
**Note:** Requires user authentication system

---

### 6.2 Custom Theme Colors

**Action:** Allow users to customize accent colors

**Complexity:** 4/5  
**Estimated Time:** 4-6 hours  
**Note:** Advanced feature, defer to future

---

## Implementation Checklist

### Phase 1: Dependencies & Setup
- [ ] Install `next-themes` package
- [ ] Create `components/theme-provider.tsx`
- [ ] Create `hooks/use-theme.ts` (optional)

### Phase 2: Color System Migration
- [ ] Update `app/globals.css` with OKLCH colors
- [ ] Update `tailwind.config.ts` to use CSS variables
- [ ] Test color conversion accuracy

### Phase 3: Integration
- [ ] Update `app/layout.tsx` with ThemeProvider
- [ ] Create `components/theme-toggle.tsx`
- [ ] Add theme toggle to Navbar
- [ ] Install `lucide-react` if needed
- [ ] Create/verify `components/ui/button.tsx` exists

### Phase 4: Component Updates
- [ ] Update MediaCard component
- [ ] Update HeroSection component
- [ ] Update ContentCarousel component
- [ ] Update Navbar component
- [ ] Update error boundaries
- [ ] Update loading states
- [ ] Add transition animations

### Phase 5: Testing & Refinement
- [ ] Test theme switching functionality
- [ ] Test theme persistence
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Cross-browser testing

### Phase 6: Optional Enhancements
- [ ] Database theme persistence (if auth exists)
- [ ] Custom theme colors (future)

---

## Dependencies

### New Packages Required
```json
{
  "next-themes": "^0.4.6",
  "lucide-react": "^0.454.0" // If not already installed
}
```

### Existing Packages Used
- `next` (already installed)
- `react` (already installed)
- `tailwindcss` (already installed)

---

## Color Conversion Reference

### Hex to OKLCH Conversion

**CinemaOS Orange (#ff4757):**
- OKLCH: `oklch(0.6 0.22 25)`

**CinemaOS Black (#000000):**
- OKLCH: `oklch(0 0 0)`

**CinemaOS Gray Dark (#1a1a1a):**
- OKLCH: `oklch(0.12 0.01 0)`

**Tools for Conversion:**
- Use online OKLCH converters
- Or use CSS `color-mix()` for approximations
- Test visually to ensure color accuracy

---

## Migration Strategy

### Backward Compatibility
- Keep existing `cinema-*` color classes in Tailwind config
- Maintain existing component styles where possible
- Gradual migration: update components incrementally

### Rollout Plan
1. **Phase 1-2:** Setup and color system (no user-facing changes)
2. **Phase 3:** Add theme toggle (users can switch, default stays dark)
3. **Phase 4:** Update components (gradual, test each)
4. **Phase 5:** Polish and test
5. **Phase 6:** Optional enhancements

---

## Risk Assessment

### Low Risk
- ✅ Adding `next-themes` (well-maintained library)
- ✅ CSS variable migration (backward compatible)
- ✅ Theme toggle component (isolated feature)

### Medium Risk
- ⚠️ OKLCH color conversion accuracy (requires visual testing)
- ⚠️ Component updates (may need extensive testing)
- ⚠️ Theme persistence (localStorage should work, but test)

### Mitigation
- Test color conversions visually before full rollout
- Update components incrementally with testing
- Provide fallback to dark theme if issues occur
- Keep existing color system as fallback

---

## Success Metrics

### Functional Requirements
- ✅ Theme toggle works reliably
- ✅ Theme persists across sessions
- ✅ System preference detection works
- ✅ No visual regressions in dark mode
- ✅ Light mode is usable and accessible

### Performance Requirements
- ✅ Theme switch < 100ms response time
- ✅ No layout shift during theme change
- ✅ Smooth transitions (60fps)

### Accessibility Requirements
- ✅ WCAG AA contrast ratios in both themes
- ✅ Keyboard navigation works
- ✅ Screen reader compatible

---

## Timeline Estimate

### Phase 1: Dependencies & Setup
- **Time:** 30 minutes
- **Priority:** High

### Phase 2: Color System Migration
- **Time:** 1 hour
- **Priority:** High

### Phase 3: Integration
- **Time:** 45 minutes
- **Priority:** High

### Phase 4: Component Updates
- **Time:** 2-3 hours
- **Priority:** Medium

### Phase 5: Testing & Refinement
- **Time:** 2 hours
- **Priority:** Medium

### Phase 6: Optional Enhancements
- **Time:** 1-6 hours (depending on features)
- **Priority:** Low

**Total Estimated Time:** 6-8 hours (excluding optional enhancements)

---

## Next Steps

1. **Review Plan:** Confirm approach and color conversions
2. **Start Phase 1:** Install dependencies and create provider
3. **Test Incrementally:** Test each phase before proceeding
4. **Gather Feedback:** Test with users if possible
5. **Iterate:** Refine based on testing results

---

**Plan Created:** 2025-01-27  
**Last Updated:** 2025-01-27  
**Status:** Ready for Implementation  
**Owner:** Frontend Team

