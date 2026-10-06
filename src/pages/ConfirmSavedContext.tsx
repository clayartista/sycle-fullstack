"use client";
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import type { SavedContext } from '../context/AppContext';

export default function ConfirmSavedContext() {
  const navigate = useNavigate();
  const { personalization, location, confirmGuestContext, saveToJournal, pendingAction, setPendingAction, showToast } = useApp();

  if (!personalization) {
    navigate('/member-setup', { replace: true });
    return null;
  }

  const detectedContext: SavedContext = {
    ageRange: personalization.ageRange,
    womenContext: personalization.womenContext.filter(c => c !== 'Saya tidak ingin menjawab'),
    preferredLocation: location.split(',')[0],
  };

  const handleConfirm = () => {
    confirmGuestContext(detectedContext);
    if (pendingAction === 'save') {
      const id = saveToJournal();
      setPendingAction(null);
      showToast('Catatan hari ini tersimpan ✓');
      navigate(`/journal/${id}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleReset = () => {
    navigate('/member-setup', { replace: true });
  };

  return (
    <div className="min-h-screen bg-sycle-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <div className="bg-white rounded-3xl border border-sycle-border p-6 shadow-sm">
          <div className="w-12 h-12 bg-lavender rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="font-700 text-xl text-sycle-dark mb-2">
            Gunakan konteks ini untuk kunjungan berikutnya?
          </h2>
          <p className="text-sm text-sycle-muted mb-5 leading-relaxed">
            Dengan menyimpan konteks ini, kamu tidak perlu mengisi ulang informasi yang masih sama.
          </p>

          <div className="bg-sycle-bg rounded-2xl border border-sycle-border p-4 space-y-3 mb-6">
            <ContextRow label="Rentang usia" value={detectedContext.ageRange || '—'} />
            {detectedContext.womenContext.length > 0 ? (
              <ContextRow label="Kondisi saat ini" value={detectedContext.womenContext.join(', ')} />
            ) : (
              <ContextRow label="Kondisi saat ini" value="Tidak disebutkan" />
            )}
            <ContextRow label="Lokasi utama" value={detectedContext.preferredLocation} />
          </div>

          <div className="bg-powder/40 rounded-xl border border-powder px-4 py-3 mb-5">
            <p className="text-xs text-sycle-muted leading-relaxed">
              Informasi seperti aktivitas harian, durasi di luar, dan catatan hari ini <strong>tidak</strong> disimpan sebagai konteks permanen.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50 mb-2"
          >
            Ya, Simpan Konteks Ini
          </button>
          <button
            onClick={handleReset}
            className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3.5 font-600 text-sm hover:bg-blush transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
          >
            Atur Ulang
          </button>
        </div>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-sycle-muted font-500">{label}</span>
      <span className="text-sm font-600 text-sycle-dark">{value}</span>
    </div>
  );
}
