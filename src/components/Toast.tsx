"use client";
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-sycle-dark text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-500 flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-200"
    >
      <span className="text-sage">✓</span>
      {toastMessage}
    </div>
  );
}
