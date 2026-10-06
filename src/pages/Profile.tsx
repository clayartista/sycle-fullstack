"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

export default function Profile() {
  const navigate = useNavigate();
  const { isLoggedIn, userName, logout, personalization, savedContext, showToast } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [offlineMode] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="font-700 text-xl text-sycle-dark mb-2">Profil tersedia untuk Member</h2>
        <p className="text-sm text-sycle-muted mb-6">Masuk atau buat akun untuk mengakses profil dan pengaturanmu.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/daftar')} className="bg-rose text-white px-6 py-3 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Buat Akun</button>
          <button onClick={() => navigate('/masuk')} className="border border-sycle-border px-6 py-3 rounded-xl font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Masuk</button>
        </div>
      </div>
    );
  }

  if (offlineMode) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📡</div>
        <h2 className="font-700 text-lg text-sycle-dark mb-2">Kamu sedang offline.</h2>
        <p className="text-sm text-sycle-muted">Beberapa data terbaru belum tersedia.</p>
        <p className="text-xs text-sycle-muted mt-2">Data terakhir tersedia: 16 September 2026, 10:15</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    showToast('Kamu telah keluar.');
    navigate('/');
  };

  const sections = [
    {
      title: 'Akun',
      items: [
        { label: 'Profil', icon: '👤', action: () => {} },
        { label: 'Konteks Tersimpan', icon: '📋', action: () => {} },
        { label: 'Lokasi Pilihan', icon: '📍', action: () => {} },
      ],
    },
    {
      title: 'Preferensi',
      items: [
        { label: 'Preferensi', icon: '⚙️', action: () => {} },
        { label: 'Privasi & Data', icon: '🔒', action: () => {} },
      ],
    },
    {
      title: 'Informasi',
      items: [
        { label: 'Tentang SYCLE', icon: '🌿', action: () => {} },
        { label: 'Sumber Evidence', icon: '📚', action: () => {} },
      ],
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-rose/5 via-blush to-lavender/20 rounded-2xl p-6 mb-6 text-center border border-rose/10">
        <div className="w-16 h-16 rounded-full bg-rose text-white flex items-center justify-center text-2xl font-700 mx-auto mb-3">
          {(userName || 'A')[0].toUpperCase()}
        </div>
        <h2 className="font-700 text-xl text-sycle-dark">{userName}</h2>
        <p className="text-sm text-sycle-muted mt-0.5">Member SYCLE</p>
      </div>

      {(savedContext || personalization) && (
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm mb-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Konteks Tersimpan</p>
          <div className="flex flex-wrap gap-2">
            {(savedContext?.ageRange || personalization?.ageRange) && (
              <span className="px-2.5 py-1 bg-lavender rounded-lg text-xs font-500 text-sycle-dark">{savedContext?.ageRange || personalization?.ageRange}</span>
            )}
            {(savedContext?.womenContext || personalization?.womenContext || []).filter(c => c !== 'Saya tidak ingin menjawab').map(c => (
              <span key={c} className="px-2.5 py-1 bg-blush rounded-lg text-xs font-500 text-rose">{c}</span>
            ))}
          </div>
          <button
            onClick={() => navigate('/personalisasi')}
            className="mt-3 text-xs text-rose font-600 hover:underline focus:outline-none"
          >
            Perbarui konteks →
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-2xl border border-sycle-border shadow-sm overflow-hidden">
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide px-4 py-3 border-b border-sycle-border bg-sycle-bg">{section.title}</p>
            <div>
              {section.items.map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-blush/30 transition-colors border-b border-sycle-border last:border-0 focus:outline-none focus:bg-blush/30"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-500 text-sm text-sycle-dark flex-1">{item.label}</span>
                  <svg className="w-4 h-4 text-sycle-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white rounded-2xl border border-sycle-border shadow-sm p-4 text-left flex items-center gap-3 hover:bg-blush/30 transition-colors focus:outline-none"
        >
          <span className="text-lg">🚪</span>
          <span className="font-500 text-sm text-rose">Keluar</span>
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <Logo size="sm" className="opacity-40" />
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-sycle-dark/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-6 shadow-2xl">
            <div className="w-10 h-1 bg-sycle-border rounded-full mx-auto mb-5 sm:hidden" />
            <h3 className="font-700 text-lg text-sycle-dark mb-2">Yakin ingin keluar?</h3>
            <p className="text-sm text-sycle-muted mb-5">Journal dan data akunmu tetap tersimpan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 border border-sycle-border rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Batal</button>
              <button onClick={handleLogout} className="flex-1 bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
