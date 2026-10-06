"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PersonalizationData, ReflectionData, JournalEntry, EvidenceTopic, EnvData, LocationCoordinates, LocationPermissionState } from '../types';
import { SIM_ENV, SAMPLE_JOURNAL_ENTRIES } from '../types';

export interface SavedContext {
  ageRange: string;
  womenContext: string[];
  preferredLocation: string;
}

type ProfilePayload = {
  user: { id: string; name: string; email: string } | null;
  profile?: {
    setupComplete: boolean;
    firstHomeSeen: boolean;
    ageRange: string | null;
    womenContext: string[];
    preferredLocation: string | null;
  } | null;
};

interface AppContextValue {
  isLoggedIn: boolean;
  userName: string;
  location: string;
  envData: EnvData;
  envLoading: boolean;
  envSource: 'live' | 'demo';
  envUpdatedAt: string | null;
  locationPermission: LocationPermissionState;
  locationAccuracy: number | null;
  locationError: string | null;
  requestLocation: () => Promise<boolean>;
  personalization: PersonalizationData | null;
  reflection: ReflectionData | null;
  journalEntries: JournalEntry[];
  pendingAction: 'save' | 'pdf' | null;
  currentEvidenceTopic: EvidenceTopic | null;
  sessionTopics: EvidenceTopic[];
  evidenceLoading: boolean;
  evidenceError: string | null;
  toastMessage: string | null;
  savedContextConfirmed: boolean;
  memberSetupComplete: boolean;
  isFirstVisit: boolean;
  savedContext: SavedContext | null;
  hasGuestSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setPersonalization: (data: PersonalizationData) => void;
  setReflection: (data: ReflectionData | null) => void;
  setPendingAction: (action: 'save' | 'pdf' | null) => void;
  setCurrentEvidenceTopic: (topic: EvidenceTopic | null) => void;
  saveToJournal: () => string;
  deleteJournalEntry: (id: string) => void;
  showToast: (msg: string) => void;
  setSavedContextConfirmed: (v: boolean) => void;
  updatePersonalizationFromQuickCheckIn: (data: Partial<PersonalizationData>) => void;
  completeMemberSetup: (ctx: SavedContext) => void;
  confirmGuestContext: (ctx: SavedContext) => void;
  setIsFirstVisit: (v: boolean) => void;
  signupNewMember: (name: string, email: string, password: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function fallbackName(email: string) {
  return email.split('@')[0] || 'Anita';
}

async function readJson<T>(response: Response): Promise<T | null> {
  try { return await response.json() as T; } catch { return null; }
}

function contextFromProfile(profile?: ProfilePayload['profile']): SavedContext | null {
  if (!profile?.setupComplete || !profile.ageRange || !profile.preferredLocation) return null;
  return {
    ageRange: profile.ageRange,
    womenContext: profile.womenContext ?? [],
    preferredLocation: profile.preferredLocation,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('Lokasi belum diizinkan');
  const [envData, setEnvData] = useState<EnvData>(SIM_ENV);
  const [envLoading, setEnvLoading] = useState(false);
  const [envSource, setEnvSource] = useState<'live' | 'demo'>('demo');
  const [envUpdatedAt, setEnvUpdatedAt] = useState<string | null>(SIM_ENV.observedAt || null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionState>('prompt');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [personalization, setPersonalizationState] = useState<PersonalizationData | null>(null);
  const [reflection, setReflectionState] = useState<ReflectionData | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<'save' | 'pdf' | null>(null);
  const [currentEvidenceTopic, setCurrentEvidenceTopic] = useState<EvidenceTopic | null>(null);
  const [sessionTopics, setSessionTopics] = useState<EvidenceTopic[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedContextConfirmed, setSavedContextConfirmed] = useState(false);
  const [memberSetupComplete, setMemberSetupCompleteState] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [savedContext, setSavedContext] = useState<SavedContext | null>(null);

  const hydrateAccount = useCallback(async (meData: ProfilePayload) => {
    if (!meData.user) return;
    setIsLoggedIn(true);
    setUserName(meData.user.name || fallbackName(meData.user.email));
    const profileCtx = contextFromProfile(meData.profile);
    setSavedContext(profileCtx);
    setMemberSetupCompleteState(Boolean(meData.profile?.setupComplete));
    setIsFirstVisit(!Boolean(meData.profile?.firstHomeSeen));

    const journal = await fetch('/api/journal', { cache: 'no-store' });
    const journalData = await readJson<{ entries: JournalEntry[] }>(journal);
    if (journal.ok && journalData?.entries) {
      setJournalEntries(journalData.entries);
    } else if (process.env.NODE_ENV !== 'production') {
      setJournalEntries(SAMPLE_JOURNAL_ENTRIES);
    } else {
      setJournalEntries([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' });
        const meData = await readJson<ProfilePayload>(me);
        if (!cancelled && meData?.user) await hydrateAccount(meData);
      } catch {
        // Demo mode remains available when Supabase is not configured.
      }
    })();
    return () => { cancelled = true; };
  }, [hydrateAccount]);

  const refreshEnvironment = useCallback(async (coords: LocationCoordinates) => {
    setEnvLoading(true);
    setLocationError(null);
    try {
      const response = await fetch('/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
        cache: 'no-store',
      });
      const data = await readJson<{ envData?: EnvData; location?: string; source?: 'live' | 'demo'; error?: string }>(response);
      if (!response.ok || !data?.envData) throw new Error(data?.error || 'Kondisi lingkungan belum tersedia.');
      setEnvData({ ...data.envData, source: 'live', sourceLabel: 'Open-Meteo · kondisi model terkini' });
      setEnvSource('live');
      setEnvUpdatedAt(data.envData.observedAt || new Date().toISOString());
      setLocation(data.location || 'Lokasi saat ini');
      return true;
    } catch (error) {
      setEnvData(SIM_ENV);
      setEnvSource('demo');
      setEnvUpdatedAt(SIM_ENV.observedAt || null);
      setLocation('Lokasi belum tersedia');
      setLocationError(error instanceof Error ? error.message : 'Kondisi lingkungan live belum tersedia.');
      return false;
    } finally {
      setEnvLoading(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationPermission('unsupported');
      setLocationError('Browser ini tidak mendukung Geolocation.');
      return false;
    }
    setLocationPermission('requesting');
    setLocationError(null);
    return await new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocationAccuracy(position.coords.accuracy);
          setLocationPermission('granted');
          const ok = await refreshEnvironment(coords);
          resolve(ok);
        },
        (error) => {
          const denied = error.code === error.PERMISSION_DENIED;
          setLocationPermission(denied ? 'denied' : 'prompt');
          setLocationError(denied ? 'Izin lokasi belum diberikan.' : 'Lokasi belum dapat diambil. Coba lagi.');
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
      );
    });
  }, [refreshEnvironment]);

  useEffect(() => {
    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const onChange = () => {
      if (permissionStatus) setLocationPermission(permissionStatus.state as LocationPermissionState);
    };
    (async () => {
      if (typeof navigator === 'undefined' || !('permissions' in navigator)) return;
      try {
        permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (cancelled || !permissionStatus) return;
        setLocationPermission(permissionStatus.state as LocationPermissionState);
        permissionStatus.addEventListener('change', onChange);
        if (permissionStatus.state === 'granted') await requestLocation();
      } catch {
        // Some browsers expose geolocation without the Permissions API.
      }
    })();
    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener('change', onChange);
    };
  }, [requestLocation]);

