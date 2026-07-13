import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - load.tube',
};

const faqs = [
  {
    q: "Cos'è load.tube?",
    a: "load.tube è uno strumento online gratuito che ti permette di scaricare video e audio da YouTube in vari formati e qualità. Basta incollare un URL YouTube, selezionare il formato preferito e scaricare.",
  },
  {
    q: 'load.tube è gratuito?',
    a: "Sì, load.tube è completamente gratuito. Non ci sono costi nascosti o abbonamenti premium.",
  },
  {
    q: 'Quali formati sono supportati?',
    a: 'Supportiamo il formato video MP4 (da 360p a 1080p) e il formato audio MP3 (da 64 kbps a 320 kbps).',
  },
  {
    q: 'È legale scaricare video da YouTube?',
    a: "Scaricare video da YouTube potrebbe violare i Termini di Servizio di YouTube. Scarica solo contenuti di cui hai i diritti, come i tuoi video o contenuti di pubblico dominio.",
  },
  {
    q: 'Perché ricevo un errore?',
    a: 'Gli errori comuni includono: URL non valido, video privati, contenuti con limiti di età, video non disponibili e live streaming.',
  },
  {
    q: 'Per quanto tempo vengono conservati i file scaricati?',
    a: 'I file temporanei vengono eliminati automaticamente regolarmente. Non conserviamo i tuoi file scaricati in modo permanente.',
  },
];

export default function FAQPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full text-center mb-10 fade-in-stagger delay-100">
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight">FAQ</h1>
        <p className="text-base text-on-surface-variant mt-2">Domande frequenti</p>
      </div>
      <div className="w-full space-y-3 fade-in-stagger delay-200">
        {faqs.map((faq, i) => (
          <details key={i} className="group glass-panel rounded-xl overflow-hidden spring-transition">
            <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-on-surface spring-transition">
              {faq.q}
              <ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-white/20 px-4 py-3">
              <p className="text-sm text-on-surface-variant">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
