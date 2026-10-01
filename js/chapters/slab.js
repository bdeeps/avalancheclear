// Chapter 3: the slab lets go. A cutaway of a slope: bed, old snow, a thin weak layer and the slab.
// Shear stress on the weak layer: τ = m·g·sin ψ, with m the slab's mass on each square metre of slope.
// Stability index S = weak-layer shear strength ÷ τ (Roch 1966; Föhn 1987). A skier adds about
// 155 ÷ depth (m) Pa at the weak layer (Föhn 1987; Jamieson & Johnston 1998), so shallow weak layers
// are the easiest to trigger. Weak-layer shear strengths measured with shear frames run from about
// 0.2 kPa (fresh surface hoar, depth hoar) to 3 kPa or more (Jamieson & Johnston 2001, Annals of
// Glaciology 32). The slab here is 30 cm of wind slab (200 kg/m³) plus new snow at 100 kg/m³.
// The 30–45° window: below about 30° the broken slab cannot beat the friction of the crushed weak
// layer (crack-face friction about 0.57: van Herwijnen & Heierli 2009), so the layer may collapse
// with a "whumpf" but nothing slides. Above about 45° new snow sluffs away before a thick slab can
// build (modelled in snow.js as a share that stays: an illustration of that upper edge).
// The fracture: cracks in weak layers have been timed at roughly 20–40 m/s in field tests, and
// faster in some real avalanches (van Herwijnen & Jamieson 2005; Bergfeld et al. 2022).
// One scene unit is 5 m: the slope shown is 40 m long.
import { THREE, M, box, clamp, HEX, COL, fmtN, compact, fitNarrow, board, panelBg, placeBoard, slab, skierStress, SLIDE_DEG, MU_CRACK, G, RAD, person, inReel, A } from '../snow.js';
import { arrow } from '../kit.js';

const L = 8, NB = 8, ZD = 2.6, YW = 0.5, WK = 0.09, PIV = [2.7, 3.0];
const calc = (s) => {
  const sl = slab(s.angle, s.snow), str = s.strength * 1000, sk = s.skier ? skierStress(sl.depth) : 0;
  const S = str / Math.max(1, sl.tau), Sk = str / Math.max(1, sl.tau + sk), steep = s.angle >= SLIDE_DEG;
  return { ...sl, str, sk, S, Sk, steep, fails: Sk < 1, natural: S < 1 };
};

