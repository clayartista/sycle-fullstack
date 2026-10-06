"use client";

import { useNavigate } from '@/lib/navigation';
import { landingContent } from '@/config/landing';
import Button from '@/components/ui/Button';

export default function LandingAccountPrompt() {
  const navigate = useNavigate();

  return (
    <section className="bg-lavender/50 rounded-2xl p-4 border border-lavender flex items-start gap-3">
      <span className="text-lg" aria-hidden="true">✨</span>
      <div className="min-w-0">
        <p className="text-sm font-600 text-sycle-dark">{landingContent.accountTitle}</p>
        <p className="text-xs text-sycle-muted mt-0.5 mb-3">{landingContent.accountDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" className="min-h-9 px-3 py-1.5 rounded-lg text-xs" onClick={() => navigate('/daftar')}>Buat Akun</Button>
          <Button variant="secondary" className="min-h-9 px-3 py-1.5 rounded-lg text-xs border-rose text-rose" onClick={() => navigate('/masuk')}>Masuk</Button>
        </div>
      </div>
    </section>
  );
}
