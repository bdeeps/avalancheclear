// Shared parts for AvalancheClear: snowpack numbers, slab stability, the temperature-gradient rule,
// a Voellmy model of a moving avalanche, the survival curve, chart boards and layout helpers.
// Scenes are in scene units; each chapter says what a unit means. +x right, +y up, +z towards you.
import { THREE, M, box, sphere, canvasTexture, clamp, lerp, smooth } from './kit.js';

export const G = 9.81, RAD = Math.PI / 180;

// ---------------------------------------------------------------- the slab on its weak layer
// A slab of snow with mass m (kg on each square metre of slope) on a slope of angle ψ pulls along
// the slope with a shear stress τ = m·g·sin ψ (pascals). The weak layer under it resists with its
// shear strength. Stability index S = strength ÷ stress (Roch 1966; Föhn 1987, "The stability index
// and various triggering mechanisms", IAHS Publ. 162). Below 1 the slope releases on its own;
// 1 to 1.5 is the range where a small extra load can do it; above 1.5 it is mostly stable.
export const shear = (mass, deg) => mass * G * Math.sin(deg * RAD);
// A skier adds shear stress at the weak layer that falls off with depth: about 155 ÷ depth (m) Pa
// on a 38° slope (Föhn 1987; Jamieson & Johnston 1998, Annals of Glaciology 26). Used at all angles
// here as a rule of thumb.
export const skierStress = (depth) => 155 / Math.max(0.2, depth);
// Once the weak layer has broken, the slab still has to beat the friction of the crushed layer.
// Measured crack-face friction is about 0.57, an angle of about 30° (van Herwijnen & Heierli 2009,
// Geophys. Res. Lett. 36). That is why slabs rarely slide on slopes gentler than about 30°.
export const MU_CRACK = 0.57, SLIDE_DEG = Math.atan(MU_CRACK) / RAD;
// On very steep ground new snow sluffs off in small loose slides before a thick slab can build.
// Share of new snow that stays: all of it up to 45°, none by 60°. An illustration of the upper edge
// of the 30–45° window (most slab avalanches start there, peak near 38°: McClung & Schaerer,
// "The Avalanche Handbook", 3rd ed. 2006; Schweizer & Jamieson 2001).
export const stays = (deg) => clamp(1 - (deg - 45) / 15, 0, 1);
// Densities (kg/m³), typical values from The Avalanche Handbook and the International
// Classification for Seasonal Snow on the Ground (Fierz et al. 2009, UNESCO).
export const RHO_NEW = 100, RHO_SLAB = 200;
// The slab in chapters 3 and 4: 30 cm of older wind slab plus the new snow that stays.
export function slab(deg, newCm, extraKg = 0) {
  const keep = stays(deg), n = (newCm / 100) * keep;
  const mass = 0.3 * RHO_SLAB + n * RHO_NEW + extraKg, depth = 0.3 + n;
  return { keep, mass, depth, tau: shear(mass, deg) };
}

// ---------------------------------------------------------------- the temperature gradient
// The ground under a deep snowpack stays near 0 °C; the surface follows the air. The gradient is
// the difference ÷ the depth. Above about 10 °C per metre (1 °C per 10 cm) grains grow into angular
// facets and depth hoar; below it they round off and bond (Akitaya 1974; Colbeck 1983; Avalanche Handbook).
export const TG_CRIT = 10;
// Saturation vapour pressure over ice (Magnus form, Alduchov & Eskridge 1996), in pascals.
export const esatIce = (T) => 611.2 * Math.exp((22.46 * T) / (272.62 + T));

