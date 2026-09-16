/* Процедурный каркас-параллелепипед: 12 рёбер квадратного профиля, ручной orbit + zoom. */
(function () {
  const React = window.React;
  let threeP;
  const loadThree = () => (threeP || (threeP = import('https://unpkg.com/three@0.160.0/build/three.module.js')));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function shadowTexture(THREE) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(28,27,25,0.28)');
    grad.addColorStop(0.55, 'rgba(28,27,25,0.10)');
    grad.addColorStop(1, 'rgba(28,27,25,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function rebuild(s) {
    const { THREE, group, mat, woodMat } = s;
    const p = s.p.profile / 1000, W = s.p.w / 1000, H = s.p.h / 1000, L = s.p.l / 1000;
    group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    group.clear();
    mat.color.set(s.p.color);
    if (woodMat) woodMat.color.set(s.p.wood);
    const add = (sx, sy, sz, x, y, z, m2) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m2 || mat);
      mesh.position.set(x, y, z); group.add(mesh);
    };
    const hx = (W - p) / 2, hz = (L - p) / 2;
    let Heff = H;
    if (s.p.model === 'deska' || s.p.model === 'pats' || s.p.model === 'chestable') {
      const t = 0.02, fh = Math.max(H - t, p * 2); // металл до низа столешницы
      for (const ix of [-1, 1]) for (const iz of [-1, 1]) add(p, fh, p, ix * hx, fh / 2, iz * hz); // 4 ноги
      for (const iz of [-1, 1]) add(W - 2 * p, p, p, 0, fh - p / 2, iz * hz);                      // царги по ширине
      for (const ix of [-1, 1]) add(p, p, L - 2 * p, ix * hx, fh - p / 2, 0);                      // царги по длине
      if (s.p.model !== 'deska') for (const iz of [-1, 1]) add(W - 2 * p, p, p, 0, p / 2, iz * hz); // замкнутые боковые рамы
      if (s.p.model === 'chestable') {
        const p2 = 0.015, ch = Math.min(0.41, fh - 0.08);
        const ext = Math.max(0, Math.min((+s.p.drawerOff || 0) / 1000, 0.2)); // расширение ящика до +200 мм
        const cd = Math.min(0.45 + ext, L - 2 * p - 0.2);
        const cx = (hx - p) * 0.7, cz2 = hz - p - 0.1, cz1 = cz2 - cd, zc = (cz1 + cz2) / 2, yBot = fh - ch; // каркас уже стола, ближе к центру
        for (const ix of [-1, 1]) for (const z of [cz1, cz2]) add(p2, ch, p2, ix * cx, yBot + ch / 2, z); // вертикали каркаса ящика
        for (const z of [cz1, cz2]) add(2 * cx - p2, p2, p2, 0, yBot + p2 / 2, z);                        // нижние перемычки
        for (const ix of [-1, 1]) add(p2, p2, cd - p2, ix * cx, yBot + p2 / 2, zc);
        if (!s.knobMat) s.knobMat = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.1 });
        s.knobMat.color.copy(woodMat.color).multiplyScalar(0.62);
        const bw = 2 * cx - 2 * p2 - 0.02, bd = cd - 2 * p2 - 0.01, dh = 0.175, gap = 0.028; // 2 ящика, внутренние 400 мм
        const xFront = cx + 0.012, y0 = yBot + p2 + 0.008; // фасады — с длинной стороны стола
        for (const i of [0, 1]) {
          const yc = y0 + dh / 2 + i * (dh + gap);
          add(bw, dh, bd, -0.01, yc, zc, woodMat);                      // корпус
          add(0.018, dh + 0.012, bd + 0.01, xFront, yc, zc, woodMat);   // фасад
          add(0.026, 0.026, 0.026, xFront + 0.022, yc, zc, s.knobMat);  // ручка
        }
      }
      add(W, t, L, 0, fh + t / 2, 0, woodMat);                                                     // столешница
    } else if (s.p.model === 'stella') {
      const t = 0.02, g = (s.p.gap || 300) / 1000;
      Heff = 5 * (p + t) + 4 * g;
      for (const ix of [-1, 1]) for (const iz of [-1, 1]) add(p, Heff, p, ix * hx, Heff / 2, iz * hz); // 4 стойки
      for (let k = 0; k < 5; k++) {
        const yb = k * (p + t + g);
        for (const iz of [-1, 1]) add(W - 2 * p, p, p, 0, yb + p / 2, iz * hz);   // рама полки по глубине
        for (const ix of [-1, 1]) add(p, p, L - 2 * p, ix * hx, yb + p / 2, 0);   // рама полки по ширине
        add(W, t, L, 0, yb + p + t / 2, 0, woodMat);                              // полка ЛДСП
      }
    } else {
      for (const ix of [-1, 1]) for (const iz of [-1, 1]) add(p, H, p, ix * hx, H / 2, iz * hz);       // 4 стойки
      for (const y of [p / 2, H - p / 2]) for (const iz of [-1, 1]) add(W - 2 * p, p, p, 0, y, iz * hz); // 4 по ширине
      for (const y of [p / 2, H - p / 2]) for (const ix of [-1, 1]) add(p, p, L - 2 * p, ix * hx, y, 0); // 4 по длине
    }
    s.shadow.scale.set(W * 1.7, L * 1.7, 1);
    s.baseDist = Math.max(W, Heff, L) * 2.1 + 0.5;
    s.ty = Heff / 2;
  }

  function place(s) {
    if (s.autorotate) s.theta += 0.004;
    const aspect = s.camera ? s.camera.aspect : 1;
    const d = (s.baseDist / Math.min(1, aspect || 1)) * s.zoom;
    const phi = clamp(s.phi, 0.25, 1.45);
    s.camera.position.set(d * Math.sin(phi) * Math.sin(s.theta), s.ty + d * Math.cos(phi), d * Math.sin(phi) * Math.cos(s.theta));
    s.camera.lookAt(0, s.ty, 0);
  }

  function Frame3D(props) {
    const ref = React.useRef(null);
    const sRef = React.useRef(null);
    if (!sRef.current) sRef.current = { theta: 0.65, phi: 1.12, zoom: 1, autorotate: !!props.autorotate };
    const s = sRef.current;
    s.p = { h: +props.h || 800, w: +props.w || 600, l: +props.l || 1200, profile: +props.profile || 30, color: props.color || '#17171A', model: props.model || 'cube', wood: props.wood || '#C6893B', drawerOff: +props.drawerOff || 0, gap: +props.gap || 300 };
    React.useEffect(() => {
      let dead = false; const fns = [];
      loadThree().then(THREE => {
        if (dead || !ref.current) return;
        const el = ref.current;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        Object.assign(renderer.domElement.style, { display: 'block', touchAction: 'none', width: '100%', height: '100%' });
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#EBEAE6');
        const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
        scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b5ad, 1.1));
        const d1 = new THREE.DirectionalLight(0xffffff, 1.5); d1.position.set(3, 5, 2); scene.add(d1);
        const d2 = new THREE.DirectionalLight(0xffffff, 0.5); d2.position.set(-4, 2.5, -3); scene.add(d2);
        const mat = new THREE.MeshStandardMaterial({ color: '#17171A', roughness: 0.55, metalness: 0.3 });
        const woodMat = new THREE.MeshStandardMaterial({ color: '#C6893B', roughness: 0.75, metalness: 0.05 });
        const group = new THREE.Group(); scene.add(group);
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ map: shadowTexture(THREE), transparent: true, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);
        Object.assign(s, { THREE, renderer, scene, camera, group, mat, woodMat, shadow, ready: true });
        rebuild(s);
        if (props.interactive !== false) {
          const pts = new Map(); let pinch = 0;
          const cv = renderer.domElement;
          const dn = e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const a = [...pts.values()]; pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); } };
          const mv = e => {
            if (!pts.has(e.pointerId)) return;
            const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
            if (pts.size === 1) { s.theta -= (e.clientX - prev[0]) * 0.006; s.phi = clamp(s.phi - (e.clientY - prev[1]) * 0.006, 0.25, 1.45); s.autorotate = false; }
            else if (pts.size === 2) { const a = [...pts.values()]; const nd = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch) s.zoom = clamp(s.zoom * pinch / nd, 0.45, 2.6); pinch = nd; }
          };
          const up = e => pts.delete(e.pointerId);
          const wh = e => { e.preventDefault(); s.zoom = clamp(s.zoom * (1 + e.deltaY * 0.001), 0.45, 2.6); };
          cv.addEventListener('pointerdown', dn); cv.addEventListener('pointermove', mv);
          cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
          cv.addEventListener('wheel', wh, { passive: false });
          fns.push(() => { cv.removeEventListener('pointerdown', dn); cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wh); });
        }
        const size = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
        size();
        const ro = new ResizeObserver(size); ro.observe(el);
        let raf;
        const loop = () => { place(s); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
        loop();
        fns.push(() => { cancelAnimationFrame(raf); ro.disconnect(); group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); mat.dispose(); woodMat.dispose(); if (s.knobMat) s.knobMat.dispose(); renderer.dispose(); renderer.domElement.remove(); });
      });
      return () => { dead = true; fns.forEach(f => f()); s.ready = false; };
    }, []);
    React.useEffect(() => { if (s.ready) rebuild(s); });
    return React.createElement('div', { ref, style: Object.assign({ width: '100%', height: '100%', overflow: 'hidden' }, props.style) });
  }

  window.Frame3D = Frame3D;
  if (typeof module !== 'undefined' && module.exports) module.exports.Frame3D = Frame3D;
})();
