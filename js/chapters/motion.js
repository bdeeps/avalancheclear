// Chapter 5: in motion. The avalanche path in profile (38° start zone, 27° track, 4° runout; about
// 700 m of fall over 2 km) with a flow whose speed comes from Voellmy's model, solved step by step:
//   dv/dt = g (sin θ − μ cos θ) − g v² ÷ (ξ h)        (Voellmy 1955; parameters in snow.js)
// Loose snow: μ 0.30, ξ 1,000 m/s², flow density 150 kg/m³. Dry slab: μ 0.20, ξ 1,500, 300 kg/m³.
// Wet snow: μ 0.35, ξ 600, 450 kg/m³. These sit in the ranges used with the Swiss guidelines.
// Check against observations (McClung & Schaerer 2006): large dry avalanches 50–200 km/h, wet ones
// 20–100 km/h; a dry slab can reach about 100–130 km/h within seconds of release. Powder avalanches
// have been measured well above 200 km/h; "about 300 km/h" is quoted for the largest (e.g. Galtür
// 1999, about 290 km/h by reconstruction), so treat the top figures as estimates.
// Impact pressure of the dense flow p ≈ ρ v²; what a pressure can do is from the same handbook:
// 1 kPa breaks windows, 5 pushes in doors, 30 destroys wood-frame buildings, 100 uproots mature
// trees, 1,000 moves reinforced concrete.
// Survival against burial time: Falk, Brugger & Adler-Kastner 1994 (Nature 368:21), Swiss data:
// 92% at 15 min, 30% at 35 min, 27% at 90 min, 3% at 130 min. Rauch et al. 2024 (JAMA Network Open):
// 91% within 10 min, 31% for 10–30 min; average rescue time fell from 45 to 25 minutes.
// One scene unit is 170 m. The run is shown four times faster than life.
import { THREE, M, box, clamp, COL, fmtN, compact, fitNarrow, board, panelBg, placeBoard, mountain, tree, hut, KINDS, runAvalanche, impactKPa, damage, survival, SURVIVAL, pathY, inReel } from '../snow.js';
import { swarm } from '../kit.js';

const NP = 150, NC = 14, SPEED = 4, X_REL = 150;