  const loadContextualEvidence = useCallback(async (nextPersonalization: PersonalizationData, nextEnvData: EnvData) => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    try {
      const response = await fetch('/api/evidence/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalization: nextPersonalization, environment: nextEnvData }),
        cache: 'no-store',
      });
      const data = await readJson<{ topics?: EvidenceTopic[]; error?: string }>(response);
      if (!response.ok) throw new Error(data?.error || 'Evidence belum tersedia.');
      setSessionTopics(data?.topics || []);
      if (!data?.topics?.length) setEvidenceError('Belum ada evidence terpublikasi yang cocok dengan konteks ini.');
    } catch (error) {
      setSessionTopics([]);
      setEvidenceError(error instanceof Error ? error.message : 'Evidence belum tersedia.');
    } finally {
      setEvidenceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!personalization) return;
    void loadContextualEvidence(personalization, envData);
  }, [personalization, envData.source, envData.observedAt, loadContextualEvidence]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await readJson<ProfilePayload & { error?: string }>(response);
      if (!response.ok) {
        if (response.status >= 500) throw new TypeError('backend-unavailable');
        throw new Error(data?.error || 'Gagal masuk.');
      }
      if (!data?.user) throw new Error('Akun belum siap digunakan.');
      await hydrateAccount(data);
    } catch (error) {
      if (!(error instanceof TypeError) || error.message !== 'backend-unavailable') throw error;
      // Demo fallback for local UI work without Supabase.
      setIsLoggedIn(true);
      setUserName(fallbackName(email));
      setJournalEntries(SAMPLE_JOURNAL_ENTRIES);
      setMemberSetupCompleteState(true);
      setIsFirstVisit(false);
      setSavedContext({ ageRange: '25–34', womenContext: ['Hamil'], preferredLocation: 'Makassar' });
    }
  }, [hydrateAccount]);

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsLoggedIn(false);
    setUserName('');
    setPersonalizationState(null);
    setReflectionState(null);
    setPendingAction(null);
    setSavedContextConfirmed(false);
    setMemberSetupCompleteState(false);
    setIsFirstVisit(true);
    setSavedContext(null);
    setJournalEntries([]);
    setSessionTopics([]);
    setEvidenceError(null);
  }, []);

  const setPersonalization = useCallback((data: PersonalizationData) => setPersonalizationState(data), []);
  const setReflection = useCallback((data: ReflectionData | null) => setReflectionState(data), []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const saveToJournal = useCallback((): string => {
    const today = new Date().toISOString().split('T')[0];
    const optimisticId = crypto.randomUUID();
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const entry: JournalEntry = {
      id: optimisticId,
      date: today,
      location,
      envData,
      personalization: personalization!,
      topics: sessionTopics,
      reflection: reflection ?? undefined,
      createdAt: now,
      updatedAt: now,
    };

    setJournalEntries(prev => [entry, ...prev.filter(e => e.date !== today)]);

    if (isLoggedIn && personalization) {
      fetch('/api/journal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: optimisticId, date: today, location, envData, personalization, topics: sessionTopics, reflection }),
      }).then(async response => {
        const data = await readJson<{ entry?: JournalEntry }>(response);
        if (response.ok && data?.entry) {
          setJournalEntries(prev => [data.entry!, ...prev.filter(e => e.date !== today)]);
        }
      }).catch(() => undefined);
    }
    return optimisticId;
  }, [location, envData, personalization, sessionTopics, reflection, isLoggedIn]);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    if (isLoggedIn) fetch(`/api/journal/${id}`, { method: 'DELETE' }).catch(() => undefined);
  }, [isLoggedIn]);

  const updatePersonalizationFromQuickCheckIn = useCallback((data: Partial<PersonalizationData>) => {
    setPersonalizationState(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const saveProfile = useCallback(async (ctx: SavedContext) => {
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ageRange: ctx.ageRange,
        womenContext: ctx.womenContext,
        preferredLocation: ctx.preferredLocation,
        setupComplete: true,
        firstHomeSeen: false,
      }),
    });
  }, []);

  const signupNewMember = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await readJson<{ user?: { name?: string; email?: string }; error?: string }>(response);
      if (!response.ok) {
        if (response.status >= 500) throw new TypeError('backend-unavailable');
        throw new Error(data?.error || 'Gagal membuat akun.');
      }
      setIsLoggedIn(Boolean(data?.user));
      setUserName(name || 'Anggota Baru');
    } catch (error) {
      if (!(error instanceof TypeError) || error.message !== 'backend-unavailable') throw error;
      setIsLoggedIn(true);
      setUserName(name || 'Anggota Baru');
    }
    setJournalEntries([]);
    setMemberSetupCompleteState(false);
    setIsFirstVisit(true);
    setSavedContext(null);
  }, []);

  const completeMemberSetup = useCallback((ctx: SavedContext) => {
    setSavedContext(ctx);
    setMemberSetupCompleteState(true);
    setIsFirstVisit(true);
    void saveProfile(ctx);
  }, [saveProfile]);

  const confirmGuestContext = useCallback((ctx: SavedContext) => {
    setSavedContext(ctx);
    setMemberSetupCompleteState(true);
    setIsFirstVisit(true);
    void saveProfile(ctx);
  }, [saveProfile]);

  const markHomeSeen = useCallback(() => {
    if (!isLoggedIn || !isFirstVisit) return;
    setIsFirstVisit(false);
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstHomeSeen: true }),
    }).catch(() => undefined);
  }, [isLoggedIn, isFirstVisit]);

  const hasGuestSession = !!personalization;

  return (
    <AppContext.Provider value={{
      isLoggedIn, userName, location, envData, envLoading, envSource, envUpdatedAt, locationPermission, locationAccuracy, locationError, requestLocation, personalization, reflection,
      journalEntries, pendingAction, currentEvidenceTopic, sessionTopics, evidenceLoading, evidenceError,
      toastMessage, savedContextConfirmed, memberSetupComplete, isFirstVisit,
      savedContext, hasGuestSession, login, logout, setPersonalization,
      setReflection, setPendingAction, setCurrentEvidenceTopic, saveToJournal,
      deleteJournalEntry, showToast, setSavedContextConfirmed,
      updatePersonalizationFromQuickCheckIn, completeMemberSetup, confirmGuestContext,
      setIsFirstVisit: (v) => { setIsFirstVisit(v); if (v === false) void markHomeSeen(); }, signupNewMember,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
