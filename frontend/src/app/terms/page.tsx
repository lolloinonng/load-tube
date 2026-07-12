import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - load.tube',
};

export default function TermsPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full fade-in-stagger delay-100">
        <div className="glass-panel rounded-xl p-8 light-bleed">
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight mb-6">Terms of Service</h1>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-base font-semibold text-on-surface">1. Acceptance of Terms</h2>
            <p>By using load.tube, you agree to these terms. If you do not agree, do not use the service.</p>
            <h2 className="text-base font-semibold text-on-surface">2. Acceptable Use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Download copyrighted content without permission</li>
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to bypass rate limits or security measures</li>
            </ul>
            <h2 className="text-base font-semibold text-on-surface">3. Limitation of Liability</h2>
            <p>load.tube is provided &ldquo;as is&rdquo; without warranties. We are not liable for any damages arising from your use.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
