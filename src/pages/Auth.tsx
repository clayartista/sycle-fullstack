"use client";
import { useState } from 'react';
import { useNavigate, useLocation } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

type AuthMode = 'login' | 'signup' | 'forgot';
type ForgotState = 'form' | 'sent';

function PasswordInput({ id, label, value, onChange, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-600 text-sycle-dark mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 transition-all ${error ? 'border-rose focus:ring-rose/30' : 'border-sycle-border focus:ring-rose/30 focus:border-rose/40'}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sycle-muted hover:text-sycle-dark transition-colors focus:outline-none"
          aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose font-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

function TextInput({ id, label, type = 'text', value, onChange, error, placeholder }: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-600 text-sycle-dark mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-rose focus:ring-rose/30' : 'border-sycle-border focus:ring-rose/30 focus:border-rose/40'}`}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
      />
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose font-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signupNewMember, saveToJournal, showToast, pendingAction, setPendingAction, hasGuestSession } = useApp();

  const initialMode: AuthMode =
    location.pathname === '/daftar' ? 'signup' :
    location.pathname === '/lupa-sandi' ? 'forgot' : 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [forgotState, setForgotState] = useState<ForgotState>('form');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) e.name = 'Bagian ini perlu diisi.';
    if (!email.trim()) e.email = 'Bagian ini perlu diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Masukkan alamat email yang valid.';
    if (mode !== 'forgot') {
      if (!password) e.password = 'Bagian ini perlu diisi.';
      else if (password.length < 8) e.password = 'Gunakan minimal 8 karakter.';
      if (mode === 'signup') {
        if (!confirmPassword) e.confirmPassword = 'Bagian ini perlu diisi.';
        else if (password !== confirmPassword) e.confirmPassword = 'Kata sandi tidak sama.';
        if (!agreed) e.agreed = 'Persetujuan diperlukan.';
      }
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      } finally {
        setLoading(false);
        setForgotState('sent');
      }
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        if (pendingAction === 'save') {
          const id = saveToJournal();
          setPendingAction(null);
          showToast('Catatan hari ini tersimpan ✓');
          navigate(`/journal/${id}`);
        } else {
          navigate('/');
        }
      } else {
        await signupNewMember(name, email, password);
        if (pendingAction === 'save' && hasGuestSession) {
          navigate('/confirm-konteks');
        } else if (hasGuestSession) {
          navigate('/confirm-konteks');
        } else {
          navigate('/member-setup');
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'forgot' && forgotState === 'sent') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-700 text-xl text-sycle-dark mb-3">Periksa emailmu</h2>
          <p className="text-sm text-sycle-muted leading-relaxed mb-6">
            Kami telah mengirimkan petunjuk untuk mengatur ulang kata sandi jika email tersebut terdaftar.
          </p>
          <button
            onClick={() => { setMode('login'); setForgotState('form'); }}
            className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
          >
            Kembali ke Masuk
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {mode === 'login' && (
        <>
          <h2 className="font-700 text-xl text-sycle-dark mb-1">Selamat datang kembali</h2>
          <p className="text-sm text-sycle-muted mb-6">Masuk untuk membuka Journal dan melanjutkan perjalananmu.</p>
        </>
      )}
      {mode === 'signup' && (
        <>
          <h2 className="font-700 text-xl text-sycle-dark mb-1">Buat akun SYCLE</h2>
          <p className="text-sm text-sycle-muted mb-6">Simpan Journal-mu dan lanjutkan perjalanan dari hari ke hari.</p>
        </>
      )}
      {mode === 'forgot' && (
        <>
          <h2 className="font-700 text-xl text-sycle-dark mb-1">Lupa kata sandi?</h2>
          <p className="text-sm text-sycle-muted mb-6">Masukkan email yang terhubung dengan akun SYCLE.</p>
        </>
      )}

      {authError && (
        <div role="alert" className="bg-blush border border-rose/20 rounded-xl px-4 py-3 text-sm text-rose font-500 mb-4 flex items-center gap-2">
          <span>⚠</span> {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === 'signup' && (
          <TextInput id="name" label="Nama" value={name} onChange={setName} error={errors.name} />
        )}
        <TextInput id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} />
        {mode !== 'forgot' && (
          <PasswordInput id="password" label="Kata sandi" value={password} onChange={setPassword} error={errors.password} />
        )}
        {mode === 'signup' && (
          <PasswordInput id="confirmPassword" label="Konfirmasi kata sandi" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} />
        )}
        {mode === 'signup' && (
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-rose rounded focus:outline-none"
                aria-describedby={errors.agreed ? 'agreed-error' : undefined}
              />
              <span className="text-xs text-sycle-muted">
                Saya telah membaca dan menyetujui{' '}
                <button type="button" className="text-rose underline">Kebijakan Privasi</button>
                {' '}dan{' '}
                <button type="button" className="text-rose underline">Ketentuan Penggunaan</button>.
              </span>
            </label>
            {errors.agreed && <p id="agreed-error" role="alert" className="mt-1 text-xs text-rose">⚠ {errors.agreed}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose/50 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          )}
          {mode === 'login' ? 'Masuk' : mode === 'signup' ? 'Buat Akun' : 'Kirim tautan reset'}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center">
        {mode === 'login' && (
          <>
            <button onClick={() => { setMode('forgot'); setErrors({}); setAuthError(''); }} className="text-sm text-rose font-500 hover:underline focus:outline-none">
              Lupa kata sandi?
            </button>
            <p className="text-sm text-sycle-muted">
              Belum punya akun?{' '}
              <button onClick={() => { setMode('signup'); setErrors({}); setAuthError(''); }} className="text-rose font-600 hover:underline focus:outline-none">Buat akun</button>
            </p>
          </>
        )}
        {mode === 'signup' && (
          <p className="text-sm text-sycle-muted">
            Sudah punya akun?{' '}
            <button onClick={() => { setMode('login'); setErrors({}); }} className="text-rose font-600 hover:underline focus:outline-none">Masuk</button>
          </p>
        )}
        {mode === 'forgot' && (
          <button onClick={() => { setMode('login'); setErrors({}); setForgotState('form'); }} className="text-sm text-rose font-600 hover:underline focus:outline-none">
            Kembali ke Masuk
          </button>
        )}
        <button onClick={() => navigate('/')} className="block w-full text-xs text-sycle-muted hover:text-sycle-dark transition-colors focus:outline-none pt-1">
          Lanjutkan tanpa akun →
        </button>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sycle-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <div className="bg-white rounded-3xl border border-sycle-border p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
