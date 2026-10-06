export interface ContextPhaseData {
  // Menstruation
  menstruasiHariKe?: string;
  menstruasiVolume?: string;
  // Pregnancy
  hamilUsia?: string;
  hamilPertama?: string;
  hamilNomor?: string; // if not first pregnancy
  // Postpartum
  pascaWaktu?: string;
  // Breastfeeding
  menyusuiUsiaBayi?: string;
  menyusuiMode?: string;
  // Perimenopause
  periPola?: string;
  // Menopause
  menopauseWaktu?: string;
}

export interface PersonalizationData {
  ageRange: string;
  womenContext: string[];
  activity: string;
  locationPref: string;
  outdoorDuration: string;
  resources: string[];
  phaseData?: ContextPhaseData;
}

export interface SymptomDetail {
  onset?: string;        // Kapan mulai dirasakan
  duration?: string;     // Berapa lama terasa hari ini
  change?: string;       // Dibanding biasanya
  activityImpact?: string; // Seberapa mengganggu aktivitas
  careAction?: string;   // Sudah melakukan sesuatu (free text)
  careSeeking?: string;  // Apakah mencatat bantuan kesehatan
}

export interface ReflectionData {
  symptomScales: Record<string, number>; // symptom name → 0-4 scale
  symptomDetails?: Record<string, SymptomDetail>; // member extended check-in per symptom
  bleeding?: string; // postpartum only — categorical, not 0-4
  feedingPattern?: string; // breastfeeding only — optional categorical
  story: string;
  aiStory?: string;
  usedAi: boolean;
}

export interface EnvData {
  temp: number;
  feelsLike: number;
  humidity: number;
  airQuality: string;
  pm25: number;
  weather: string;
  source?: 'live' | 'demo';
  observedAt?: string;
  sourceLabel?: string;
}

export type LocationPermissionState = 'prompt' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  location: string;
  envData: EnvData;
  personalization: PersonalizationData;
  topics: EvidenceTopic[];
  reflection?: ReflectionData;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceTopic {
  id: string;
  title: string;
  badge: EvidenceBadgeType;
  sourceCount?: number;
  hasEvidence?: boolean;
  whyRelevant?: string;
  actionSuggestions?: string[];
  claimSummary?: string;
  relevanceScore?: number;
}

export type EvidenceBadgeType =
  | 'kuat'
  | 'terbatas'
  | 'berbeda'
  | 'belum-cukup';

export const BADGE_LABELS: Record<EvidenceBadgeType, string> = {
  kuat: 'Bukti penelitian lebih kuat',
  terbatas: 'Bukti penelitian masih terbatas',
  berbeda: 'Hasil penelitian masih berbeda-beda',
  'belum-cukup': 'Belum ada bukti yang cukup',
};

export const BADGE_COLORS: Record<EvidenceBadgeType, string> = {
  kuat: 'bg-sage text-green-800',
  terbatas: 'bg-powder text-blue-800',
  berbeda: 'bg-lavender text-purple-800',
  'belum-cukup': 'bg-blush text-rose-800',
};

export const SCALE_LABELS: Record<number, string> = {
  0: 'Tidak ada',
  1: 'Ringan',
  2: 'Sedang',
  3: 'Kuat',
  4: 'Sangat kuat',
};

// Context-specific symptom lists (spec §36–42)
export const CONTEXT_SYMPTOMS: Record<string, string[]> = {
  'Sedang menstruasi': ['Nyeri / kram menstruasi', 'Sakit kepala', 'Kembung', 'Lemas / kelelahan', 'Perubahan suasana hati'],
  'Hamil': ['Sakit kepala', 'Pusing', 'Mual', 'Lemas / kelelahan', 'Rasa panas / tidak nyaman karena panas'],
  'Pascapersalinan': ['Nyeri / ketidaknyamanan tubuh', 'Lemas / kelelahan', 'Sakit kepala', 'Ketidaknyamanan pada luka / area persalinan', 'Perubahan suasana hati'],
  'Menyusui': ['Haus', 'Lemas / kelelahan', 'Sakit kepala / pusing', 'Ketidaknyamanan saat menyusui'],
  'Perimenopause': ['Hot flush / rasa panas tiba-tiba', 'Keringat malam', 'Gangguan tidur', 'Perubahan suasana hati', 'Sulit berkonsentrasi'],
  'Menopause': ['Hot flush / rasa panas tiba-tiba', 'Keringat malam', 'Gangguan tidur', 'Perubahan suasana hati', 'Kekeringan / ketidaknyamanan vagina', 'Keluhan berkemih'],
};

