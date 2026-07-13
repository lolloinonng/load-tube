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

  useEffect(() => {
    const btn = pathname === '/' ? downloadRef.current : convertRef.current;
    const container = containerRef.current;
    if (btn && container) {
      const cr = container.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setPillStyle({ left: br.left - cr.left, width: br.width });
    }
  }, [pathname]);

  return (
    <header className="w-full bg-[#1a1a1a] py-4 px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-[720px] mx-auto mb-4">
        <Link href="/" className="font-bold text-white tracking-tight" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)' }}>
          load.tube
        </Link>
        <div className="flex items-center gap-6">
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
      <div className="flex justify-center">
        <div ref={containerRef} className="relative flex items-center rounded-full bg-[#121212] p-1 px-4">
          <div
            className="absolute top-1 bottom-1 rounded-full bg-blue-100"
            style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <button
            ref={downloadRef}
            onClick={() => router.push('/')}
            className={`relative z-10 flex h-10 w-20 items-center justify-center rounded-full transition ${
              isDownload ? 'text-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            ref={convertRef}
            onClick={() => router.push('/convert')}
            className={`relative z-10 flex h-10 w-20 items-center justify-center rounded-full transition ${
              isConvert ? 'text-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
