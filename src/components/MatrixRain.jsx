
import { useEffect, useRef } from "react";

const CHARS =
  "アァカサタナハマヤャラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    let animationFrameId = null;
    let columns = [];

    const FONT_SIZE = 14;
    const MAX_DPR = 1.5;

    let width = 0;
    let height = 0;

    function createColumns() {
      const count = Math.ceil(width / FONT_SIZE);

      columns = Array.from({ length: count }, () => ({
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.2,
        length: 8 + Math.floor(Math.random() * 16),
        opacity: 0.12 + Math.random() * 0.3,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DPR
      );

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      createColumns();
    }

    function draw() {
      // Затемнение прошлого кадра.
      // Создаёт плавные Matrix-хвосты.
      ctx.fillStyle = "rgba(0, 4, 2, 0.10)";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";

      for (
        let columnIndex = 0;
        columnIndex < columns.length;
        columnIndex++
      ) {
        const column = columns[columnIndex];

        const x =
          columnIndex * FONT_SIZE;

        for (
          let i = 0;
          i < column.length;
          i++
        ) {
          const y =
            column.y -
            i * FONT_SIZE;

          if (
            y < -FONT_SIZE ||
            y > height
          ) {
            continue;
          }

          const progress =
            1 - i / column.length;

          const char =
            CHARS[
              Math.floor(
                Math.random() *
                  CHARS.length
              )
            ];

          if (i === 0) {
            // Голова потока
            ctx.fillStyle = `rgba(
              220,
              255,
              235,
              ${0.9 * progress}
            )`;
          } else {
            // Основной хво
            ctx.fillStyle = `rgba(
              0,
              255,
              100,
              ${column.opacity * progress}
            )`;
          }

          ctx.fillText(
            char,
            x,
            y
          );
        }

        column.y +=
          column.speed * 2;

        // Поток дошёл до низа.
        // Запускаем его заново сверху.
        if (
          column.y -
            column.length *
              FONT_SIZE >
          height
        ) {
          column.y =
            -Math.random() *
            400;

          column.speed =
            0.5 +
            Math.random() * 1.2;

          column.length =
            8 +
            Math.floor(
              Math.random() * 16
            );

          column.opacity =
            0.12 +
            Math.random() * 0.3;
        }
      }

      animationFrameId =
        requestAnimationFrame(draw);
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    animationFrameId =
      requestAnimationFrame(draw);

    // ВАЖНО:
    // useEffect возвращает только функцию очистки.
    return () => {
      if (
        animationFrameId !== null
      ) {
        cancelAnimationFrame(
          animationFrameId
        );
      }

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      aria-hidden="true"
    />
  );
}

