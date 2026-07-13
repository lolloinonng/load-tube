import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informativa sulla Privacy - load.tube',
};

export default function PrivacyPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full fade-in-stagger delay-100">
        <div className="glass-panel rounded-xl p-8 light-bleed">
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight mb-6">Informativa sulla Privacy</h1>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
            <h2 className="text-base font-semibold text-on-surface">1. Informazioni che Raccogliamo</h2>
            <p>Raccogliamo solo l&apos;URL YouTube che invii per elaborare la tua richiesta di download. Non raccogliamo informazioni personali.</p>
            <h2 className="text-base font-semibold text-on-surface">2. Come Utilizziamo le Tue Informazioni</h2>
            <p>L&apos;URL fornito viene utilizzato esclusivamente per recuperare i metadati del video e facilitare il download. Non memorizziamo, condividiamo o vendiamo i tuoi dati.</p>
            <h2 className="text-base font-semibold text-on-surface">3. File Temporanei</h2>
            <p>I file scaricati vengono memorizzati temporaneamente solo per il tempo necessario a completare il download e vengono eliminati automaticamente.</p>
            <h2 className="text-base font-semibold text-on-surface">4. Cookie</h2>
            <p>Utilizziamo solo cookie essenziali per la funzionalità (es. preferenza tema). Non vengono utilizzati cookie di tracciamento o analisi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