// ---------------------------------------------------------------- an avalanche in motion
// Voellmy's model (A. Voellmy 1955, "Über die Zerstörungskraft von Lawinen", Schweizerische
// Bauzeitung 73): the flow is slowed by dry friction μ and by a turbulent drag that grows with speed²:
//   dv/dt = g (sin θ − μ cos θ) − g v² ÷ (ξ h)
// μ and ξ in the ranges used with the Swiss guidelines and RAMMS (SLF): μ 0.15–0.4, ξ 400–2,000 m/s².
// Flow densities and speeds: McClung & Schaerer 2006 (dry 50–200 km/h for large ones, wet 20–100).
export const KINDS = {
  loose: { name: 'Loose-snow avalanche', short: 'Loose snow', mu: 0.3, xi: 1000, rho: 150, powder: false, note: 'Starts at a point and fans out. Usually small, but it can knock you off your feet or over a cliff.' },
  slab: { name: 'Dry slab avalanche', short: 'Dry slab', mu: 0.2, xi: 1500, rho: 300, powder: true, note: 'A whole plate breaks away at once. The big killer. Fast ones grow a powder cloud.' },
  wet: { name: 'Wet-snow avalanche', short: 'Wet snow', mu: 0.35, xi: 600, rho: 450, powder: false, note: 'Meltwater or rain has weakened the pack. Slower, but as heavy as wet concrete.' },
};
// The path: slope angle (degrees) against horizontal distance (m). Start zone 38°, track 27°, runout 4°.
export const PATH_LEN = 2200;
export const pathDeg = (x) => 38 - 11 * smooth((x - 250) / 250) - 23 * smooth((x - 850) / 450);
const PX = [], PY = []; { let y = 0; for (let x = 0; x <= PATH_LEN; x += 5) { PX.push(x); PY.push(y); y -= 5 * Math.tan(pathDeg(x + 2.5) * RAD); } }
export const PATH_DROP = -PY[PY.length - 1];
export const pathY = (x) => { const i = clamp(x / 5, 0, PX.length - 1.001), a = Math.floor(i); return lerp(PY[a], PY[a + 1], i - a); };
// Run a release of depth h (m) from x = 150 m. Returns the track of the centre of the flow.
export function runAvalanche(kind, h) {
  const K = KINDS[kind], dt = 0.1, t = [], xs = [], vs = [];
  let x = 150, v = 0, vmax = 0, xmax = 150;
  for (let i = 0; i < 6000; i++) {
    const th = pathDeg(x) * RAD, a = G * (Math.sin(th) - K.mu * Math.cos(th)) - (G * v * v) / (K.xi * h);
    v = Math.max(0, v + a * dt); x += v * Math.cos(th) * dt;
    if (v > vmax) { vmax = v; xmax = x; }
    t.push(i * dt); xs.push(x); vs.push(v);
    if ((v < 0.3 && i > 20) || x > PATH_LEN - 10) break;
  }
  const at = (time) => { const i = clamp(time / dt, 0, t.length - 1.001), a = Math.floor(i), k = i - a; return { x: lerp(xs[a], xs[Math.min(a + 1, xs.length - 1)], k), v: lerp(vs[a], vs[Math.min(a + 1, vs.length - 1)], k) }; };
  return { T: t[t.length - 1], vmax, xmax, stop: xs[xs.length - 1], at };
}
// Impact pressure of the dense flow on a wall: p ≈ ρ v² (Swiss guidelines; Salm, Burkard & Gubler 1990).
export const impactKPa = (rho, v) => (rho * v * v) / 1000;
// What that pressure can do (McClung & Schaerer 2006, table of impact pressures).
export const damage = (kPa) => (kPa < 1 ? 'Too weak to break a window' : kPa < 5 ? 'Breaks windows' : kPa < 30 ? 'Pushes in doors' : kPa < 100 ? 'Destroys wood-frame buildings' : kPa < 1000 ? 'Uproots mature trees' : 'Moves reinforced-concrete structures');

// ---------------------------------------------------------------- survival against burial time
// People completely buried in Swiss avalanches (Falk, Brugger & Adler-Kastner 1994, Nature 368:21):
// 92% alive if dug out at 15 minutes, 30% at 35 minutes, 27% at 90 minutes, 3% at 130 minutes.
// A 2024 update (Rauch et al., JAMA Network Open, Swiss data 1981–2020) found 91% within the first
// 10 minutes and 31% for 10 to 30 minutes: the safe window is, if anything, shorter.
export const SURVIVAL = [[0, 100], [15, 92], [35, 30], [90, 27], [130, 3], [180, 3]];
export function survival(min) {
  for (let i = 1; i < SURVIVAL.length; i++) if (min <= SURVIVAL[i][0]) { const [a, b] = [SURVIVAL[i - 1], SURVIVAL[i]]; return lerp(a[1], b[1], (min - a[0]) / (b[0] - a[0])); }
  return 3;
}

// ---------------------------------------------------------------- formatting
export const fmtN = (v, d = 0) => v.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d });
export const inReel = () => document.body.classList.contains('gb-reel');
export const A = (slug, t) => `<a style="color:inherit;text-decoration:underline" href="https://glassbox.how/${slug}/">${t}</a>`;

// ---------------------------------------------------------------- boards and layout
export const COL = { snow: '#eaf4ff', ice: '#8ef0ff', weak: '#ff7a59', warn: '#ffd35a', ok: '#a3e635', bad: '#ff5a8a', soft: 'rgba(255,255,255,.6)', ink: '#e8eef8' };
export const HEX = { snow: 0xf2f7fd, old: 0xcfdcea, slab: 0xffffff, weak: 0xff7a59, crust: 0x9fd8ee, hoar: 0xffc46b, rock: 0x6b635c, rock2: 0x8a7f74, ground: 0x5a4c3e, tree: 0x2f6b46, ok: 0xa3e635, bad: 0xff5a8a, warn: 0xffd35a, ice: 0x8ef0ff };
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.92)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.ink; g.font = 'bold 28px sans-serif'; g.fillText(text, 22, 40);
  if (sub) { g.font = '19px sans-serif'; g.fillStyle = COL.soft; g.fillText(sub, 22, 68); }
}
// Place a board: one spot on a wide screen, another in the tall reel video.
export function placeBoard(b, wide, reel) {
  const [p, r = 0, s = 1] = inReel() && reel ? reel : wide;
  b.mesh.position.set(...p); b.mesh.rotation.set(0, r, 0); b.mesh.scale.setScalar(s);
}
// On a phone the stage is small, so the readout keeps its headline and first two rows only.
export function compact(html) {
  if (window.innerWidth >= 560 || inReel()) return html;
  let n = 0;
  return html.replace(/<small[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (n++ < 2 ? m : ''));
}
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.14 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}

