"use client";
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';

const BENEFITS = [
  'Journal harian',
  'Catatan berdasarkan tanggal',
  'Reflection yang tersimpan',
  'Ringkasan catatan',
  'Konteks yang dapat digunakan kembali',
  'Download PDF',
  'Melanjutkan dari kunjungan sebelumnya',
];

export default function AccountBenefit() {
  const navigate = useNavigate();
  const { isLoggedIn, saveToJournal, showToast } = useApp();

  if (isLoggedIn) {
    const id = saveToJournal();
    navigate(`/journal/${id}`, { replace: true });
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-8rem)] flex flex-col justify-center">
      <div className="bg-white rounded-3xl border border-sycle-border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-rose/5 via-blush to-lavender/30 p-8 text-center">
          <div className="w-16 h-16 bg-rose/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📓</span>
          </div>
          <h1 className="font-800 text-2xl text-sycle-dark mb-2">Simpan perjalananmu dari hari ke hari</h1>
          <p className="text-sm text-sycle-muted">Buat akun untuk menyimpan catatan dan melanjutkannya kapan saja.</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-sycle-bg rounded-2xl border border-sycle-border p-4">
              <p className="font-700 text-sm text-sycle-muted mb-1">TAMU</p>
              <p className="font-600 text-base text-sycle-dark mb-3">"Pahami kondisi hari ini."</p>
              <ul className="space-y-1.5 text-xs text-sycle-muted">
                <li className="flex items-center gap-1.5"><span className="text-sage">✓</span> Gunakan SYCLE tanpa login</li>
                <li className="flex items-center gap-1.5"><span className="text-sage">✓</span> Lihat environmental dashboard</li>
                <li className="flex items-center gap-1.5"><span className="text-sage">✓</span> Dapatkan evidence kontekstual</li>
                <li className="flex items-center gap-1.5"><span className="text-sage">✓</span> Gunakan Reflection dalam sesi</li>
                <li className="flex items-center gap-1.5 opacity-50"><span>✕</span> Hasil tidak tersimpan setelah sesi</li>
              </ul>
            </div>
            <div className="bg-rose/5 rounded-2xl border border-rose/20 p-4">
              <p className="font-700 text-sm text-rose mb-1">MEMBER</p>
              <p className="font-600 text-base text-sycle-dark mb-3">"Simpan dan lanjutkan dari hari ke hari."</p>
              <ul className="space-y-1.5 text-xs text-sycle-dark">
                <li className="flex items-center gap-1.5"><span className="text-sage">✓</span> Semua fitur Tamu</li>
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-center gap-1.5"><span className="text-sage">✓</span> {b}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/daftar')}
              className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Buat Akun & Simpan ke Journal
            </button>
            <button
              onClick={() => navigate('/masuk')}
              className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3.5 font-600 text-sm hover:bg-blush transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/untukmu')}
              className="w-full text-sycle-muted text-sm font-500 py-2 hover:text-sycle-dark transition-colors focus:outline-none"
            >
              Tetap lanjut tanpa akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