export const DEFAULT_SYMPTOMS = ['Sakit kepala', 'Pusing', 'Lemas / kelelahan', 'Mual', 'Rasa panas / tidak nyaman', 'Gangguan tidur', 'Lainnya'];

export const SIM_ENV: EnvData = {
  temp: 34,
  feelsLike: 38,
  humidity: 72,
  airQuality: 'Sedang',
  pm25: 45,
  weather: 'Cerah',
  source: 'demo',
  sourceLabel: 'Data demo untuk prototype',
};

export const SIM_LOCATION = 'Makassar, Sulawesi Selatan';



export const SAMPLE_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j1',
    date: '2026-09-14',
    location: 'Makassar, Sulawesi Selatan',
    envData: { temp: 33, feelsLike: 37, humidity: 70, airQuality: 'Sedang', pm25: 42, weather: 'Cerah Berawan' },
    personalization: {
      ageRange: '25-34',
      womenContext: ['Hamil'],
      activity: 'Bekerja',
      locationPref: 'Di luar ruangan',
      outdoorDuration: '3-6 jam',
      resources: ['Air minum', 'Tempat teduh'],
      phaseData: { hamilUsia: 'Trimester 2', hamilPertama: 'Tidak' },
    },
    topics: [{ id: 'panas-kehamilan', title: 'Panas & Kehamilan', badge: 'kuat' }],
    reflection: {
      symptomScales: { 'Sakit kepala': 3, 'Lemas / kelelahan': 2 },
      story: 'Banyak aktivitas di luar hari ini.',
      usedAi: false,
    },
    createdAt: '08:15', updatedAt: '17:40',
  },
  {
    id: 'j2',
    date: '2026-09-13',
    location: 'Makassar, Sulawesi Selatan',
    envData: { temp: 31, feelsLike: 35, humidity: 68, airQuality: 'Baik', pm25: 30, weather: 'Berawan' },
    personalization: {
      ageRange: '25-34',
      womenContext: ['Hamil'],
      activity: 'Aktivitas rumah tangga',
      locationPref: 'Di dalam ruangan',
      outdoorDuration: 'Tidak berada di luar',
      resources: ['Air minum', 'Tempat lebih sejuk'],
      phaseData: { hamilUsia: 'Trimester 2', hamilPertama: 'Tidak' },
    },
    topics: [{ id: 'panas-kehamilan', title: 'Panas & Kehamilan', badge: 'kuat' }],
    createdAt: '09:00', updatedAt: '09:00',
  },
  {
    id: 'j3',
    date: '2026-09-12',
    location: 'Makassar, Sulawesi Selatan',
    envData: { temp: 35, feelsLike: 40, humidity: 75, airQuality: 'Sedang', pm25: 55, weather: 'Cerah' },
    personalization: {
      ageRange: '25-34',
      womenContext: ['Hamil'],
      activity: 'Perjalanan',
      locationPref: 'Di luar ruangan',
      outdoorDuration: '1-3 jam',
      resources: ['Air minum'],
      phaseData: { hamilUsia: 'Trimester 2', hamilPertama: 'Tidak' },
    },
    topics: [
      { id: 'panas-kehamilan', title: 'Panas & Kehamilan', badge: 'kuat' },
      { id: 'pm25-kehamilan', title: 'PM2.5 & Kehamilan', badge: 'kuat' },
    ],
    reflection: {
      symptomScales: { 'Lemas / kelelahan': 2, 'Mual': 1 },
      story: 'Terasa lelah setelah perjalanan.',
      usedAi: false,
    },
    createdAt: '16:30', updatedAt: '20:15',
  },
];
