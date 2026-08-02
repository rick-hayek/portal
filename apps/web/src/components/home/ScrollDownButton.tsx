'use client';

import React from 'react';

export function ScrollDownButton() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      aria-label="Scroll down to content"
      className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer group focus:outline-none opacity-80 hover:opacity-100 transition-all"
    >
      <span className="text-[0.68rem] font-mono font-bold tracking-[0.25em] uppercase text-[var(--portal-color-text-tertiary)] group-hover:text-[var(--portal-color-primary)] transition-colors">
        SCROLL
      </span>
      <svg
        className="h-4.5 w-4.5 animate-bounce text-[var(--portal-color-text-tertiary)] group-hover:text-[var(--portal-color-primary)] transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
