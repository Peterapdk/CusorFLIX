'use client';

import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { theme, setTheme, currentTheme, isMounted } = useTheme();
  return (
    <main className="min-h-dvh p-6 space-y-6 bg-background">
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your account and preferences</p>
      </section>

      <div className="space-y-6">
        <section className="rounded border border-border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Account</h2>
          <div className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input
                id="email"
                type="email"
                disabled
                aria-disabled="true"
                aria-describedby="email-description"
                className="w-full rounded bg-input px-3 py-2 outline-none ring-1 ring-border text-muted-foreground"
                placeholder="Not configured"
              />
              <p id="email-description" className="mt-1 text-xs text-muted-foreground">
                Authentication not yet implemented
              </p>
            </div>
          </div>
        </section>

        <section className="rounded border border-border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="theme-select" className="block text-sm font-medium text-foreground">Theme</label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isMounted ? `Current: ${currentTheme === 'dark' ? 'Dark' : 'Light'} mode` : 'Loading...'}
                </p>
              </div>
              {isMounted && (
                <select
                  id="theme-select"
                  value={theme || 'system'}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="rounded bg-input px-3 py-2 outline-none ring-1 ring-border text-foreground border-none focus:ring-2 focus:ring-primary"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              )}
            </div>
          </div>
        </section>

        <section className="rounded border border-border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Data</h2>
          <div className="space-y-4">
            <button
              className="rounded bg-secondary px-4 py-2 ring-1 ring-border hover:bg-secondary/80 transition-colors text-secondary-foreground"
              disabled
              aria-disabled="true"
              aria-describedby="export-description"
            >
              Export Library
            </button>
            <p id="export-description" className="text-xs text-muted-foreground">
              Export functionality coming soon
            </p>
          </div>
        </section>

        <section className="rounded border border-border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              CinemaRebel v0.1.0
            </p>
            <p className="text-muted-foreground">
              Built with Next.js, TMDB API, and CinemaOS
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

