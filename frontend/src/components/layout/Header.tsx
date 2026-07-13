'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLButtonElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);

  const isDownload = pathname === '/';
  const isConvert = pathname === '/convert';
  const showIndicator = isDownload || isConvert;

  useEffect(() => {
    const btn = pathname === '/' ? downloadRef.current : convertRef.current;
    const container = containerRef.current;
    if (btn && container && showIndicator) {
      const cr = container.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setPillStyle({ left: br.left - cr.left, width: br.width });
    }
  }, [pathname, showIndicator]);

  return (
    <header className="w-full bg-[#1a1a1a] py-3 px-6 sticky top-0 z-40">
      <div className="relative flex items-center justify-between max-w-[720px] mx-auto">
        <Link href="/" className="font-bold text-white tracking-tight shrink-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
          load.tube
        </Link>
        <div ref={containerRef} className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-full bg-[#121212] p-0.5">
          {showIndicator && (
            <div
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[#8B5CF6]"
              style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )}
          <button
            ref={downloadRef}
            onClick={() => router.push('/')}
            className={`relative z-10 flex h-9 w-16 items-center justify-center rounded-full transition ${
              isDownload ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            ref={convertRef}
            onClick={() => router.push('/convert')}
            className={`relative z-10 flex h-9 w-16 items-center justify-center rounded-full transition ${
              isConvert ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/faq"
            className="text-sm text-gray-400 hover:text-white spring-transition"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-400 hover:text-white spring-transition"
          >
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}
