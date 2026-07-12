import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - load.tube',
};

const faqs = [
  {
    q: 'What is load.tube?',
    a: 'load.tube is a free online tool that allows you to download YouTube videos and audio in various formats and qualities. Simply paste a YouTube URL, select your preferred format, and download.',
  },
  {
    q: 'Is load.tube free to use?',
    a: 'Yes, load.tube is completely free to use. There are no hidden charges or premium subscriptions.',
  },
  {
    q: 'What formats are supported?',
    a: 'We support MP4 video format (360p to 1080p) and MP3 audio format (64 kbps to 320 kbps).',
  },
  {
    q: 'Is it legal to download YouTube videos?',
    a: 'Downloading YouTube videos may violate YouTube\'s Terms of Service. Only download content you have the rights to, such as your own videos or content in the public domain.',
  },
  {
    q: 'Why am I getting an error?',
    a: 'Common errors include: invalid URL, private videos, age-restricted content, unavailable videos, and live streams.',
  },
  {
    q: 'How long are downloaded files stored?',
    a: 'Temporary files are automatically cleaned up regularly. We do not store your downloaded files permanently.',
  },
];

export default function FAQPage() {
  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full text-center mb-10 fade-in-stagger delay-100">
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight">FAQ</h1>
        <p className="text-base text-on-surface-variant mt-2">Frequently asked questions</p>
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
