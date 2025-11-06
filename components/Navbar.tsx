'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Route } from 'next';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: Array<{ href: Route; label: string }> = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/library', label: 'Library' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Main Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cinema-black/95 backdrop-blur-md border-b border-cinema-gray-dark">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-cinema-orange to-cinema-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-cinema-orange transition-colors">
                CinemaRebel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-cinema-white-muted hover:text-cinema-orange transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <Link
                href="/search"
                className="p-2 text-cinema-white-muted hover:text-cinema-orange transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-cinema-white-muted hover:text-cinema-orange transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-cinema-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-20 left-0 right-0 bg-cinema-gray-dark border-b border-cinema-gray-medium p-6">
            <div className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg text-cinema-white-muted hover:text-cinema-orange transition-colors font-medium py-2"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}

