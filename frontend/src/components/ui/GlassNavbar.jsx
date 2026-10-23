import React from 'react';

export default function GlassNavbar({ onStartPracticing, onNavigateToAuth, user, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="h-16 max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-gutter">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-space-sm group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-[20px]">psychology</span>
          </div>
          <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
            MockMate<span className="text-primary-container font-bold">.AI</span>
          </span>
        </a>

        {/* Navigation links */}
        <nav className="hidden xl:flex items-center gap-gutter">
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#features">Features</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#how-it-works">How It Works</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#analytics">Analytics</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#languages">Languages</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#who-its-for">Who It's For</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#tech-stack">Tech Stack</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-space-md">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onStartPracticing}
                className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_2px_8px_rgba(0,113,227,0.25)] hover:bg-primary transition-all duration-200 active:scale-95"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-error-container hover:text-on-error-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToAuth}
                className="hidden sm:inline-flex px-4 py-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onStartPracticing}
                className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_2px_8px_rgba(0,113,227,0.25)] hover:bg-primary transition-all duration-200 active:scale-95"
              >
                Start Practicing
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