export default {
  id: 'slab',
  short: 'The slab lets go',
  title: 'The slab lets go',
  subtitle: 'The slab’s weight pulls it down the slope. The weak layer holds it back. When the pull wins, a crack races across the whole slope.',
  view: { pos: [0.2, 5.6, 13.5], target: [0.2, 4.4, 0] },
  learn: `<p>A slab on a slope is in a tug of war. Gravity pulls its weight straight down, and part of that pull points <b>along the slope</b>. The steeper the slope and the heavier the slab, the bigger that part. On the other side is the <b>strength of the weak layer</b>: how much sideways pull its grains can take before they shear apart.</p>
    <p>Divide the strength by the pull and you get a <b>stability index</b>. Well above 1, the slope is holding comfortably. Close to 1, a small extra load is enough. Below 1, it goes. The balance is the same one that decides whether a hillside of soil slides, in ${A('landslideclear', 'LandslideClear')}, and it rests on the friction in ${A('frictionclear', 'FrictionClear')}.</p>
    <p>The break does not happen everywhere at once. It starts at one weak spot. The grains there crush, the slab above loses its support and bends, and that loads the next bit of weak layer. So a <b>crack runs through the weak layer</b>, tens of metres every second, far faster than anyone can ski. A few seconds later the slab breaks into blocks and the whole slope is moving.</p>
    <p><b>Why 30 to 45 degrees?</b> Below about 30° the slab cannot slide even when the weak layer collapses: the crushed grains still give too much friction. You may hear a deep <b>"whumpf"</b> as the layer drops, a loud warning, but the snow stays put. Above about 45° snow rarely stays long enough to build a thick slab. It trickles off in small loose slides during the storm. In between is the danger zone, and it peaks near 38°, just the angle skiers and climbers like best.</p>
    <p class="tip"><b>Try it:</b> set the slope to 38°, then pile on new snow until the index falls to 1. Now make the slope 25° with the same snow, and then 55°. Last, add the skier to a slope that was only just holding.</p>`,
  terms: [
    { t: 'Shear stress', d: 'The pull along the slope on the weak layer, in pascals: slab mass × gravity × the sine of the slope angle.' },
    { t: 'Shear strength', d: 'The most sideways pull a layer can take before it breaks.' },
    { t: 'Stability index', d: 'Strength divided by stress. Below 1, the slab releases.' },
    { t: 'Fracture propagation', d: 'A crack spreading through the weak layer, far beyond the point where it started.' },
    { t: 'Whumpf', d: 'The sound of a weak layer collapsing under you. A clear sign of an unstable snowpack.' },
    { t: 'Crown', d: 'The wall left at the top of the slope where the slab broke away.' },
  ],
  defaults: { angle: 38, snow: 30, strength: 1.0, skier: false },
  controls: [
    { key: 'angle', type: 'range', label: 'Slope angle', min: 15, max: 60, step: 1, fmt: (v) => `${v}°`, hint: 'Most slab avalanches start between 30° and 45°.' },
    { key: 'snow', type: 'range', label: 'New snow on top', min: 0, max: 150, step: 5, fmt: (v) => `${v} cm` },
    { key: 'strength', type: 'range', label: 'Strength of the weak layer', min: 0.2, max: 3, step: 0.1, fmt: (v) => `${v.toFixed(1)} kPa`, ends: ['sugar', 'well bonded'] },
    { key: 'skier', type: 'toggle', label: 'A skier on the slope', hint: 'A person adds a small pull, strongest when the weak layer is shallow.' },
  ],
  quiz: [
    { q: 'What does a stability index below 1 mean?', options: ['The slope is safe', 'The pull along the slope is more than the weak layer can hold', 'The snow is melting', 'The slab is too light to slide'], answer: 1, why: 'The index is strength divided by stress. Below 1 the stress has won, and the slab releases.' },
    { q: 'Why do few slab avalanches start on slopes gentler than about 30°?', options: ['It never snows there', 'Even with the weak layer broken, friction still holds the slab', 'The snow is always warmer', 'Wind cannot reach them'], answer: 1, why: 'The crushed weak layer still gives friction. Below about 30° gravity along the slope cannot beat it.' },
    { q: 'You hear a deep "whumpf" and feel the snow drop slightly. What has happened?', options: ['Nothing important', 'A weak layer under you has collapsed: a serious warning', 'An animal is under the snow', 'The snow has frozen'], answer: 1, why: 'It is the sound of a weak layer failing. On steeper ground the same break would have released the slab.' },
  ],
  reel: [
    { ms: 5500, caption: 'The slab’s weight pulls along the slope. Only the weak layer’s strength holds it back.', set: { angle: 38, strength: 1.4, skier: false }, anim: { snow: [0, 55] }, view: { pos: [2.2, 4.6, 10], target: [2.2, 4.4, 0] }, spin: 0 },
    { ms: 6000, caption: 'When the pull wins, a crack races through the weak layer and the whole slab breaks away.', set: { angle: 38, snow: 80, strength: 0.7, skier: false }, act: (s, inst) => inst.seek?.(), view: { pos: [2.2, 4.6, 10], target: [2.2, 4.4, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root); stage.floor.visible = false;
    // Everything on the slope lives in `tilt`: local +x points up the slope, +y away from it.
    const tilt = new THREE.Group(); tilt.position.set(PIV[0], PIV[1], 0); root.add(tilt);
    const bed = box(L, 0.7, ZD, M.matte(HEX.rock)); bed.position.set(0, -0.35, 0); tilt.add(bed);
    const old = box(L, YW, ZD, M.matte(HEX.old)); old.position.set(0, YW / 2, 0); tilt.add(old);
    const weakM = M.matte(HEX.weak), weak = box(L, WK, ZD + 0.02, weakM); weak.position.set(0, YW + WK / 2, 0); tilt.add(weak);
    const crack = box(1, WK + 0.03, ZD + 0.06, M.glow(0xffe14a)); tilt.add(crack);
    const blocks = Array.from({ length: NB }, (_, i) => { const b = box(L / NB - 0.02, 1, ZD, M.matte(i % 2 ? 0xffffff : 0xf1f6fc)); tilt.add(b); return b; });
    const skier = person(1.5, 0xff5a3a, true); tilt.add(skier);
    const aW = arrow(0xffffff, 1, 0.26, 0.045), aT = arrow(HEX.bad, 1, 0.26, 0.055), aS = arrow(HEX.ok, 1, 0.26, 0.055); tilt.add(aW, aT, aS);
    const UP = new THREE.Vector3(0, 1, 0), point = (ar, x, y, z) => ar.quaternion.setFromUnitVectors(UP, new THREE.Vector3(x, y, z).normalize());
    const lState = stage.label('', [2.4, -1.0, 2.2], root, 'hot');
    const lSlab = stage.label('Slab', [0, 0, 0], tilt), lWeak = stage.label('Weak layer', [0, 0, 0], tilt), lPull = stage.label('Pull along the slope', [0, 0, 0], tilt), lHold = stage.label('Weak layer holds', [0, 0, 0], tilt);
    const minor = [lSlab, lWeak, lPull, lHold];

    let phase = 'hold', t = 0, slide = 0, vs = 0, trig = 0, C = calc({ angle: 38, snow: 30, strength: 1, skier: false }), S0 = null;
    const brd = board(root, 5.2, 3.2, 598, 368, (g, w, h) => {
      panelBg(g, w, h); if (!S0) return;
      g.fillStyle = COL.ink; g.font = 'bold 25px sans-serif'; g.fillText('Pull on the weak layer at each slope angle', 16, 34);
      const x0 = 30, x1 = w - 20, y0 = h - 40, y1 = 62, ymax = Math.max(1500, S0.strength * 1300), X = (a) => x0 + ((a - 15) / 45) * (x1 - x0), Y = (p) => y0 - clamp(p / ymax, 0, 1.05) * (y0 - y1);
      g.fillStyle = 'rgba(255,90,138,.16)'; g.fillRect(X(30), y1, X(45) - X(30), y0 - y1);
      g.fillStyle = COL.bad; g.font = '18px sans-serif'; g.fillText('30° to 45°', X(30) + 8, y1 + 20);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
      g.strokeStyle = COL.ok; g.lineWidth = 4; g.setLineDash([10, 7]); g.beginPath(); g.moveTo(x0, Y(S0.strength * 1000)); g.lineTo(x1, Y(S0.strength * 1000)); g.stroke(); g.setLineDash([]);
      g.fillStyle = COL.ok; g.fillText('strength', x1 - 80, Y(S0.strength * 1000) - 8);
      g.strokeStyle = COL.bad; g.lineWidth = 5; g.beginPath();
      for (let a = 15; a <= 60; a += 1) { const c = calc({ ...S0, angle: a }); const y = Y(c.tau + c.sk); a === 15 ? g.moveTo(X(a), y) : g.lineTo(X(a), y); } g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(S0.angle), Y(C.tau + C.sk), 9, 0, 7); g.fill();
      g.fillStyle = COL.soft; g.font = '17px sans-serif'; [15, 30, 45, 60].forEach((a) => g.fillText(`${a}°`, X(a) - 12, y0 + 24)); g.fillText(`${(ymax / 1000).toFixed(1)} kPa`, x0 + 6, y1 + 16);
      g.fillText('too flat to slide', X(15) + 6, y0 - 10); g.fillText('snow sluffs off', X(47), y0 - 10);
    }, [0, 0, 0]);

    return {
      seek() { phase = 'hold'; t = 0.9; },
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, minor);
        placeBoard(brd, [[-3.3, 1.5, 2.2], 0, 0.95], [[1.5, 9.6, -1], 0, 1.5]); brd.mesh.visible = !narrow || inReel();
        C = calc(s); S0 = { ...s }; brd.redraw();
        const a = s.angle * RAD, tv = 0.3 + 0.0075 * s.snow * C.keep, ys = YW + WK;
        tilt.rotation.z = a; tilt.position.set(PIV[0], PIV[1], 0);
        // The cycle: hold → crack → slide (or collapse) → rest → hold.
        t += dt;
        if (phase === 'hold') { if (!C.fails) t = 0; else if (t > 1.6) { phase = 'crack'; t = 0; trig = s.skier ? 1.2 : -0.5; } }
        else if (phase === 'crack') { if (t > 0.9) { phase = C.steep ? 'slide' : 'whumpf'; t = 0; slide = 0; vs = 0; } }
        else if (phase === 'slide') { const acc = (G * (Math.sin(a) - MU_CRACK * Math.cos(a))) / 5; vs += acc * dt * 2.2; slide += vs * dt * 2.2; if (t > 3.6 || slide > 13) { phase = 'rest'; t = 0; } }
        else if (phase === 'whumpf') { if (t > 2.6) { phase = 'rest'; t = 0; } }
        else if (t > 1.3) { phase = 'hold'; t = 0; slide = 0; }
        const ck = phase === 'crack' ? clamp(t / 0.9, 0, 1) : phase === 'hold' || phase === 'rest' ? 0 : 1;
        const cl = Math.max(-L / 2, trig - ck * L), cr = Math.min(L / 2, trig + ck * L);
        crack.visible = ck > 0 && phase !== 'rest'; crack.scale.x = Math.max(0.01, cr - cl); crack.position.set((cl + cr) / 2, YW + WK / 2, 0);
        weakM.color.setHex(s.strength < 0.7 ? 0xff5a3a : s.strength < 1.6 ? 0xffa25a : 0xc9d68a);
        const drop = phase === 'whumpf' || (phase === 'slide') ? 0.05 : 0;
        blocks.forEach((b, i) => {
          const x = -L / 2 + (i + 0.5) * (L / NB), crown = i === NB - 1, mv = phase === 'slide' && !crown ? slide * (1 + 0.05 * (NB - i)) : 0;
          b.scale.y = tv; b.position.set(x - mv, ys + tv / 2 - drop + (mv > 0 ? 0.04 * Math.sin(mv * 3 + i) : 0), 0); b.rotation.z = mv > 0 ? 0.08 * Math.sin(mv * 2 + i * 1.7) : 0;
          b.visible = phase !== 'rest' ? x - mv > -L / 2 - 2.5 : crown;
        });
        const sx = 1.2 - (phase === 'slide' ? slide * 1.2 : 0);
        skier.visible = s.skier && phase !== 'rest' && sx > -L / 2 - 2; skier.position.set(sx, ys + tv - drop, 0.4); skier.rotation.z = -a;
        // Arrows, 1.5 units for each kilopascal.
        const K = 1.5 / 1000, ax = -1.4, live = phase === 'hold' || phase === 'crack';
        aW.visible = aT.visible = aS.visible = live; lPull.visible = lHold.visible = live && !narrow;
        aW.position.set(ax, ys + tv / 2, ZD / 2 + 0.1); point(aW, -Math.sin(a), -Math.cos(a), 0); aW.set(C.mass * G * K);
        aT.position.set(ax, ys + tv / 2, ZD / 2 + 0.1); point(aT, -1, 0, 0); aT.set((C.tau + C.sk) * K);
        aS.position.set(ax + 0.6, YW + WK / 2, ZD / 2 + 0.1); point(aS, 1, 0, 0); aS.set(C.str * K);
        lSlab.position.set(2.6, ys + tv + 0.5, ZD / 2); lWeak.position.set(3.4, YW - 0.45, ZD / 2 + 0.1);
        lPull.position.set(ax - (C.tau + C.sk) * K - 0.2, ys + tv + 0.75, ZD / 2); lHold.position.set(ax + 0.6 + C.str * K + 0.2, YW - 0.75, ZD / 2 + 0.1);
        lSlab.element.textContent = `Slab · ${Math.round(C.depth * 100)} cm`;
        lState.position.set(4.4, 0.7, 2.2);
        lState.element.innerHTML = phase === 'crack' ? '<b>A crack races through the weak layer</b>' : phase === 'slide' ? '<b>The slab breaks into blocks and slides</b>' : phase === 'whumpf' ? '<b>Whumpf.</b> The weak layer collapses, but it is too flat to slide' : phase === 'rest' ? 'The bed surface is swept clean. Only the crown is left' : C.fails ? (C.natural ? 'The pull is more than the layer can hold' : 'The skier’s weight tips the balance') : s.angle > 45 && C.keep < 1 ? `Holding. Only ${Math.round(C.keep * 100)}% of new snow stays on a slope this steep` : `Holding · index ${Math.min(C.S, C.Sk).toFixed(2)}`;
        lState.element.className = 'lbl' + (C.fails || phase !== 'hold' ? ' hot' : '');
      },
      dispose() { stage.floor.visible = true; stage.setShift(0, 0); },
      readout: (s) => {
        const c = calc(s), idx = Math.min(c.S, c.Sk), cls = idx < 1 ? 'no' : idx < 1.5 ? '' : 'ok';
        return compact(`<div class="big ${cls}">Stability index ${idx.toFixed(2)}</div>
          <div class="row"><span>Pull along the slope${s.skier ? ' (with skier)' : ''}</span><b>${fmtN(Math.round(c.tau + c.sk))} Pa</b></div>
          <div class="row"><span>Weak layer can hold</span><b>${fmtN(Math.round(c.str))} Pa</b></div>
          <div class="row"><span>Slab on each m² of slope</span><b>${fmtN(Math.round(c.mass))} kg, ${Math.round(c.depth * 100)} cm deep</b></div>
          ${s.skier ? `<div class="row"><span>Skier adds at the weak layer</span><b>${fmtN(Math.round(c.sk))} Pa</b></div>` : ''}
          ${s.angle > 45 ? `<div class="row"><span>New snow that stays on</span><b>${Math.round(c.keep * 100)}%</b></div>` : ''}
          <small class="${cls}">${idx < 1 ? (c.steep ? 'It releases. The crack would cross this 40 m slope in a second or two.' : 'The layer fails, but below about 30° the crushed layer’s friction holds the slab. A whumpf, and no slide.') : idx < 1.5 ? 'Only just holding. A small extra load could release it.' : !c.steep ? 'Holding, and too flat to slide in any case.' : 'Holding with room to spare.'} Index = strength ÷ pull. The slab is 30 cm of wind slab plus the new snow.</small>`);
      },
    };
  },
};
