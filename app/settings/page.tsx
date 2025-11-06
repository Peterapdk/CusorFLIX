export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <main className="min-h-dvh p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-white/70">Manage your account and preferences</p>
      </section>

      <div className="space-y-6">
        <section className="rounded border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                type="email"
                disabled
                aria-disabled="true"
                aria-describedby="email-description"
                className="w-full rounded bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 text-white/50"
                placeholder="Not configured"
              />
              <p id="email-description" className="mt-1 text-xs text-white/50">
                Authentication not yet implemented
              </p>
            </div>
          </div>
        </section>

        <section className="rounded border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="dark-mode" className="block text-sm font-medium">Dark Mode</label>
                <p className="text-xs text-white/50 mt-1">Currently always enabled</p>
              </div>
              <input
                id="dark-mode"
                type="checkbox"
                checked
                disabled
                aria-disabled="true"
                aria-describedby="dark-mode-description"
                className="rounded"
              />
              <span id="dark-mode-description" className="sr-only">Dark mode is always enabled</span>
            </div>
          </div>
        </section>

        <section className="rounded border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Data</h2>
          <div className="space-y-4">
            <button
              className="rounded bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15 transition-colors"
              disabled
              aria-disabled="true"
              aria-describedby="export-description"
            >
              Export Library
            </button>
            <p id="export-description" className="text-xs text-white/50">
              Export functionality coming soon
            </p>
          </div>
        </section>

        <section className="rounded border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm">
            <p className="text-white/70">
              CinemaRebel v0.1.0
            </p>
            <p className="text-white/50">
              Built with Next.js, TMDB API, and CinemaOS
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

