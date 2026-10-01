// Chapter 1: a mountain of layers. An avalanche path in profile (start zone, track, runout) and a
// snow pit dug in the start zone, shown large. Each layer is drawn as wide as it is hard: the classic
// snow-profile picture that avalanche observers draw (hand hardness: fist, four fingers, one finger,
// pencil, knife; International Classification for Seasonal Snow on the Ground, Fierz et al. 2009).
// Densities are typical values for each kind of snow (The Avalanche Handbook, McClung & Schaerer 2006):
// new snow about 100 kg/m³, wind slab 250–350, settled rounded snow about 300, depth hoar 200–300,
// melt-freeze crust 400 or more. The weight on a layer is the sum of density × thickness above it.
// Zones: start zone usually 30–45°, track roughly 20–30°, runout under about 20° (same source).
import { THREE, M, box, HEX, fmtN, compact, fitNarrow, mountain, tree, hut, A } from '../snow.js';
import { swarm } from '../kit.js';

const HARD = ['', 'fist (very soft)', 'four fingers (soft)', 'one finger (medium)', 'pencil (hard)', 'knife (very hard)'];
// Bottom layer first: the order the winter laid them down.
const LAYERS = [
  { name: 'Depth hoar', cm: 25, rho: 250, hard: 2, weak: true, c: HEX.hoar, storm: 'November: thin first snow, then weeks of cold', what: 'Thin early snow that sat through a long cold spell. Its grains grew into loose, sugary cups that barely stick together.' },
  { name: 'Melt-freeze crust', cm: 4, rho: 450, hard: 5, c: HEX.crust, storm: 'December: a warm, wet day, then a hard frost', what: 'The surface melted in sun or rain and froze into a hard, icy sheet. A smooth bed for whatever lands on it.' },
  { name: 'Settled old snow', cm: 40, rho: 320, hard: 4, c: HEX.old, storm: 'January: a big storm, then mild settled weather', what: 'A deep fall that has had time to settle. Its grains have rounded and bonded into a strong layer.' },
  { name: 'Buried surface hoar', cm: 2, rho: 100, hard: 1, weak: true, c: HEX.weak, storm: 'Early February: clear, cold, still nights', what: 'Feathery frost that grew on the surface on clear nights and was then buried. Thin as a finger and very weak.' },
  { name: 'Wind slab', cm: 35, rho: 280, hard: 3, c: HEX.slab, storm: 'Mid February: snow with strong wind', what: 'Snow broken up by the wind and packed into a stiff, cohesive plate. This is the slab.' },
  { name: 'New snow', cm: 30, rho: 100, hard: 1, c: 0xe3f1ff, storm: 'Last night: 30 cm of light new snow', what: 'Fresh, light and soft. It adds weight to everything underneath.' },
];
const U = 0.024, X0 = -4.7, Z = 2.2, BASE = 0.55, wOf = (L) => 0.9 + 0.42 * L.hard, hOf = (L) => Math.max(0.1, L.cm * U);

