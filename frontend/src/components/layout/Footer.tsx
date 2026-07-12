import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-8 bg-transparent max-w-[720px] mx-auto flex flex-col items-center gap-4 px-6 z-40 relative">
      <div className="font-bold text-xl text-primary tracking-tight">load.tube</div>
      <div className="flex gap-6">
        <Link href="/privacy" className="font-label-caps text-xs text-on-surface-variant/70 hover:text-primary spring-transition">
          Privacy
        </Link>
        <Link href="/terms" className="font-label-caps text-xs text-on-surface-variant/70 hover:text-primary spring-transition">
          Terms
        </Link>
        <Link href="/contact" className="font-label-caps text-xs text-on-surface-variant/70 hover:text-primary spring-transition">
          Support
        </Link>
      </div>
      <div className="font-label-caps text-xs text-on-surface-variant/50 mt-2">
        &copy; {new Date().getFullYear()} load.tube. Crafted with care.
      </div>
    </footer>
  );
}
