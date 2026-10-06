"use client";

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LandingLocationBar() {
  const { location, envUpdatedAt, locationPermission, requestLocation, envLoading } = useApp();
  const [query, setQuery] = useState('');
  const [noResult, setNoResult] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setNoResult(Boolean(query.trim()));
    window.setTimeout(() => setNoResult(false), 3000);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-rose shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span className="text-sm font-600 text-sycle-dark">{location}</span>
        <span className="text-xs text-sycle-muted ml-auto">{envUpdatedAt ? new Date(envUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum live'}</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setNoResult(false); }} placeholder="Cari kota atau wilayah..." className="flex-1 bg-white border border-sycle-border rounded-xl px-4 py-2.5 text-sm text-sycle-dark placeholder:text-sycle-muted focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose/40 transition-all" aria-label="Cari kota atau wilayah" />
        <button type="button" onClick={() => void requestLocation()} disabled={envLoading} className="px-3 py-2.5 bg-white border border-sycle-border rounded-xl text-sycle-muted hover:bg-blush hover:text-rose hover:border-rose/30 transition-all text-xs font-500 disabled:opacity-50" aria-label="Izinkan akses lokasi">
          {envLoading ? '…' : locationPermission === 'granted' ? '↻ Lokasi' : '📍 Lokasi'}
        </button>
      </form>

      {locationPermission === 'denied' && <p className="mt-2 text-xs text-rose-dark bg-blush rounded-xl px-4 py-3">Izin lokasi ditolak. Aktifkan kembali dari pengaturan izin situs di browser untuk memakai kondisi live.</p>}
      {noResult && <p className="mt-2 text-sm text-sycle-muted bg-blush rounded-xl px-4 py-3">Pencarian kota masih menjadi fallback manual. Kondisi live paling akurat menggunakan izin lokasi perangkat.</p>}
    </div>
  );
}