// ---------------------------------------------------------------- parts
// A prism: a polygon in the x–y plane (array of [x, y]) pushed from z0 to z1.
export function prism(pts, z0, z1, mat) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
// A band that follows a profile: top(x) is the upper edge, thick the thickness measured straight down.
export function band(xs, top, thick, z0, z1, mat) {
  const up = xs.map((x) => [x, top(x)]), dn = xs.map((x) => [x, top(x) - (typeof thick === 'function' ? thick(x) : thick)]).reverse();
  return prism([...up, ...dn], z0, z1, mat);
}
// A conifer: a trunk and two cones.
export function tree(h = 1) {
  const g = new THREE.Group(), leaf = M.matte(HEX.tree);
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * h, 0.05 * h, 0.3 * h, 6), M.matte(0x5b4634)); t.position.y = 0.15 * h;
  const a = new THREE.Mesh(new THREE.ConeGeometry(0.26 * h, 0.6 * h, 7), leaf); a.position.y = 0.55 * h;
  const b = new THREE.Mesh(new THREE.ConeGeometry(0.18 * h, 0.45 * h, 7), leaf); b.position.y = 0.88 * h;
  g.add(t, a, b); g.traverse((o) => { o.castShadow = true; }); return g;
}
// A small hut with a pitched roof.
export function hut(s = 1, color = 0xb98a5a) {
  const g = new THREE.Group(), w = box(0.6 * s, 0.4 * s, 0.5 * s, M.matte(color)); w.position.y = 0.2 * s;
  const r = new THREE.Mesh(new THREE.ConeGeometry(0.5 * s, 0.3 * s, 4), M.matte(0x7a3b2e)); r.position.y = 0.55 * s; r.rotation.y = Math.PI / 4;
  g.add(w, r); return g;
}
// A person: body, head, and skis if asked.
export function person(s = 1, color = 0xff5a3a, skis = false) {
  const g = new THREE.Group(), b = new THREE.Mesh(new THREE.CapsuleGeometry(0.09 * s, 0.26 * s, 4, 8), M.plastic(color)); b.position.y = 0.3 * s;
  const h = sphere(0.08 * s, M.plastic(0xf1c9a5), 12); h.position.y = 0.6 * s; g.add(b, h);
  if (skis) { const k = box(0.62 * s, 0.02 * s, 0.16 * s, M.plastic(0x2b3140)); k.position.y = 0.02 * s; g.add(k); }
  return g;
}

// The mountain used in chapters 1, 5 and 6: the avalanche path in profile, summit on the right.
// P(X, up) gives the scene point for a spot X metres (horizontal) down the path, lifted by `up`.
export function mountain({ s = 1 / 170, x0 = 6, y0 = 0.5, z0 = -1.6, z1 = 1.6, snow = 0.16 } = {}) {
  const P = (X, up = 0) => [x0 - X * s, y0 + (pathY(clamp(X, 0, PATH_LEN)) + PATH_DROP) * s + up];
  const g = new THREE.Group(), xs = []; for (let X = PATH_LEN; X >= 0; X -= 40) xs.push(X);
  const top = xs.map((X) => P(X)), yT = top[top.length - 1][1];
  const ridge = [[x0 + 60 * s, yT + 45 * s], [x0 + 170 * s, yT - 90 * s], [x0 + 380 * s, yT - 420 * s], [x0 + 380 * s, 0]];
  g.add(prism([...top, ...ridge, [top[0][0], 0]], z0, z1, M.matte(HEX.rock)));
  const th = (X) => snow * (0.55 + 0.45 * smooth((1500 - X) / 900));
  const cap = [...xs.map((X) => P(X, th(X))), [x0 + 60 * s, yT + 45 * s + snow * 0.8], [x0 + 110 * s, yT - 20 * s], ridge[0], ...[...top].reverse()];
  g.add(prism(cap, z0 - 0.01, z1 + 0.01, M.matte(HEX.snow)));
  return { g, P, s, th, deg: pathDeg };
}
export { THREE, M, box, sphere, clamp, lerp, smooth };
