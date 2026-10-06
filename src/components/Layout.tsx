"use client";
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import Toast from './Toast';

function DesktopNav() {
  const { isLoggedIn, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-sycle-border h-16 items-center px-8">
      <button onClick={() => navigate('/')} className="mr-8 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-rose/50 rounded-lg">
        <Logo size="sm" />
      </button>
      <div className="flex items-center gap-1 flex-1">
        <NavLink to="/" label="Beranda" />
        <NavLink to="/tracker" label="Health Tracker" />
        <NavLink to="/pelajari" label="Pelajari" />
        <NavLink to="/healthcare" label="Healthcare" />
        <NavLink to="/toko" label="Shop" />
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/saya')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 text-sycle-dark hover:bg-blush transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              <span className="w-7 h-7 rounded-full bg-rose text-white flex items-center justify-center text-xs font-700">A</span>
              Profil
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/masuk')}
              className="px-4 py-2 rounded-xl text-sm font-600 text-rose hover:bg-rose/5 transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/daftar')}
              className="px-4 py-2 bg-rose text-white rounded-xl text-sm font-600 hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Daftar
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function TabletNav() {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="hidden md:flex lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-sycle-border h-14 items-center px-5">
      <button onClick={() => navigate('/')} className="mr-5 focus:outline-none focus:ring-2 focus:ring-rose/50 rounded-lg">
        <Logo size="sm" />
      </button>
      <div className="flex items-center gap-1 flex-1">
        <NavLink to="/" label="Beranda" />
        <NavLink to="/tracker" label="Tracker" />
        <NavLink to="/pelajari" label="Pelajari" />
        <NavLink to="/healthcare" label="Healthcare" />
        <NavLink to="/toko" label="Shop" />
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <button
            onClick={() => navigate('/saya')}
            className="w-8 h-8 rounded-full bg-rose text-white flex items-center justify-center text-xs font-700 hover:bg-rose-dark transition-colors"
          >
            A
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/masuk')}
              className="px-3 py-1.5 rounded-lg text-sm font-600 text-rose hover:bg-rose/5 transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-3 py-1.5 rounded-lg text-sm font-600 text-sycle-dark hover:bg-blush transition-colors"
              aria-expanded={menuOpen}
            >
              Menu
            </button>
          </>
        )}
      </div>
      {menuOpen && !isLoggedIn && (
        <div className="absolute top-14 right-4 bg-white rounded-2xl shadow-lg border border-sycle-border py-2 min-w-40">
          <button onClick={() => { navigate('/healthcare'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm font-500 text-sycle-dark hover:bg-blush transition-colors">Healthcare</button>
          <button onClick={() => { navigate('/daftar'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm font-500 text-sycle-dark hover:bg-blush transition-colors">Daftar</button>
          <button className="block w-full text-left px-4 py-2 text-sm font-500 text-sycle-muted">Tentang SYCLE</button>
        </div>
      )}
    </nav>
  );
}

function MobileHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-sycle-border h-14 items-center justify-center px-4">
      <button onClick={() => navigate('/')} className="focus:outline-none focus:ring-2 focus:ring-rose/50 rounded-lg">
        <Logo size="sm" />
      </button>
    </div>
  );
}

function MobileBottomNav() {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const guestItems = [
    { to: '/', label: 'Beranda', icon: HomeIcon },
    { to: '/tracker', label: 'Tracker', icon: JournalIcon },
    { to: '/pelajari', label: 'Pelajari', icon: BookIcon },
    { to: '/healthcare', label: 'Healthcare', icon: HealthcareIcon },
    { to: '/masuk', label: 'Masuk', icon: UserIcon },
  ];

  const memberItems = [
    { to: '/', label: 'Beranda', icon: HomeIcon },
    { to: '/tracker', label: 'Tracker', icon: JournalIcon },
    { to: '/pelajari', label: 'Pelajari', icon: BookIcon },
    { to: '/healthcare', label: 'Healthcare', icon: HealthcareIcon },
    { to: '/saya', label: 'Saya', icon: UserIcon },
  ];

  const items = isLoggedIn ? memberItems : guestItems;

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sycle-border h-16 items-center justify-around px-2" aria-label="Navigasi utama">
      {items.map(({ to, label, icon: Icon }) => {
        const isActive = path === to || (to !== '/' && path.startsWith(to));
        return (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] px-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50 ${
              isActive ? 'text-rose' : 'text-sycle-muted hover:text-sycle-dark'
            }`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <Icon active={isActive} />
            <span className="text-xs font-500">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <button
      onClick={() => navigate(to)}
      className={`px-3 py-1.5 rounded-lg text-sm font-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50 ${
        isActive ? 'text-rose font-600 bg-rose/5' : 'text-sycle-dark hover:bg-blush'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  );
}

import { useState } from 'react';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function HealthcareIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const isAuthPage = ['/masuk', '/daftar', '/lupa-sandi', '/member-setup', '/confirm-konteks'].includes(useLocation().pathname);

  return (
    <div className="min-h-screen bg-sycle-bg">
      {!isAuthPage && (
        <>
          <DesktopNav />
          <TabletNav />
          <MobileHeader />
        </>
      )}
      <main className={`${isAuthPage ? '' : 'pt-14 md:pt-14 lg:pt-16 pb-20 md:pb-8'}`}>
        {children}
      </main>
      {!isAuthPage && <MobileBottomNav />}
      <Toast />
    </div>
  );
}
