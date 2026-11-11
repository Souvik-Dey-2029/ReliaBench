import React, { useEffect, useRef } from 'react';

/**
 * High-performance, pointer-responsive liquid distortion canvas.
 * - Confined to an isolated background canvas layer.
 * - Honors prefers-reduced-motion.
 * - Non-blocking: pointer-events: none.
 * - Subtle organic ripple that dissipates smoothly without distorting text.
 */
export const LiquidCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
    }

    const ripples: Ripple[] = [];
    let lastX = 0;
    let lastY = 0;
    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist > 15) {
        lastX = x;
        lastY = y;
        ripples.push({
          x,
          y,
          radius: 4,
          maxRadius: Math.min(80, 20 + dist * 1.5),
          alpha: 0.18,
          speed: 1.2 + dist * 0.04
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.005;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw organic liquid impulse ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(199, 217, 76, ${r.alpha * 0.6})`; // Acid lime subtle refraction
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(240, 107, 69, ${r.alpha * 0.3})`; // Persimmon core
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};

