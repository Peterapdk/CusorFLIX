import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold">CinemaRebel</Link>
        <div className="flex gap-3 text-white/80">
          <Link href="/search">Search</Link>
          <Link href="/library">Library</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </nav>
    </header>
  );
}