export default {
  id: 'layers',
  short: 'A mountain of layers',
  title: 'A mountain of layers',
  subtitle: 'A snowy slope is not one blanket. It is a stack of layers, one from every storm, and some are far weaker than others.',
  view: { pos: [0.8, 5.8, 12.4], target: [0.8, 4.6, 0] },
  learn: `<p>From the valley, a snowy mountain looks like one smooth white sheet. Dig into it and you find a <b>snowpack</b>: a stack of layers. Each snowfall lays down a new one, and wind, sun, rain and cold change each layer before the next arrives. So the snowpack is a diary of the whole winter.</p>
    <p>Some layers are strong. Old snow settles and its grains bond together. Wind packs snow into a stiff plate called a <b>slab</b>. Other layers are weak: loose, sugary grains or feathery frost that hardly hold together. A <b>slab resting on a weak layer</b>, on a steep slope, is the recipe for the most dangerous kind of avalanche.</p>
    <p>Observers dig a <b>snow pit</b> and test each layer by pushing a hand into it: a fist goes into the softest snow, then four fingers, one finger, a pencil, and only a knife into the hardest. The model draws each layer as wide as it is hard, the way a real snow profile is drawn. Look for a wide layer sitting on a narrow one.</p>
    <p>The mountain itself has three parts. The <b>start zone</b> is where the snow breaks away, usually on slopes of 30 to 45 degrees. The <b>track</b> is the chute it runs down. The <b>runout zone</b> is the gentler ground where it slows and piles up. Villages, roads and camps in a runout zone are the ones at risk. How the snow crystals form in the first place is in ${A('freezeclear', 'FreezeClear')}; slopes of soil and rock are in ${A('landslideclear', 'LandslideClear')}.</p>
    <p class="tip"><b>Try it:</b> build the winter one storm at a time, then dig down. Find the two weak layers, and work out how much snow each square metre of them is carrying.</p>`,
  terms: [
    { t: 'Snowpack', d: 'All the snow lying on the ground, built up in layers through the winter.' },
    { t: 'Slab', d: 'A stiff, cohesive layer of snow that can break away in one piece.' },
    { t: 'Weak layer', d: 'A layer of poorly bonded grains that a slab can shear off along.' },
    { t: 'Snow pit', d: 'A hole dug to the ground so the layers can be seen, felt and tested.' },
    { t: 'Start zone, track, runout', d: 'Where an avalanche begins, the chute it follows, and where it stops.' },
  ],
  defaults: { storms: 6, dig: 0, apart: 0 },
  controls: [
    { key: 'storms', type: 'range', label: 'How far into the winter', min: 1, max: 6, step: 1, fmt: (v) => LAYERS[Math.round(v) - 1].storm },
    { key: 'dig', type: 'range', label: 'Dig the snow pit', min: 0, max: 100, step: 1, fmt: (v, s) => `${Math.round((v / 100) * total(Math.round(s.storms)))} cm down`, ends: ['surface', 'ground'] },
    { key: 'apart', type: 'range', label: 'Pull the layers apart', min: 0, max: 1, step: 0.01, fmt: (v) => (v < 0.05 ? 'stacked' : 'apart') },
  ],
  quiz: [
    { q: 'What is a snowpack made of?', options: ['One even blanket of snow', 'Layers, one from each snowfall, each changed by the weather', 'Solid ice with snow on top', 'Only the most recent snowfall'], answer: 1, why: 'Every storm adds a layer, and wind, sun, rain and cold alter it before the next one lands.' },
    { q: 'Which arrangement is the dangerous one?', options: ['A weak layer on top of a slab', 'A stiff slab resting on a weak layer', 'Deep snow with no layers', 'A crust on bare ground'], answer: 1, why: 'The slab can break as one plate and slide on the weak layer beneath it.' },
    { q: 'Where does an avalanche usually slow down and pile up?', options: ['The start zone', 'The summit ridge', 'The runout zone', 'The track'], answer: 2, why: 'The runout zone is the gentler ground at the bottom of the path. Buildings and roads there are the ones exposed.' },
  ],
  reel: [
    { ms: 5500, caption: 'A snowy slope is not one blanket. Every storm of the winter leaves its own layer.', set: { dig: 0, apart: 0 }, anim: { storms: [1, 6] }, view: { pos: [-2.5, 4, 11], target: [-2.5, 3.2, 0] }, spin: 0 },
    { ms: 5500, caption: 'Dig a pit and you find the danger: a stiff slab resting on a thin, weak layer.', set: { storms: 6 }, anim: { dig: [0, 60], apart: [0, 0.8] }, view: { pos: [-3.5, 3.4, 8.5], target: [-3.8, 2.8, 2] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const mt = mountain({ s: 1 / 190, x0: 6.2, y0: 0.5, z0: -3.4, z1: -1.2, snow: 0.15 }); root.add(mt.g);
    [[1450, -1.6], [1600, -2.6], [1750, -1.9], [1900, -2.9], [2050, -1.7], [1250, -3.0]].forEach(([X, z], i) => { const t = tree(0.7 + 0.2 * (i % 3)); const [x, y] = mt.P(X, 0.05); t.position.set(x, y, z); root.add(t); });
    const h1 = hut(0.9); { const [x, y] = mt.P(2000, 0.08); h1.position.set(x, y, -2.3); root.add(h1); }
    // The pit's place on the mountain, and a line to the big column.
    const pin = box(0.12, 0.5, 0.12, M.glow(HEX.warn)); { const [x, y] = mt.P(170, 0.3); pin.position.set(x, y, -1.2); root.add(pin); }
    const zone = (X0m, X1m, c) => { const [xa, ya] = mt.P(X0m, 0.2), [xb, yb] = mt.P(X1m, 0.2); const b = box(Math.hypot(xb - xa, yb - ya), 0.05, 0.1, M.glow(c)); b.position.set((xa + xb) / 2, (ya + yb) / 2, -1.12); b.rotation.z = Math.atan2(yb - ya, xb - xa); root.add(b); };
    zone(20, 380, HEX.bad); zone(420, 1000, HEX.warn); zone(1050, 2150, HEX.ok);
    const lab = (t, X, up, cls) => { const [x, y] = mt.P(X, up); return stage.label(t, [x, y, -1.2], root, cls); };
    const lStart = lab('<b>Start zone</b> · 30–45°', 120, 0.95, 'hot'), lTrack = lab('Track', 760, 0.75), lRun = lab('Runout zone', 1150, 0.6), lPit = lab('Snow pit here', 330, 0.25);
    // The column.
    const col = new THREE.Group(); root.add(col);
    const ground = box(3.4, 0.25, 2.2, M.matte(HEX.ground)); ground.position.set(X0 + 1.6, BASE - 0.125, Z); col.add(ground);
    const parts = LAYERS.map((L) => { const m = box(1, 1, 2, M.matte(L.c, { transparent: true })); col.add(m); return m; });
    const labels = LAYERS.map(() => stage.label('', [0, 0, 0], col));
    const spade = box(3.5, 0.035, 2.3, M.glow(HEX.warn, { transparent: true, opacity: 0.85 })); col.add(spade);
    const flakes = swarm(110, new THREE.OctahedronGeometry(0.035), M.glow(0xffffff)); root.add(flakes);
    const seed = Array.from({ length: 110 }, (_, i) => [((i * 0.618) % 1) * 15 - 7, ((i * 0.377) % 1) * 7, ((i * 0.853) % 1) * 6 - 3.5, 0.5 + ((i * 0.27) % 1)]);
    let cur = 0, load = 0, dug = 0, lastN = 0, fall = 0;

    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lTrack, lRun, lPit]);
        const n = Math.round(s.storms), tot = total(n); dug = (s.dig / 100) * tot;
        if (n !== lastN) { fall = 2.5; lastN = n; } fall = Math.max(0, fall - dt);
        let y = BASE, above = tot; cur = n - 1; load = 0;
        LAYERS.forEach((L, i) => {
          const m = parts[i], on = i < n; m.visible = labels[i].visible = on; if (!on) return;
          const w = wOf(L), h = hOf(L), topD = above - L.cm, here = dug >= topD && dug < above;
          if (here || (i === 0 && dug >= above)) cur = i;
          m.scale.set(w, h, 1); m.position.set(X0 + w / 2, y + h / 2, Z);
          m.material.opacity = dug > above - 0.01 && !here && i !== cur ? 0.4 : 1; m.material.depthWrite = m.material.opacity > 0.9;
          m.material.emissive.setHex(L.weak ? 0x55200a : 0x000000);
          labels[i].position.set(X0 + w + 1.75, y + h / 2, Z + 1);
          labels[i].element.innerHTML = `${L.weak ? '<b>' + L.name + '</b> · weak' : L.name} · ${L.cm} cm`;
          labels[i].element.className = 'lbl' + (i === cur ? ' hot' : '');
          if (narrow) labels[i].visible = i === cur;
          y += h + s.apart * 0.32; above = topD;
        });
        for (let j = cur + 1; j < n; j++) load += (LAYERS[j].cm / 100) * LAYERS[j].rho;
        const pc = parts[cur]; spade.visible = s.dig > 0; spade.position.set(X0 + 1.6, pc.position.y + pc.scale.y / 2 - (clampDepth(dug, cur, n) * pc.scale.y), Z);
        flakes.visible = fall > 0 || time % 9 < 3;
        seed.forEach(([x, y0, z, v], i) => flakes.place(i, [x + 0.2 * Math.sin(time + i), 7 - ((y0 + time * v * 0.9) % 7), z])); flakes.done();
      },
      readout: (s) => {
        const n = Math.round(s.storms), tot = total(n), L = LAYERS[cur] || LAYERS[0], up = LAYERS[cur + 1];
        const all = LAYERS.slice(0, n).reduce((a, l) => a + (l.cm / 100) * l.rho, 0);
        const risky = L.weak && cur < n - 1 && LAYERS.slice(cur + 1, n).some((l) => l.hard >= 3);
        return compact(`<div class="big">${tot} cm of snow in ${n} layer${n > 1 ? 's' : ''}</div>
          <div class="row"><span>${s.dig > 0 ? `Dug ${Math.round(dug)} cm down to` : 'At the surface'}</span><b>${L.name}</b></div>
          <div class="row"><span>Hand hardness</span><b>${HARD[L.hard]}</b></div>
          <div class="row"><span>Density</span><b>about ${L.rho} kg/m³</b></div>
          <div class="row"><span>Snow resting on each m² of it</span><b>${fmtN(Math.round(load))} kg</b></div>
          <div class="row"><span>Whole snowpack on each m² of ground</span><b>${fmtN(Math.round(all))} kg</b></div>
          <small class="${risky ? 'no' : ''}">${L.what}${risky ? ' A stiff slab lies on top of it: the dangerous arrangement.' : up && L.weak ? ' Nothing stiff lies on it yet.' : ''}</small>`);
      },
    };
  },
};

function total(n) { return LAYERS.slice(0, n).reduce((a, l) => a + l.cm, 0); }
// How far through layer `cur` the spade is (0 at its top, 1 at its bottom).
function clampDepth(dug, cur, n) { let above = 0; for (let j = cur + 1; j < n; j++) above += LAYERS[j].cm; return Math.min(1, Math.max(0, (dug - above) / LAYERS[cur].cm)); }
