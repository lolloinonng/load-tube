import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini di Servizio - load.tube',
};

export default function TermsPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full fade-in-stagger delay-100">
        <div className="glass-panel rounded-xl p-8 light-bleed">
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight mb-6">Termini di Servizio</h1>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
            <h2 className="text-base font-semibold text-on-surface">1. Accettazione dei Termini</h2>
            <p>Utilizzando load.tube, accetti questi termini. Se non accetti, non utilizzare il servizio.</p>
            <h2 className="text-base font-semibold text-on-surface">2. Utilizzo Consentito</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Scaricare contenuti protetti da copyright senza autorizzazione</li>
              <li>Utilizzare il servizio per scopi illegali</li>
              <li>Tentare di aggirare i limiti di velocità o le misure di sicurezza</li>
            </ul>
            <h2 className="text-base font-semibold text-on-surface">3. Limitazione di Responsabilità</h2>
            <p>load.tube è fornito &ldquo;così com'è&rdquo; senza garanzie. Non siamo responsabili per eventuali danni derivanti dal tuo utilizzo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
