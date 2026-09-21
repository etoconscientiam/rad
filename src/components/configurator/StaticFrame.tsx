'use client';

import { useMemo } from 'react';
import { buildFrame, type FrameParams } from '@/lib/geometry';

/**
 * Статичная изометрия изделия — для устройств без WebGL и на случай потери
 * контекста. Рисуется из того же buildFrame, что и сцена, поэтому показывает
 * ровно выбранную конфигурацию, а не картинку-заглушку.
 *
 * Требование трека M2: «нет WebGL или слабое устройство — статичный рендер
 * вместо чёрного экрана».
 */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

type Point = readonly [number, number];

/** Изометрия: мир (x вправо, y вверх, z на зрителя) → плоскость экрана. */
function project(x: number, y: number, z: number): Point {
  return [(x - z) * COS30, (x + z) * SIN30 - y];
}

/** Затемнение цвета для боковых граней — свет сверху, как в сцене. */
function shade(hex: string, factor: number): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = Number.parseInt(m[1]!, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(c * factor))),
  );
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

type Face = { points: Point[]; fill: string; depth: number };

/** Три видимые грани коробки: верх и две стороны. */
function boxFaces(
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  color: string,
): Face[] {
  const [sx, sy, sz] = size;
  const [px, py, pz] = position;
  const x0 = px - sx / 2;
  const x1 = px + sx / 2;
  const y0 = py - sy / 2;
  const y1 = py + sy / 2;
  const z0 = pz - sz / 2;
  const z1 = pz + sz / 2;
  const p = project;

  // Глубина считается по центру самой грани, а не коробки: у длинных ног
  // и царг центр коробки даёт неверный порядок перекрытия.
  return [
    {
      points: [p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)],
      fill: color,
      depth: px + y1 + pz,
    },
    {
      points: [p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)],
      fill: shade(color, 0.78),
      depth: x1 + py + pz,
    },
    {
      points: [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)],
      fill: shade(color, 0.6),
      depth: px + py + z1,
    },
  ];
}

export function StaticFrame({
  metalColor,
  woodColor,
  className,
  label,
  ...params
}: FrameParams & {
  metalColor: string;
  woodColor: string;
  className?: string;
  label: string;
}) {
  const { faces, viewBox } = useMemo(() => {
    const frame = buildFrame(params);
    const colorOf = (material: string) =>
      material === 'ldsp' ? woodColor : material === 'knob' ? shade(woodColor, 0.62) : metalColor;
    const all = frame.parts
      .flatMap((part) => boxFaces(part.size, part.position, colorOf(part.material)))
      // Дальние грани рисуем первыми — художникова сортировка вместо буфера глубины.
      .sort((a, b) => a.depth - b.depth);

    const xs = all.flatMap((f) => f.points.map((pt) => pt[0]));
    const ys = all.flatMap((f) => f.points.map((pt) => pt[1]));
    const pad = 0.12;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const width = Math.max(...xs) - minX + pad;
    const height = Math.max(...ys) - minY + pad;

    return { faces: all, viewBox: `${minX} ${minY} ${width} ${height}` };
  }, [params, metalColor, woodColor]);

  return (
    <svg
      className={className}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {faces.map((face, i) => (
        <polygon
          key={i}
          points={face.points.map(([x, y]) => `${x},${y}`).join(' ')}
          fill={face.fill}
          stroke={face.fill}
          strokeWidth={0.002}
        />
      ))}
    </svg>
  );
}
