"use client";

import { useApp } from '@/context/AppContext';

export default function LocationPermissionCard({ compact = false }: { compact?: boolean }) {
  const {
    locationPermission,
    locationAccuracy,
    locationError,
    requestLocation,
    envLoading,
    envSource,
    location,
  } = useApp();

  const busy = envLoading || locationPermission === 'requesting';

  if (locationPermission === 'granted' && envSource !== 'live') {
    return (
      <div className={`rounded-2xl border border-powder bg-powder/40 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-sycle-dark shrink-0" aria-hidden>↻</div>
          <div className="min-w-0">
            <p className="text-sm font-700 text-sycle-dark">Izin lokasi aktif, data lingkungan sedang tidak tersedia</p>
            <p className="text-xs text-sycle-muted mt-0.5">Coba ambil ulang supaya kondisi lingkungan diperbarui.</p>
            <button type="button" onClick={() => void requestLocation()} disabled={busy} className="mt-2 rounded-xl bg-rose text-white px-3 py-2 text-xs font-700 disabled:opacity-50">{busy ? 'Memuat…' : 'Perbarui kondisi'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (locationPermission === 'granted' && envSource === 'live') {
    return (
      <div className={`rounded-2xl border border-sage bg-sage/30 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center text-green-800 shrink-0" aria-hidden>✓</div>
          <div className="min-w-0">
            <p className="text-sm font-700 text-sycle-dark">Lokasi aktif</p>
            <p className="text-xs text-sycle-muted mt-0.5">Kondisi lingkungan disesuaikan dengan lokasi perangkatmu.</p>
            <p className="text-[11px] text-sycle-muted mt-1">{location}{locationAccuracy ? ` · akurasi ±${Math.round(locationAccuracy)} m` : ''}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-rose/15 bg-blush/70 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-rose shrink-0" aria-hidden>⌖</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-700 text-sycle-dark">Gunakan lokasi untuk kondisi yang lebih relevan</p>
          <p className="text-xs text-sycle-muted leading-relaxed mt-1">
            SYCLE meminta izin lokasi hanya agar cuaca, kelembapan, dan kualitas udara mengikuti tempatmu saat ini. Koordinat tidak disimpan ke profil.
          </p>
          {locationPermission === 'denied' && (
            <p className="text-xs text-rose-dark mt-2">Izin lokasi ditolak. Aktifkan Geolocation untuk browser ini, lalu coba lagi.</p>
          )}
          {locationError && locationPermission !== 'denied' && (
            <p className="text-xs text-sycle-muted mt-2">{locationError}</p>
          )}
          <button
            type="button"
            onClick={() => void requestLocation()}
            disabled={busy || locationPermission === 'unsupported'}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-rose px-4 py-2.5 text-xs font-700 text-white hover:bg-rose-dark disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose/40"
          >
            {busy ? 'Mengambil lokasi…' : locationPermission === 'denied' ? 'Coba lagi' : 'Izinkan lokasi'}
          </button>
          <p className="text-[11px] text-sycle-muted mt-2">Tidak ada alamat rumah yang ditampilkan. Hanya konteks lingkungan yang diperlukan.</p>
        </div>
      </div>
    </div>
  );
}
