import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - load.tube',
};

export default function PrivacyPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full fade-in-stagger delay-100">
        <div className="glass-panel rounded-xl p-8 light-bleed">
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight mb-6">Privacy Policy</h1>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-base font-semibold text-on-surface">1. Information We Collect</h2>
            <p>We only collect the YouTube URL you submit for processing your download request. We do not collect personal information.</p>
            <h2 className="text-base font-semibold text-on-surface">2. How We Use Your Information</h2>
            <p>The URL you provide is used solely to fetch video metadata and facilitate your download. We do not store, share, or sell your data.</p>
            <h2 className="text-base font-semibold text-on-surface">3. Temporary Files</h2>
            <p>Downloaded files are temporarily stored only long enough to complete your download and are automatically deleted.</p>
            <h2 className="text-base font-semibold text-on-surface">4. Cookies</h2>
            <p>We use only essential cookies for functionality (e.g., theme preference). No tracking or analytics cookies are used.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
