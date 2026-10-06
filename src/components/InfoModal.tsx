"use client";
import { useState } from 'react';

interface InfoContent {
  term: string;
  apaArtinya: string;
  mengapaPenting: string;
  sumber: string;
}

const INFO_DATA: Record<string, InfoContent> = {
  'terasa-seperti': {
    term: 'Terasa Seperti (Feels Like)',
    apaArtinya: 'Suhu yang dirasakan tubuh setelah mempertimbangkan kelembapan dan kecepatan angin. Angka ini bisa berbeda dari suhu aktual.',
    mengapaPenting: 'Tubuh bereaksi terhadap suhu yang dirasakan, bukan hanya suhu aktual. Panas yang terasa lebih tinggi dapat mempercepat kelelahan dan dehidrasi.',
    sumber: 'BMKG, WHO',
  },
  kelembapan: {
    term: 'Kelembapan (Humidity)',
    apaArtinya: 'Persentase uap air di udara. Kelembapan tinggi (di atas 70%) membuat tubuh sulit mendinginkan diri melalui keringat.',
    mengapaPenting: 'Kelembapan tinggi dapat meningkatkan rasa tidak nyaman dan mempercepat kelelahan akibat panas, terutama saat aktivitas di luar ruangan.',
    sumber: 'BMKG',
  },
  'kualitas-udara': {
    term: 'Kualitas Udara (AQI)',
    apaArtinya: 'Indeks Kualitas Udara adalah ukuran tingkat polusi udara. Skala: Baik (0–50), Sedang (51–100), Tidak Sehat (101–150), Sangat Tidak Sehat (151+).',
    mengapaPenting: 'Kualitas udara yang buruk dapat memengaruhi sistem pernapasan dan kesehatan jangka panjang, terutama bagi kelompok rentan.',
    sumber: 'BMKG, EPA',
  },
  'pm25': {
    term: 'PM2.5',
    apaArtinya: 'Partikel halus berdiameter kurang dari 2,5 mikrometer yang melayang di udara. Partikel ini sangat kecil sehingga dapat masuk jauh ke dalam saluran pernapasan.',
    mengapaPenting: 'Paparan PM2.5 dalam jangka panjang dikaitkan dengan masalah pernapasan dan kesehatan kardiovaskular. Ibu hamil dan anak-anak termasuk kelompok yang membutuhkan perhatian lebih.',
    sumber: 'WHO, Nature Medicine',
  },
  menstruasi: {
    term: 'Sedang Menstruasi',
    apaArtinya: 'Fase siklus menstruasi di mana lapisan rahim luruh. Biasanya berlangsung 3–7 hari.',
    mengapaPenting: 'Pada fase ini, beberapa perempuan mengalami perubahan sensitivitas terhadap suhu dan kondisi lingkungan.',
    sumber: 'WHO',
  },
  hamil: {
    term: 'Kehamilan (Hamil)',
    apaArtinya: 'Kondisi ketika janin berkembang di dalam rahim. Berlangsung sekitar 40 minggu atau 9 bulan.',
    mengapaPenting: 'Kehamilan membawa perubahan fisiologis yang membuat tubuh lebih rentan terhadap perubahan suhu dan kualitas udara.',
    sumber: 'WHO, Lancet',
  },
  perimenopause: {
    term: 'Perimenopause',
    apaArtinya: 'Transisi menuju menopause yang biasanya terjadi pada perempuan usia 40–50an. Ditandai dengan perubahan siklus menstruasi dan gejala hormonal.',
    mengapaPenting: 'Perubahan hormonal saat perimenopause dapat memengaruhi cara tubuh merespons suhu dan kondisi lingkungan.',
    sumber: 'WHO',
  },
  menopause: {
    term: 'Menopause',
    apaArtinya: 'Berhentinya menstruasi secara permanen, biasanya setelah 12 bulan tanpa menstruasi. Umumnya terjadi pada usia 45–55 tahun.',
    mengapaPenting: 'Perubahan hormonal pasca-menopause dapat memengaruhi regulasi suhu tubuh dan respons terhadap kondisi lingkungan.',
    sumber: 'WHO',
  },
};

interface InfoButtonProps {
  term: keyof typeof INFO_DATA;
}

export function InfoButton({ term }: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const info = INFO_DATA[term];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Info tentang ${info?.term}`}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose/10 text-rose text-xs font-700 hover:bg-rose/20 transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50 ml-1 flex-shrink-0"
      >
        i
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
        >
          <div className="absolute inset-0 bg-sycle-dark/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-auto p-6 shadow-2xl">
            <div className="w-10 h-1 bg-sycle-border rounded-full mx-auto mb-5 sm:hidden" />
            <h3 id="info-modal-title" className="font-700 text-lg text-sycle-dark mb-3">{info.term}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Apa artinya?</p>
                <p className="text-sm text-sycle-dark leading-relaxed">{info.apaArtinya}</p>
              </div>
              <div>
                <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Mengapa penting diketahui?</p>
                <p className="text-sm text-sycle-dark leading-relaxed">{info.mengapaPenting}</p>
              </div>
              <div>
                <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Sumber</p>
                <p className="text-sm text-sycle-muted">{info.sumber}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Sudah mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