export default {
  id: 'motion',
  short: 'In motion',
  title: 'In motion',
  subtitle: 'Loose, slab or wet: how fast an avalanche runs, how hard it hits, and why the first fifteen minutes decide who lives.',
  view: { pos: [0.2, 6.2, 13.4], target: [0.2, 5.0, 0] },
  learn: `<p>Avalanches come in three main kinds. A <b>loose-snow avalanche</b> starts at one point and fans out as it picks up snow, like sand running down a dune. A <b>slab avalanche</b> breaks away as a whole plate with a sharp wall at the top, and it is the one that kills most people. A <b>wet-snow avalanche</b> happens when rain or thaw soaks the snowpack: it moves more slowly, but it is as dense as wet concrete and sets hard the moment it stops.</p>
    <p><b>Speed.</b> Gravity pulls the snow down the path and two things hold it back: friction on the ground, and drag that grows with the square of the speed. A dry slab avalanche can pass <b>100 km/h</b> within seconds. A big one throws fine snow into the air and becomes a <b>powder cloud</b>, a storm of snow dust that races ahead of the dense flow. Large powder avalanches have been measured at well over 200 km/h, and the largest are put near 300.</p>
    <p><b>Force.</b> The push on anything in the way grows with the density and the <b>square of the speed</b>. Double the speed and the force is four times as big. A pressure of 30 kilopascals is enough to destroy a timber house. Large avalanches reach hundreds.</p>
    <p><b>Burial.</b> The snow stops and locks solid around you. You cannot dig yourself out. The danger is running out of air. Swiss records show that about <b>nine in ten</b> completely buried people survive if they are dug out within the first <b>10 to 15 minutes</b>. By 35 minutes it is about three in ten. Organised rescue usually takes longer than that to arrive. So the people most likely to save you are the ones already standing beside you.</p>
    <p><b>Rescue kit.</b> A <b>transceiver</b> is a small radio worn on the body. Everyone sets it to send, and the searchers switch to receive and follow the signal. A <b>probe</b>, a folding rod about 2.4 to 3 m long, pins down the exact spot. A <b>shovel</b> does the slow part: the digging. An <b>airbag</b> rucksack inflates and helps keep its wearer near the surface, because in a flow of mixed lumps the big ones rise. None of it helps anyone travelling alone.</p>
    <p class="tip"><b>Try it:</b> release a deep dry slab and watch which buildings it reaches. Then try a wet one of the same depth. Slide the burial time from 10 minutes to 40 and read the chart.</p>`,
  terms: [
    { t: 'Loose-snow avalanche', d: 'Starts at a point in snow with little cohesion and fans out downhill.' },
    { t: 'Slab avalanche', d: 'A cohesive plate of snow that breaks away all at once along a weak layer.' },
    { t: 'Powder cloud', d: 'Fine snow thrown into the air by a fast dry avalanche. It travels ahead of the dense flow.' },
    { t: 'Impact pressure', d: 'The push of the moving snow on an obstacle: about density × speed squared.' },
    { t: 'Transceiver', d: 'A body-worn radio beacon on 457 kHz that lets companions find a buried person.' },
    { t: 'Runout distance', d: 'How far the avalanche travels before it stops.' },
  ],
  defaults: { kind: 'slab', h: 1.5, buried: 15 },
  controls: [
    { key: 'kind', type: 'seg', label: 'Kind of avalanche', options: [{ v: 'loose', label: 'Loose snow' }, { v: 'slab', label: 'Dry slab' }, { v: 'wet', label: 'Wet snow' }], fmt: (v) => KINDS[v].note },
    { key: 'h', type: 'range', label: 'Depth of the flowing snow', min: 0.3, max: 3, step: 0.1, fmt: (v) => `${v.toFixed(1)} m`, hint: 'A deeper flow loses less of its speed to drag, so it runs faster and farther.' },
    { key: 'buried', type: 'range', label: 'Time buried before being dug out', min: 0, max: 180, step: 5, fmt: (v) => `${v} min` },
    { type: 'buttons', label: 'Slope', items: [{ label: 'Release it', act: (s, inst) => inst.seek?.(0) }] },
  ],
  quiz: [
    { q: 'Which kind of avalanche breaks away as a whole plate?', options: ['Loose-snow avalanche', 'Slab avalanche', 'Sluff', 'Cornice fall'], answer: 1, why: 'A slab releases along a weak layer and leaves a sharp crown wall. It causes most avalanche deaths.' },
    { q: 'An avalanche doubles its speed. What happens to its impact pressure?', options: ['It stays the same', 'It doubles', 'It becomes four times as big', 'It halves'], answer: 2, why: 'Impact pressure goes with the square of the speed: 2 × 2 = 4.' },
    { q: 'Why are companions so important in avalanche rescue?', options: ['They carry more food', 'Survival falls steeply after about 10 to 15 minutes, before organised rescue can usually arrive', 'They can outrun the avalanche', 'Helicopters cannot fly in snow'], answer: 1, why: 'About nine in ten survive if dug out in the first 10 to 15 minutes, about three in ten by 35 minutes.' },
  ],
  reel: [
    { ms: 6000, caption: 'A dry slab avalanche can pass 100 km/h within seconds. Big powder avalanches go far faster.', set: { kind: 'slab', h: 2.2, buried: 15 }, act: (s, inst) => inst.seek?.(0), view: { pos: [0.2, 4.2, 12], target: [0.2, 3.2, 0] }, spin: 0 },
    { ms: 6500, caption: 'Nine in ten buried people survive if dug out within about 15 minutes. After that the odds fall fast.', set: { kind: 'slab', h: 2.2 }, anim: { buried: [0, 60] }, act: (s, inst) => inst.seek?.(30), view: { pos: [0.2, 4.2, 12], target: [0.2, 3.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const mt = mountain({ s: 1 / 170, x0: 6.3, y0: 0.5, z0: -1.7, z1: 1.7 }); root.add(mt.g);
    const at = (X, up = 0, z = 0) => { const [x, y] = mt.P(X, up); return [x, y + mt.th(X), z]; };
    [[700, -1.45], [820, 1.45], [950, -1.5], [1080, 1.5], [1250, -1.45], [1400, 1.5], [1650, -1.5], [1900, 1.45], [2100, -1.2]].forEach(([X, z], i) => { const t = tree(0.6 + 0.15 * (i % 3)); t.position.set(...at(X, 0, z)); root.add(t); });
    const HUTS = [1380, 1680, 2020], huts = HUTS.map((X, i) => { const h = hut(0.75, [0xb98a5a, 0x9aa7b8, 0xc9a070][i]); h.position.set(...at(X, 0, [0.5, -0.4, 0.3][i])); root.add(h); return h; });
    const crown = box(160 / 170, 0.22, 2.6, M.matte(0xffffff)); { const p = at(180, 0.1); crown.position.set(...p); crown.rotation.z = 38 * Math.PI / 180; root.add(crown); }
    const snowM = M.matte(0xffffff), bits = swarm(NP, new THREE.BoxGeometry(0.11, 0.09, 0.11), snowM); root.add(bits);
    const cloud = swarm(NC, new THREE.SphereGeometry(0.5, 12, 8), M.ghost(0xffffff, 0.3)); cloud.castShadow = false; root.add(cloud);
    const jit = Array.from({ length: NP }, (_, i) => [((i * 0.618) % 1) - 0.5, ((i * 0.377) % 1), ((i * 0.853) % 1) - 0.5, (i * 2.4) % 6.28]);
    const lFront = stage.label('', [0, 0, 0], root, 'hot');
    const minor = [stage.label('Start zone', at(120, 1.0, 1.7), root), stage.label('Track', at(760, 0.8, 1.7), root), stage.label('Runout zone', at(1900, 0.7, 1.7), root)];

    let run = null, key = '', ta = 0, vNow = 0, P = { buried: 15 };
    const brd = board(root, 6.2, 3.4, 500, 274, (g, w, h) => {
      panelBg(g, w, h);
      g.fillStyle = COL.ink; g.font = 'bold 23px sans-serif'; g.fillText('Chance of surviving a full burial', 14, 28);
      const x0 = 52, x1 = w - 16, y0 = h - 44, y1 = 46, X = (m) => x0 + (m / 180) * (x1 - x0), Y = (p) => y0 - (p / 100) * (y0 - y1);
      g.fillStyle = 'rgba(163,230,53,.14)'; g.fillRect(X(0), y1, X(15) - X(0), y0 - y1);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
      g.strokeStyle = COL.ice; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); SURVIVAL.forEach(([m, p], i) => (i ? g.lineTo(X(m), Y(p)) : g.moveTo(X(m), Y(p)))); g.stroke();
      g.fillStyle = COL.soft; g.font = '15px sans-serif'; [0, 15, 35, 60, 90, 130, 180].forEach((m) => g.fillText(`${m}`, X(m) - 8, y0 + 18)); g.fillText('minutes buried', x1 - 100, y0 + 36);
      [0, 50, 100].forEach((p) => g.fillText(`${p}%`, 6, Y(p) + 5));
      g.fillStyle = COL.ok; g.fillStyle = COL.soft; g.fillText('air runs out', X(26), Y(62)); g.fillText('only those with an air pocket', X(42), Y(13));
      const sv = survival(P.buried); g.fillStyle = sv > 60 ? COL.ok : sv > 20 ? COL.warn : COL.bad; g.beginPath(); g.arc(X(P.buried), Y(sv), 9, 0, 7); g.fill();
      g.font = 'bold 22px sans-serif'; g.fillText(`${Math.round(sv)}% at ${P.buried} min`, clamp(X(P.buried) + 14, x0, x1 - 170), clamp(Y(sv) - 10, y1 + 20, y0 - 8));
      g.fillStyle = COL.soft; g.font = '13px sans-serif'; g.fillText('Swiss data: Falk, Brugger & Adler-Kastner, Nature, 1994', 6, h - 5);
    }, [0, 0, 0]);

    return {
      seek(t) { ta = t; },
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, minor);
        placeBoard(brd, [[-3.0, 3.9, 1.9], 0, 0.92], [[0.2, 8.8, 0], 0, 1.7]); brd.mesh.visible = !narrow || inReel();
        const k2 = `${s.kind}|${s.h}`; if (k2 !== key) { key = k2; run = runAvalanche(s.kind, s.h); ta = 0; }
        P = { buried: Math.round(s.buried) }; brd.redraw();
        const K = KINDS[s.kind], total = run.T / SPEED + 4.5; ta = (ta + dt) % total;
        const wait = 1.0, ts = clamp((ta - wait) * SPEED, 0, run.T), cur = run.at(ts), moving = ta > wait, done = ts >= run.T;
        vNow = moving && !done ? cur.v : 0;
        crown.visible = !moving;
        const Lf = (110 + 70 * s.h) * (s.kind === 'loose' ? 0.6 : 1), spread = clamp(ts / 6, 0.25, 1), hh = 0.05 + 0.1 * s.h;
        snowM.color.setHex(s.kind === 'wet' ? 0xc9d3dd : 0xffffff);
        for (let i = 0; i < NP; i++) {
          const j = jit[i], X = clamp(cur.x + j[0] * Lf * spread, X_REL - 60, 2190), zw = s.kind === 'loose' ? clamp((X - 100) / 500, 0.15, 1) : 1;
          bits.place(i, at(X, 0.04 + j[1] * hh, j[2] * 2.5 * zw), [j[3] + (moving && !done ? ts * 2 : 0), j[3], 0], moving ? 0.7 + j[1] * (0.6 + 0.3 * s.h) : 0);
        } bits.done();
        const puff = K.powder ? clamp((cur.v - 14) / 16, 0, 1) * (moving && !done ? 1 : Math.max(0, 1 - (ta - wait - run.T / SPEED) / 1.5)) : 0;
        for (let i = 0; i < NC; i++) { const j = jit[i * 7], X = cur.x + Lf * 0.5 - i * 26 + (done ? 0 : 20 * Math.sin(ta * 5 + i)); cloud.place(i, at(Math.min(X, 2190), 0.35 + j[1] * 0.5 + 0.25 * puff, j[2] * 2.2), null, puff * (0.55 + j[1] * 0.9) * (0.7 + 0.25 * s.h)); } cloud.done(); cloud.visible = puff > 0.01;
        huts.forEach((h, i) => { const hit = moving && cur.x + Lf * 0.4 * spread > HUTS[i] && run.stop + Lf * 0.3 > HUTS[i]; h.rotation.z = hit ? 0.5 : 0; h.position.y = at(HUTS[i])[1] - (hit ? 0.08 : 0); });
        const lp = at(Math.min(cur.x + 60, 2150), 1.15, 1.7); lFront.position.set(...lp); lFront.visible = moving;
        lFront.element.innerHTML = done ? `Stopped after <b>${fmtN(Math.round((run.stop - X_REL) / 10) * 10)} m</b>. It sets hard at once` : `<b>${Math.round(cur.v * 3.6)} km/h</b>`;
      },
      readout: (s) => {
        if (!run) return '';
        const K = KINDS[s.kind], p = impactKPa(K.rho, run.vmax), sv = survival(s.buried), bm = Math.round(s.buried), drop = pathY(X_REL) - pathY(run.stop);
        return compact(`<div class="big">${K.name}: top speed ${Math.round(run.vmax * 3.6)} km/h</div>
          <div class="row"><span>Speed right now</span><b>${Math.round(vNow * 3.6)} km/h</b></div>
          <div class="row"><span>Impact pressure at top speed</span><b>${fmtN(Math.round(p))} kPa</b></div>
          <div class="row"><span>Enough to</span><b>${damage(p).toLowerCase()}</b></div>
          <div class="row"><span>Runs</span><b>${fmtN(Math.round((run.stop - X_REL) / 10) * 10)} m, falling ${fmtN(Math.round(drop / 10) * 10)} m, in ${Math.round(run.T)} s</b></div>
          <div class="row"><span>Dug out after ${bm} min</span><b class="${sv > 60 ? 'ok' : 'no'}">about ${Math.round(sv)}% survive</b></div>
          <small>${K.note}${K.powder && run.vmax > 25 ? ' The powder cloud runs ahead of the dense flow and can be faster still.' : ''} Shown ${SPEED} times faster than life. Flow density ${K.rho} kg/m³.</small>`);
      },
    };
  },
};
