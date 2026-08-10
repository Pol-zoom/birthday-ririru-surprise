
import { useEffect, useRef } from "react";

export default function NeonParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame = 0;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from(
        { length: Math.min(100, Math.floor(width / 10)) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,

          size:
            1 +
            Math.random() * 2.5,

          speed:
            0.15 +
            Math.random() * 0.5,

          drift:
            (Math.random() - 0.5) * 0.3,

          alpha:
            0.25 +
            Math.random() * 0.7,

          pulse:
            Math.random() * Math.PI * 2,

          pulseSpeed:
            0.01 +
            Math.random() * 0.03,
        })
      );
    };

    const drawHeart = (x, y, size) => {
      ctx.save();

      ctx.translate(x, y);

      ctx.beginPath();

      ctx.moveTo(0, size * 0.3);

      ctx.bezierCurveTo(
        -size,
        -size * 0.4,
        -size,
        -size * 1.1,
        0,
        -size * 0.45
      );

      ctx.bezierCurveTo(
        size,
        -size * 1.1,
        size,
        -size * 0.4,
        0,
        size * 0.3
      );

      ctx.closePath();

      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      particles.forEach((particle) => {
        particle.y -= particle.speed;

        particle.x += particle.drift;

        particle.pulse += particle.pulseSpeed;

        if (particle.y < -20) {
          particle.y = height + 20;
          particle.x = Math.random() * width;
        }

        const pulse =
          0.55 +
          Math.sin(particle.pulse) * 0.35;

        const alpha =
          particle.alpha * pulse;

        /*
         * НЕОНОВАЯ АУРА
         */

        ctx.beginPath();

        ctx.fillStyle =
          `rgba(255, 40, 170, ${alpha * 0.12})`;

        ctx.shadowColor =
          "#ff2aaa";

        ctx.shadowBlur = 25;

        ctx.arc(
          particle.x,
          particle.y,
          particle.size * 4,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * ЯРКАЯ ТОЧКА
         */

        ctx.beginPath();

        ctx.fillStyle =
          `rgba(255, 150, 230, ${alpha})`;

        ctx.shadowColor =
          "#ff3dbb";

        ctx.shadowBlur = 12;

        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * НЕБОЛЬШИЕ СЕРДЕЧКИ
         */

        if (
          particle.size > 2 &&
          Math.random() < 0.003
        ) {
          ctx.fillStyle =
            `rgba(255, 80, 190, ${alpha})`;

          ctx.shadowColor =
            "#ff1493";

          ctx.shadowBlur = 15;

          drawHeart(
            particle.x,
            particle.y,
            particle.size * 3
          );
        }
      });

      ctx.shadowBlur = 0;

      animationFrame =
        requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neon-particles"
      aria-hidden="true"
    />
  );
}

