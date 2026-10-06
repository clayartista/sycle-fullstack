"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  {
    id: 'lingkungan',
    title: 'KONDISI LINGKUNGAN',
    bg: 'bg-powder/40',
    border: 'border-powder',
    articles: [
      { id: 'panas', title: 'Panas Ekstrem', desc: 'Apa itu paparan panas dan mengapa penting diketahui', emoji: '🌡️' },
      { id: 'kualitas-udara', title: 'Kualitas Udara', desc: 'Memahami AQI dan dampaknya bagi kesehatan', emoji: '💨' },
      { id: 'pm25', title: 'PM2.5', desc: 'Partikel halus di udara: apa, dari mana, dan dampaknya', emoji: '🔬' },
      { id: 'kelembapan', title: 'Kelembapan', desc: 'Pengaruh kelembapan terhadap kenyamanan tubuh', emoji: '💧' },
    ],
  },
  {
    id: 'perempuan',
    title: 'KESEHATAN PEREMPUAN',
    bg: 'bg-blush/30',
    border: 'border-blush',
    articles: [
      { id: 'menstruasi', title: 'Menstruasi', desc: 'Siklus menstruasi dan faktor yang memengaruhinya', emoji: '🩸' },
      { id: 'kehamilan', title: 'Kehamilan', desc: 'Perubahan fisiologis dan kebutuhan ibu hamil', emoji: '🤰' },
      { id: 'pascapersalinan', title: 'Pascapersalinan', desc: 'Pemulihan tubuh setelah melahirkan', emoji: '👶' },
      { id: 'menyusui', title: 'Menyusui', desc: 'Panduan dan fakta seputar menyusui', emoji: '🍼' },
      { id: 'perimenopause', title: 'Perimenopause', desc: 'Transisi hormonal dan gejalanya', emoji: '🌸' },
      { id: 'menopause', title: 'Menopause', desc: 'Memahami perubahan pasca-menopause', emoji: '🌺' },
    ],
  },
  {
    id: 'climate-women',
    title: 'CLIMATE × KESEHATAN PEREMPUAN',
    bg: 'bg-lavender/20',
    border: 'border-lavender',
    articles: [
      { id: 'panas-kehamilan', title: 'Panas & Kehamilan', desc: 'Evidence paparan panas selama kehamilan', emoji: '☀️', badge: 'kuat' },
      { id: 'pm25-kehamilan', title: 'PM2.5 & Kehamilan', desc: 'Partikel halus dan dampaknya pada kehamilan', emoji: '🫁', badge: 'kuat' },
      { id: 'kelembapan-kehamilan', title: 'Kelembapan & Kehamilan', desc: 'Kelembapan tinggi dan beban termal ibu hamil', emoji: '💦', badge: 'terbatas' },
      { id: 'pm25-perimenopause', title: 'PM2.5 & Perimenopause', desc: 'Kualitas udara dan transisi menopause', emoji: '🌫️', badge: 'berbeda' },
    ],
  },
];

const BADGE_MAP: Record<string, string> = {
  kuat: 'bg-sage text-green-800',
  terbatas: 'bg-powder text-blue-800',
  berbeda: 'bg-lavender text-purple-800',
  'belum-cukup': 'bg-blush text-rose-800',
};

const BADGE_LABEL: Record<string, string> = {
  kuat: 'Bukti lebih kuat',
  terbatas: 'Bukti terbatas',
  berbeda: 'Hasil berbeda-beda',
};

export default function Pelajari() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filtered = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        articles: cat.articles.filter(a =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : CATEGORIES;

  const handleArticleClick = (id: string) => {
    if (id === 'panas-kehamilan' || id === 'pm25-kehamilan' || id === 'kelembapan-kehamilan') {
      navigate(`/evidence/${id}`);
    } else {
      setSelectedArticle(id);
    }
  };

  if (selectedArticle) {
    const all = CATEGORIES.flatMap(c => c.articles);
    const article = all.find(a => a.id === selectedArticle);
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-1 text-sycle-muted text-sm font-500 mb-5 hover:text-rose transition-colors focus:outline-none">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Pelajari
        </button>
        <div className="text-5xl mb-4">{article?.emoji}</div>
        <h1 className="font-800 text-2xl text-sycle-dark mb-4">{article?.title}</h1>
        <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm">
          <p className="text-sm text-sycle-dark leading-relaxed mb-4">
            Artikel ini sedang dalam pengembangan. Konten lengkap akan tersedia setelah kurasi evidence selesai.
          </p>
          <p className="text-xs text-sycle-muted bg-powder/60 rounded-xl px-4 py-3">
            Semua konten SYCLE didasarkan pada sumber yang telah dikurasi dan diperiksa.
          </p>
        </div>
        <button onClick={() => setSelectedArticle(null)} className="mt-4 w-full border border-sycle-border rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Kembali</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-800 text-2xl text-sycle-dark mb-2">Pelajari</h1>
      <p className="text-sm text-sycle-muted mb-5">Artikel dan evidence berbasis penelitian yang telah dikurasi.</p>

      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sycle-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari topik..."
          className="w-full bg-white border border-sycle-border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40 transition-all"
          aria-label="Cari topik"
        />
      </div>

      {isLoggedIn && (
        <div className="mb-6 bg-rose/5 rounded-2xl border border-rose/20 p-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-2">Yang Sudah Kamu Pelajari</p>
          <div className="flex flex-wrap gap-2">
            {['Panas & Kehamilan', 'PM2.5 & Kehamilan'].map(t => (
              <span key={t} className="px-2.5 py-1 bg-white border border-rose/20 rounded-lg text-xs font-500 text-rose">✓ {t}</span>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="font-600 text-sycle-dark mb-1">Topik tidak ditemukan.</p>
          <p className="text-sm text-sycle-muted">Coba kata kunci lain.</p>
        </div>
      )}

      <div className="space-y-6">
        {filtered.map(cat => (
          <div key={cat.id}>
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wider mb-3">{cat.title}</p>
            <div className={`${cat.bg} rounded-2xl border ${cat.border} p-4`}>
              <div className="grid sm:grid-cols-2 gap-3">
                {cat.articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="text-left bg-white rounded-2xl border border-sycle-border p-4 hover:border-rose/30 hover:shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-rose/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{article.emoji}</span>
                      {(article as any).badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${BADGE_MAP[(article as any).badge]}`}>
                          {BADGE_LABEL[(article as any).badge]}
                        </span>
                      )}
                    </div>
                    <p className="font-600 text-sm text-sycle-dark group-hover:text-rose transition-colors mb-1">{article.title}</p>
                    <p className="text-xs text-sycle-muted leading-relaxed">{article.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-lavender/30 rounded-2xl border border-lavender p-5">
        <p className="font-700 text-sm text-sycle-dark mb-1">Belajar 1 Menit ✨</p>
        <p className="text-xs text-sycle-muted mb-3">Kenali satu fakta baru setiap hari.</p>
        <div className="bg-white rounded-xl border border-lavender p-3">
          <p className="text-sm font-600 text-sycle-dark mb-1">Tahukah kamu?</p>
          <p className="text-xs text-sycle-muted leading-relaxed">
            WHO merekomendasikan batas PM2.5 rata-rata tahunan hanya 5 µg/m³ — lebih ketat dari standar sebelumnya. Makassar rata-rata mencatat 30–60 µg/m³.
          </p>
        </div>
      </div>
    </div>
  );
}
