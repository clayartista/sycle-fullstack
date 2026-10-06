export const landingContent = {
  eyebrow: 'Teman harian untuk memahami tubuh & lingkungan',
  title: 'Pahami kondisi lingkungan dan tubuhmu hari ini.',
  description:
    'Lihat kondisi lingkungan, catat apa yang kamu rasakan, dan pelajari evidence yang relevan dengan konteksmu.',
  primaryCta: 'Coba SYCLE Sekarang & Pahami Tubuhmu',
  secondaryCta: 'Pelajari cara SYCLE bekerja →',
  sourceNote: 'Data demo untuk prototype · Berikan izin lokasi untuk kondisi live',
  accountTitle: 'Simpan perjalananmu dari hari ke hari',
  accountDescription: 'Buat akun untuk menyimpan catatan di Health Tracker.',
  actions: [
    { label: 'Pelajari', description: 'Artikel & evidence', icon: '📚', href: '/pelajari' },
    { label: 'Healthcare', description: 'Cari fasilitas kesehatan', icon: '🏥', href: '/healthcare' },
  ],
} as const;

export const landingMetricLabels = {
  humidity: 'Kelembapan',
  airQuality: 'Kualitas Udara',
  pm25: 'PM2.5',
} as const;
