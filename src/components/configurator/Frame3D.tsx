'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildFrame, type FrameParams } from '@/lib/geometry';
import { cssVar } from '@/lib/cssVar';

/**
 * 3D-вьюпорт конфигуратора. Порт `_source/prototype/Frame3D.js` на
 * react-three-fiber: геометрия, свет, материалы и управление камерой
 * перенесены со значениями прототипа.
 *
 * Орбита и зум написаны вручную, как в прототипе, — OrbitControls из drei
 * тянет 21 зависимость ради сорока строк.
 */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Пределы камеры — значения прототипа. */
const PHI = { min: 0.25, max: 1.45 } as const;
const ZOOM = { min: 0.45, max: 2.6 } as const;
/** Один «лист» текстуры ЛДСП ≈ 850 мм. */
const WOOD_TILE = 0.85;

export type Frame3DProps = FrameParams & {
  /** Цвет металла, hex. */
  color: string;
  /** Оттенок ЛДСП, hex — показывается, пока не загрузилась текстура. */
  wood: string;
  woodTexture?: string | null;
  autorotate?: boolean;
  interactive?: boolean;
  className?: string;
};

function ShadowPlane({ w, l }: { w: number; l: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    if (!g) return null;
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(28,27,25,0.28)');
    grad.addColorStop(0.55, 'rgba(28,27,25,0.10)');
    grad.addColorStop(1, 'rgba(28,27,25,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => () => void texture?.dispose(), [texture]);
  if (!texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} scale={[w * 1.7, l * 1.7, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function CameraRig({
  extent,
  height,
  autorotate,
  interactive,
}: {
  extent: number;
  height: number;
  autorotate: boolean;
  interactive: boolean;
}) {
  const { camera, gl, size } = useThree();
  const orbit = useRef({ theta: 0.65, phi: 1.12, zoom: 1, autorotate });

  useEffect(() => {
    if (!interactive) return;
    const cv = gl.domElement;
    // touch-action ставим на сам canvas: style у <Canvas> уходит на обёртку,
    // а без этого перетаскивание модели на телефоне скроллит страницу.
    const prevTouchAction = cv.style.touchAction;
    cv.style.touchAction = 'none';
    const pts = new Map<number, [number, number]>();
    let pinch = 0;

    const down = (e: PointerEvent) => {
      cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        if (a && b) pinch = Math.hypot(a[0] - b[0], a[1] - b[1]);
      }
    };
    const move = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      const s = orbit.current;
      if (pts.size === 1) {
        s.theta -= (e.clientX - prev[0]) * 0.006;
        s.phi = clamp(s.phi - (e.clientY - prev[1]) * 0.006, PHI.min, PHI.max);
        s.autorotate = false;
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        if (!a || !b) return;
        const nd = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) s.zoom = clamp((s.zoom * pinch) / nd, ZOOM.min, ZOOM.max);
        pinch = nd;
      }
    };
    const up = (e: PointerEvent) => void pts.delete(e.pointerId);
    const wheel = (e: WheelEvent) => {
      // В прототипе конструктор занимал отдельный экран и колесо можно было
      // забирать себе. Теперь он посреди главной, и глухой preventDefault
      // не давал пролистать страницу. Зум — по Ctrl или ⌘, как на картах.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      orbit.current.zoom = clamp(orbit.current.zoom * (1 + e.deltaY * 0.001), ZOOM.min, ZOOM.max);
    };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
      cv.removeEventListener('wheel', wheel);
      cv.style.touchAction = prevTouchAction;
    };
  }, [gl, interactive]);

  useFrame(() => {
    const s = orbit.current;
    if (s.autorotate) s.theta += 0.004;
    const aspect = size.height ? size.width / size.height : 1;
    const d = ((extent * 2.1 + 0.5) / Math.min(1, aspect || 1)) * s.zoom;
    const phi = clamp(s.phi, PHI.min, PHI.max);
    const ty = height / 2;
    camera.position.set(
      d * Math.sin(phi) * Math.sin(s.theta),
      ty + d * Math.cos(phi),
      d * Math.sin(phi) * Math.cos(s.theta),
    );
    camera.lookAt(0, ty, 0);
  });

  return null;
}

/** Текстура ЛДСП. Пока грузится — материал остаётся на оттенке из каталога. */
function useWoodTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let dead = false;
    new THREE.TextureLoader().load(url, (t) => {
      if (dead) {
        t.dispose();
        return;
      }
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      setTexture(t);
    });
    return () => {
      dead = true;
    };
  }, [url]);

  useEffect(() => () => void texture?.dispose(), [texture]);
  return texture;
}

function Scene({
  params,
  color,
  wood,
  woodTexture,
  autorotate,
  interactive,
}: {
  params: FrameParams;
  color: string;
  wood: string;
  woodTexture: string | null;
  autorotate: boolean;
  interactive: boolean;
}) {
  const frame = useMemo(() => buildFrame(params), [params]);
  const texture = useWoodTexture(woodTexture);

  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.3 }),
    [],
  );
  const ldsp = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 }),
    [],
  );
  useEffect(
    () => () => {
      metal.dispose();
      ldsp.dispose();
    },
    [metal, ldsp],
  );

  metal.color.set(color);
  ldsp.map = texture;
  ldsp.color.set(texture ? '#FFFFFF' : wood);
  ldsp.needsUpdate = true;
  if (texture) {
    texture.repeat.set(
      Math.max(0.6, params.w / 1000 / WOOD_TILE),
      Math.max(0.6, params.l / 1000 / WOOD_TILE),
    );
  }

  const extent = Math.max(params.w / 1000, frame.height, params.l / 1000);

  return (
    <>
      <group>
        {frame.parts.map((part, i) => (
          <mesh key={i} position={[part.position[0], part.position[1], part.position[2]]}>
            <boxGeometry args={[part.size[0], part.size[1], part.size[2]]} />
            <primitive object={part.material === 'ldsp' ? ldsp : metal} attach="material" />
          </mesh>
        ))}
      </group>
      <ShadowPlane w={params.w / 1000} l={params.l / 1000} />
      <CameraRig
        extent={extent}
        height={frame.height}
        autorotate={autorotate}
        interactive={interactive}
      />
    </>
  );
}

export function Frame3D({
  color,
  wood,
  woodTexture = null,
  autorotate = false,
  interactive = true,
  className,
  ...params
}: Frame3DProps) {
  const background = cssVar('--surface-sunken', '#EBEAE6');
  const groundLight = useMemo(() => new THREE.Color(cssVar('--border-strong', '#B8B5AD')), []);

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ fov: 38, near: 0.01, far: 100 }}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      >
        <color attach="background" args={[background]} />
        <hemisphereLight args={[0xffffff, groundLight.getHex(), 1.1]} />
        <directionalLight position={[3, 5, 2]} intensity={1.5} />
        <directionalLight position={[-4, 2.5, -3]} intensity={0.5} />
        <Scene
          params={params}
          color={color}
          wood={wood}
          woodTexture={woodTexture}
          autorotate={autorotate}
          interactive={interactive}
        />
      </Canvas>
    </div>
  );
}
