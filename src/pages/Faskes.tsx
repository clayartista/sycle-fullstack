"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';

const FACILITIES = [
  {
    id: 'f1', name: 'RSIA Sitti Fatima', distance: '2.1 km', type: 'Rumah Sakit Ibu & Anak',
    services: ['Kehamilan', 'Kebidanan', 'Kesehatan perempuan'], address: 'Jl. Gunung Merapi, Makassar',
    partner: true, phone: '0411-123456',
  },
  {
    id: 'f2', name: 'Puskesmas Mamajang', distance: '1.4 km', type: 'Puskesmas',
    services: ['Puskesmas', 'Kesehatan umum', 'KIA'], address: 'Jl. Mamajang Raya, Makassar',
    partner: false, phone: '0411-234567',
  },
  {
    id: 'f3', name: 'Klinik Pratama Bunda', distance: '3.8 km', type: 'Klinik',
    services: ['Kebidanan', 'Kehamilan', 'Konsultasi'], address: 'Jl. Rappocini, Makassar',
    partner: true, phone: '0411-345678',
  },
  {
    id: 'f4', name: 'RS Bakti Husada', distance: '5.2 km', type: 'Rumah Sakit',
    services: ['Kesehatan umum', 'Poli kandungan'], address: 'Jl. Abd Dg Sirua, Makassar',
    partner: false, phone: '0411-456789',
  },
];

const SERVICE_FILTERS = ['Semua', 'Kehamilan', 'Kesehatan perempuan', 'Puskesmas', 'Kebidanan', 'Lainnya'];

function PartnerBadge() {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-1 px-2 py-0.5 bg-rose/10 rounded-full text-xs font-600 text-rose focus:outline-none"
        aria-label="Info mitra SYCLE"
      >
        ◆ Mitra SYCLE
      </button>
      {showInfo && (
        <div className="absolute top-7 left-0 bg-white rounded-xl border border-sycle-border shadow-lg p-3 z-10 min-w-64">
          <p className="text-xs text-sycle-dark mb-1 font-600">Fasilitas kesehatan yang memiliki kerja sama dengan SYCLE.</p>
          <p className="text-xs text-sycle-muted">Label ini menunjukkan status kemitraan, bukan penilaian kualitas atau rekomendasi medis.</p>
          <button onClick={() => setShowInfo(false)} className="mt-2 text-xs text-rose font-600 hover:underline">Tutup</button>
        </div>
      )}
    </div>
  );
}

export default function Faskes() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState('Terdekat');
  const [selectedFaskes, setSelectedFaskes] = useState<typeof FACILITIES[0] | null>(null);

  const filtered = FACILITIES.filter(f => {
    const matchSearch = !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Semua' || f.services.some(s => s.toLowerCase().includes(filter.toLowerCase()));
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === 'Terdekat') return parseFloat(a.distance) - parseFloat(b.distance);
    return a.type.localeCompare(b.type);
  });

  if (selectedFaskes) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => setSelectedFaskes(null)} className="flex items-center gap-1 text-sycle-muted text-sm font-500 mb-5 hover:text-rose transition-colors focus:outline-none">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Fasilitas Kesehatan
        </button>
        <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-700 text-xl text-sycle-dark">{selectedFaskes.name}</h2>
            {selectedFaskes.partner && <PartnerBadge />}
          </div>
          <p className="text-sm text-sycle-muted mb-4">{selectedFaskes.type} · {selectedFaskes.distance}</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Alamat</p>
              <p className="text-sm text-sycle-dark">{selectedFaskes.address}</p>
            </div>
            <div>
              <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Layanan</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedFaskes.services.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-sage rounded-lg text-xs font-500 text-green-800">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Telepon</p>
              <a href={`tel:${selectedFaskes.phone}`} className="text-sm text-rose font-600 hover:underline">{selectedFaskes.phone}</a>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">
              🗺 Petunjuk Arah
            </button>
            <button className="flex-1 border border-sycle-border text-sycle-dark rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">
              📞 Hubungi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-800 text-2xl text-sycle-dark mb-2">Fasilitas Kesehatan</h1>
      <p className="text-sm text-sycle-muted mb-5">Temukan fasilitas kesehatan terdekat di sekitarmu.</p>

      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sycle-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari fasilitas kesehatan..."
          className="w-full bg-white border border-sycle-border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40 transition-all"
          aria-label="Cari fasilitas kesehatan"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {SERVICE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-600 border transition-all focus:outline-none ${
              filter === f ? 'bg-rose text-white border-rose' : 'border-sycle-border bg-white hover:border-rose/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-xs font-500 border border-sycle-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose/40"
          aria-label="Urutkan berdasarkan"
        >
          <option>Terdekat</option>
          <option>Jenis layanan</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-sycle-border">
          <div className="text-4xl mb-4">🏥</div>
          <p className="font-600 text-sycle-dark mb-1">Belum ada fasilitas yang ditemukan untuk pencarian ini.</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setSearch('')} className="text-sm text-rose font-600 hover:underline focus:outline-none">Perluas Area Pencarian</button>
            <button onClick={() => setFilter('Semua')} className="text-sm text-rose font-600 hover:underline focus:outline-none">Ubah Jenis Layanan</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm hover:border-rose/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-700 text-base text-sycle-dark">{f.name}</h3>
                  <p className="text-xs text-sycle-muted mt-0.5">{f.type}</p>
                </div>
                {f.partner && <PartnerBadge />}
              </div>
              <div className="flex items-center gap-3 mb-3 text-xs text-sycle-muted">
                <span>📍 {f.distance}</span>
                <span>·</span>
                <span>{f.address}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {f.services.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-sage/60 rounded-lg text-xs font-500 text-green-800">{s}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedFaskes(f)} className="flex-1 bg-rose text-white rounded-xl py-2.5 text-sm font-600 hover:bg-rose-dark transition-colors focus:outline-none">Detail</button>
                <button className="px-4 py-2.5 border border-sycle-border text-sycle-dark rounded-xl text-sm font-600 hover:bg-blush transition-colors focus:outline-none">🗺 Arah</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
