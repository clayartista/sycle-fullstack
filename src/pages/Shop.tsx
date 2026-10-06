"use client";
import { useState } from 'react';

const CATEGORIES = ['Semua', 'Hidrasi', 'Kualitas Udara', 'Aktivitas Outdoor', 'Kebutuhan Harian'];

const PRODUCTS = [
  { id: 'p1', name: 'Botol Minum Insulated 750ml', price: 'Rp 189.000', category: 'Hidrasi', emoji: '🫙', partner: true, sponsored: false, desc: 'Jaga minuman tetap dingin hingga 12 jam.' },
  { id: 'p2', name: 'Masker N95 (isi 10)', price: 'Rp 65.000', category: 'Kualitas Udara', emoji: '😷', partner: false, sponsored: true, desc: 'Proteksi terhadap partikel udara halus.' },
  { id: 'p3', name: 'Sunscreen SPF 50+ PA++++', price: 'Rp 145.000', category: 'Aktivitas Outdoor', emoji: '🧴', partner: true, sponsored: false, desc: 'Perlindungan luas dari paparan UV.' },
  { id: 'p4', name: 'Cooling Towel', price: 'Rp 79.000', category: 'Aktivitas Outdoor', emoji: '🧊', partner: false, sponsored: false, desc: 'Turunkan suhu tubuh saat beraktivitas di luar.' },
  { id: 'p5', name: 'Suplemen Asam Folat', price: 'Rp 95.000', category: 'Kebutuhan Harian', emoji: '💊', partner: true, sponsored: false, desc: 'Penting selama masa kehamilan dan menyusui.' },
  { id: 'p6', name: 'Elektrolit Serbuk Alami', price: 'Rp 55.000', category: 'Hidrasi', emoji: '⚡', partner: false, sponsored: false, desc: 'Bantu rehidrasi setelah beraktivitas.' },
];

export default function Shop() {
  const [category, setCategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);

  const filtered = category === 'Semua' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);

  if (selectedProduct) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-1 text-sycle-muted text-sm font-500 mb-5 hover:text-rose transition-colors focus:outline-none">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Shop
        </button>
        <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm">
          <div className="text-6xl text-center mb-5 bg-sycle-bg rounded-2xl py-8">{selectedProduct.emoji}</div>
          <div className="flex items-start justify-between mb-2">
            <h2 className="font-700 text-xl text-sycle-dark flex-1">{selectedProduct.name}</h2>
            {selectedProduct.partner && (
              <span className="flex-shrink-0 ml-2 flex items-center gap-1 px-2 py-0.5 bg-rose/10 rounded-full text-xs font-600 text-rose">◆ Mitra</span>
            )}
            {selectedProduct.sponsored && (
              <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-sycle-bg border border-sycle-border rounded-full text-xs font-500 text-sycle-muted">Bersponsor</span>
            )}
          </div>
          <p className="text-xl font-800 text-rose mb-3">{selectedProduct.price}</p>
          <p className="text-sm text-sycle-muted mb-5">{selectedProduct.desc}</p>
          <button className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">
            Lihat di Toko →
          </button>
        </div>
        <div className="mt-4 bg-powder/50 border border-powder rounded-2xl p-4">
          <p className="text-xs text-sycle-muted leading-relaxed">
            Produk dan mitra tidak memengaruhi evidence atau informasi kesehatan yang ditampilkan SYCLE.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-800 text-2xl text-sycle-dark mb-2">Shop</h1>
      <p className="text-sm text-sycle-muted mb-5">Produk pilihan untuk mendukung keseharianmu.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-600 border transition-all focus:outline-none ${
              category === c ? 'bg-rose text-white border-rose' : 'border-sycle-border bg-white hover:border-rose/40'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProduct(p)}
            className="text-left bg-white rounded-2xl border border-sycle-border p-4 shadow-sm hover:border-rose/30 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-rose/50"
          >
            <div className="text-4xl text-center bg-sycle-bg rounded-xl py-6 mb-3">{p.emoji}</div>
            <div className="flex items-start justify-between mb-1">
              <p className="font-600 text-sm text-sycle-dark group-hover:text-rose transition-colors leading-tight flex-1">{p.name}</p>
              <div className="flex flex-col gap-1 ml-2 items-end">
                {p.partner && <span className="flex items-center gap-0.5 text-xs font-600 text-rose whitespace-nowrap">◆ Mitra</span>}
                {p.sponsored && <span className="text-xs font-500 text-sycle-muted whitespace-nowrap">Bersponsor</span>}
              </div>
            </div>
            <p className="text-xs text-sycle-muted mb-2">{p.category}</p>
            <p className="font-700 text-rose text-sm">{p.price}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-powder/50 border border-powder rounded-2xl p-4">
        <p className="text-xs text-sycle-muted leading-relaxed">
          Produk dan mitra tidak memengaruhi evidence atau informasi kesehatan yang ditampilkan SYCLE. SYCLE tidak memberikan rekomendasi produk berdasarkan kondisi kesehatanmu.
        </p>
      </div>
    </div>
  );
}
