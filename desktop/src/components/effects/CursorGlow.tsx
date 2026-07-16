import { useEffect, useRef } from 'react';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (glow) {
          glow.style.transform = `translate(${posRef.current.x - 150}px, ${posRef.current.y - 150}px)`;
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-0"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 30%, transparent 60%)',
        transform: 'translate(-150px, -150px)',
        transition: 'transform 0.15s ease-out',
      }}
    />
  );
}
