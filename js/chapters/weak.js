// Chapter 2: the weak layer. A slice of snowpack between the ground (held near 0 °C by the Earth's
// heat and the snow's insulation) and the cold surface. Temperature gradient = (0 − surface) ÷ depth.
// Rule of thumb used by every avalanche school: above about 10 °C per metre (1 °C per 10 cm), water
// vapour moves fast from warm grains to cold ones and builds angular, cup-shaped crystals (facets,
// then depth hoar) that bond poorly; below it, grains round off and sinter together
// (Akitaya 1974; Colbeck 1983; McClung & Schaerer, The Avalanche Handbook, 2006).
// Vapour pressure over ice from the Magnus formula (snow.js): 611 Pa at 0 °C, 103 Pa at −20 °C.
// The speed of the change is an illustration: growth rate ∝ (gradient − 10) × the local vapour
// pressure (warm snow near the ground changes fastest, which is where depth hoar is found), tuned
// so that a strong gradient makes obvious facets in a few days to two weeks, as observed.
// Surface hoar: frost that grows on the snow surface on clear, calm, humid nights, when the surface
// radiates heat to the sky and becomes colder than the air (the solid cousin of dew).
// Crusts: a wet or sun-melted surface refreezes into ice; facets often grow just above or below it.
import { THREE, M, box, clamp, HEX, COL, fmtN, compact, fitNarrow, board, panelBg, placeBoard, TG_CRIT, esatIce, inReel, A } from '../snow.js';
import { swarm } from '../kit.js';

const COLS = 10, ROWS = 9, CX = 2.9, W = 3.8, Y0 = 1.0, DAYS = 21;
const KIND = {
  facets: { name: 'Facets and depth hoar', tip: 'A thin snowpack in deep cold: the classic early-winter trap.' },
  hoar: { name: 'Surface hoar', tip: 'Frost feathers grow on clear nights, then the next storm buries them.' },
  crust: { name: 'A crust', tip: 'Rain or sun wets the surface, it freezes hard, and facets grow beside it.' },
};

export default {
  id: 'weak',
  short: 'The weak layer',
  title: 'The weak layer',
  subtitle: 'Snow keeps changing after it lands. In the wrong conditions its grains turn into loose sugar, or a layer of frost gets buried.',
  view: { pos: [0, 5.0, 10.4], target: [0, 4.2, 0] },
  learn: `<p>Snow on the ground is never finished. Its grains keep changing shape for the whole winter, and <b>temperature</b> decides which way they go.</p>
    <p>The ground under a snowpack stays close to <b>0 °C</b>, because snow is a good blanket. The surface is as cold as the air. So there is a <b>temperature gradient</b> through the snow: the difference between bottom and top, divided by the depth. A thin snowpack in bitter cold has a steep gradient. A deep one in mild weather has a gentle one.</p>
    <p>With a <b>gentle gradient</b>, grains slowly round off and grow necks of ice where they touch. The snow settles and gets stronger. With a <b>steep gradient</b>, more than about 1 °C for every 10 cm, water vapour streams up from the warm grains and freezes onto the colder ones above. The grains grow flat faces and sharp corners: <b>facets</b>. Given time they become large hollow cups called <b>depth hoar</b>. They look and pour like sugar, and they hardly bond at all.</p>
    <p>Two other weak layers start at the surface. <b>Surface hoar</b> is frost that grows as feathers on clear, calm, cold nights, beautiful and fragile. A <b>crust</b> forms when rain or strong sun wets the surface and it freezes into a hard, slick sheet. Neither is a problem until the next snowfall buries it. Then it is hidden, and it can stay weak for weeks.</p>
    <p>The Himalaya and Karakoram get exactly these conditions: thin early snow, very cold clear nights and strong sun. How a snow crystal forms in a cloud is in ${A('freezeclear', 'FreezeClear')}.</p>
    <p class="tip"><b>Try it:</b> set a shallow snowpack and a very cold night and watch the bottom turn to sugar. Then make the snow deep and the air mild, and watch the grains round off and heal.</p>`,
  terms: [
    { t: 'Temperature gradient', d: 'How fast the temperature changes through the snow: degrees per metre of depth.' },
    { t: 'Rounding', d: 'Under a gentle gradient, grains become round and bond together. The snow gains strength.' },
    { t: 'Facets', d: 'Angular grains with flat faces that grow under a steep gradient. They bond poorly.' },
    { t: 'Depth hoar', d: 'Large, cup-shaped faceted grains near the ground. The sugary base of a thin, cold snowpack.' },
    { t: 'Surface hoar', d: 'Feathery frost that grows on the snow surface on clear, calm nights. Weak once buried.' },
    { t: 'Crust', d: 'A hard, icy layer made when a wet surface refreezes.' },
  ],
  defaults: { kind: 'facets', air: -22, depth: 50 },
  controls: [
    { key: 'kind', type: 'seg', label: 'Which weak layer', options: [{ v: 'facets', label: 'Facets and depth hoar' }, { v: 'hoar', label: 'Surface hoar' }, { v: 'crust', label: 'Crust' }], fmt: (v) => KIND[v].tip },
    { key: 'air', type: 'range', label: 'Temperature at the snow surface', min: -30, max: -1, step: 1, fmt: (v) => `${v} °C` },
    { key: 'depth', type: 'range', label: 'Depth of the snowpack', min: 30, max: 300, step: 10, fmt: (v) => `${v} cm`, hint: 'The ground stays near 0 °C. Thin snow in deep cold gives the steepest gradient.' },
    { type: 'buttons', label: 'Time', items: [{ label: 'Start again with fresh snow', act: (s, inst) => inst.seek?.(0) }] },
  ],
  quiz: [
    { q: 'A snowpack is 50 cm deep. The ground is at 0 °C and the surface at −20 °C. What is the temperature gradient?', options: ['4 °C per metre', '10 °C per metre', '40 °C per metre', '100 °C per metre'], answer: 2, why: '20 °C across 0.5 m is 40 °C per metre, four times the rough threshold of 10. Facets will grow.' },
    { q: 'Why is depth hoar dangerous?', options: ['It is very heavy', 'Its large, angular grains hardly bond, so it is a weak base for everything above', 'It melts easily', 'It is slippery ice'], answer: 1, why: 'Faceted grains touch at few points and do not sinter well. The layer behaves like loose sugar.' },
    { q: 'When does surface hoar become a hazard?', options: ['While it is growing on a clear night', 'When the sun shines on it', 'After new snow buries it', 'Never'], answer: 2, why: 'On the surface it is only frost. Buried under a slab it becomes a thin, persistent weak layer.' },
  ],
  reel: [
    { ms: 6000, caption: 'Thin snow on a bitterly cold night: vapour rises through it and turns round grains into loose sugar.', set: { kind: 'facets', air: -24, depth: 50 }, act: (s, inst) => inst.seek?.(0), view: { pos: [2.9, 4.6, 7], target: [2.9, 4.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const ground = box(W + 0.5, 0.45, 1.7, M.matte(HEX.ground)); ground.position.set(CX, Y0 - 0.225, 0); root.add(ground);
    const snow = box(W, 1, 1.5, M.clear(0xdcecff, 0.2)); root.add(snow);
    const round = swarm(COLS * ROWS, new THREE.SphereGeometry(0.1, 12, 8), M.matte(0xffffff)); root.add(round);
    const facet = swarm(COLS * ROWS, new THREE.CylinderGeometry(0.15, 0.08, 0.17, 6), M.plastic(HEX.hoar, { flatShading: true })); root.add(facet);
    const f = new Float32Array(COLS * ROWS);
    const jit = Array.from({ length: COLS * ROWS }, (_, i) => [((i * 0.618) % 1) - 0.5, ((i * 0.377) % 1) - 0.5, ((i * 0.853) % 1) - 0.5, (i * 2.4) % 6.28]);
    const vap = swarm(46, new THREE.SphereGeometry(0.035, 6, 4), M.glow(HEX.ice)); root.add(vap);
    const blades = swarm(48, new THREE.ConeGeometry(0.07, 0.5, 4), M.plastic(0xdff6ff, { flatShading: true })); root.add(blades);
    const crust = box(W, 0.07, 1.5, M.plastic(HEX.crust)); root.add(crust);
    const fresh = box(W, 1, 1.5, M.matte(0xffffff, { transparent: true, opacity: 0.92 })); root.add(fresh);
    const nearC = swarm(22, new THREE.CylinderGeometry(0.12, 0.06, 0.13, 6), M.plastic(HEX.hoar, { flatShading: true })); root.add(nearC);
    const lTop = stage.label('', [0, 0, 0], root), lGround = stage.label('Ground · about 0 °C', [CX, Y0 - 0.75, 0.9], root), lState = stage.label('', [0, 0, 0], root, 'hot');

    let day = 0, hold = 0, tg = 0, share = 0, H = 1, P = { air: -22, depth: 50 };
    const brd = board(root, 4.6, 3.3, 506, 363, (g, w, h) => {
      panelBg(g, w, h);
      g.fillStyle = COL.ink; g.font = 'bold 25px sans-serif'; g.fillText('Temperature through the snow', 16, 34);
      g.font = '19px sans-serif'; g.fillStyle = tg > TG_CRIT ? COL.weak : COL.ok; g.fillText(`${fmtN(tg)} °C per metre: ${tg > TG_CRIT ? 'facets grow' : 'grains round off'}`, 16, 62);
      const x0 = 78, x1 = w - 26, y0 = h - 44, y1 = 104, X = (T) => x1 + (T / 30) * (x1 - x0), Y = (z) => y0 - (z / (P.depth / 100)) * (y0 - y1);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
      g.fillStyle = COL.soft; g.font = '17px sans-serif';
      [-30, -20, -10, 0].forEach((T) => g.fillText(`${T}°`, X(T) - 14, y0 + 24)); g.fillText('ground', 6, y0 + 4); g.fillText('surface', 4, y1 + 6);
      // The 10 °C per metre line from the ground.
      g.setLineDash([8, 7]); g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(Math.max(-30, -TG_CRIT * (P.depth / 100))), Y(Math.min(P.depth / 100, 3))); g.stroke(); g.setLineDash([]);
      g.strokeStyle = tg > TG_CRIT ? COL.weak : COL.ok; g.lineWidth = 5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(P.air), Y(P.depth / 100)); g.stroke();
      g.fillStyle = COL.soft; g.fillText('dashed: 10 °C per metre', x0 + 10, y1 - 14);
    }, [-3.2, 2.4, 0.6]);

    return {
      seek(d) { day = d; hold = 0; f.fill(0); },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lGround]);
        placeBoard(brd, [[-2.9, 2.5, 0.6], 0, 1], [[2.9, 7.6, 0], 0, 1.1]); brd.mesh.visible = !narrow || inReel();
        P = { air: s.air, depth: s.depth }; tg = -s.air / (s.depth / 100); H = s.depth / 60;
        if (day >= DAYS) { hold += dt; if (hold > 3) { day = 0; hold = 0; f.fill(0); } } else day = Math.min(DAYS, day + dt * 0.9);
        const dd = day >= DAYS ? 0 : dt * 0.9, rows = clamp(Math.round(H / 0.42), 1, ROWS), top = Y0 + H;
        snow.scale.y = H; snow.position.set(CX, Y0 + H / 2, 0);
        let sum = 0, cnt = 0;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c, on = r < rows, fy = (r + 0.5) / rows, T = s.air * fy, warm = esatIce(T) / 611.2;
          f[i] = clamp(f[i] + dd * (tg > TG_CRIT ? 0.12 * ((tg - TG_CRIT) / 10) * warm : -0.05 * (1 - tg / TG_CRIT) * warm), 0, 1);
          if (on) { sum += f[i]; cnt++; }
          const j = jit[i], p = [CX - W / 2 + ((c + 0.5) / COLS) * W + j[0] * 0.16, Y0 + fy * H + j[1] * 0.1, j[2] * 1.1];
          round.place(i, p, null, on ? (1 - f[i]) * (0.9 + 0.3 * (1 - warm)) : 0);
          facet.place(i, p, [j[3] * 0.2, j[3], j[0]], on ? f[i] * (0.75 + 0.7 * f[i]) : 0);
        }
        round.done(); facet.done(); share = cnt ? sum / cnt : 0; brd.redraw();
        // Vapour: rises from warm to cold, faster with a bigger vapour-pressure drop per metre.
        const drive = clamp((611.2 - esatIce(s.air)) / (s.depth / 100) / 1300, 0.04, 1);
        for (let i = 0; i < 46; i++) { const u = ((i * 0.618) % 1), ph = (time * (0.08 + 0.5 * drive) + ((i * 0.37) % 1)) % 1; vap.place(i, [CX - W / 2 + u * W, Y0 + ph * H, 0.8], null, 0.6 + drive); } vap.done();
        // Surface overlays.
        const k = s.kind, grow = k === 'hoar' ? clamp(day / 5, 0, 1) : 0, bury = clamp((day - (k === 'hoar' ? 6 : 7)) / 3, 0, 1) * (k === 'facets' ? 0 : 1);
        for (let i = 0; i < 48; i++) { const u = (i % 12) / 12, z = Math.floor(i / 12) / 4; blades.place(i, [CX - W / 2 + 0.2 + u * W, top + 0.22 * grow, -0.55 + z * 1.2 + jit[i][0] * 0.2], [jit[i][0] * 0.5, jit[i][3], jit[i][1] * 0.5], grow * (0.7 + 0.5 * Math.abs(jit[i][1]))); } blades.done(); blades.visible = k === 'hoar';
        const wet = k === 'crust' ? clamp(day / 2.5, 0, 1) : 0, frozen = k === 'crust' ? clamp((day - 3) / 2, 0, 1) : 0;
        crust.visible = k === 'crust'; crust.position.set(CX, top + 0.035, 0); crust.material.color.setHex(frozen > 0.5 ? HEX.crust : 0x8fa6b8); crust.material.roughness = 0.45 - 0.35 * frozen; crust.scale.y = 0.4 + wet;
        const gap = k === 'hoar' ? 0.42 * (1 - 0.35 * bury) : 0.1;
        fresh.visible = bury > 0.01; fresh.scale.y = Math.max(0.01, 0.8 * bury); fresh.position.set(CX, top + gap + 0.4 * bury, 0);
        const nf = k === 'crust' ? clamp((day - 11) / 7, 0, 1) : 0;
        for (let i = 0; i < 22; i++) nearC.place(i, [CX - W / 2 + 0.15 + ((i % 11) / 11) * W, top + (i < 11 ? -0.12 : 0.2), 0.45], [0, jit[i][3], 0], nf); nearC.done(); nearC.visible = nf > 0;
        lTop.position.set(CX, top + (fresh.visible ? gap + 0.8 * bury : k === 'hoar' ? 0.5 : 0.1) + 0.5, 0.9); lTop.element.textContent = `Surface · ${s.air} °C`;
        lState.position.set(CX, top + (fresh.visible ? gap + 0.8 * bury : k === 'hoar' ? 0.5 : 0.1) + 1.15, 0.9);
        lState.element.innerHTML = k === 'hoar' ? (bury > 0 ? '<b>Buried surface hoar</b>: a hidden weak layer' : `Clear, calm night ${Math.min(5, Math.floor(day) + 1)}: frost feathers grow`)
          : k === 'crust' ? (nf > 0 ? '<b>Crust</b> with facets growing beside it' : bury > 0 ? 'New snow buries the crust' : frozen > 0 ? 'It freezes into a hard crust' : 'Rain or strong sun wets the surface')
            : tg > TG_CRIT ? `Day ${Math.floor(day)} · vapour rises, <b>facets grow</b>` : `Day ${Math.floor(day)} · grains round off and bond`;
        lState.element.className = 'lbl' + ((k === 'facets' ? tg > TG_CRIT : bury > 0 || nf > 0) ? ' hot' : '');
      },
      readout: (s) => compact(`<div class="big ${tg > TG_CRIT ? 'no' : 'ok'}">${fmtN(tg)} °C per metre</div>
          <div class="row"><span>Regime</span><b>${tg > TG_CRIT ? 'steep: facets grow' : 'gentle: grains round and bond'}</b></div>
          <div class="row"><span>Sugary (faceted) grains</span><b>${Math.round(share * 100)}% after ${Math.floor(day)} days</b></div>
          <div class="row"><span>Ground and surface</span><b>0 °C and ${s.air} °C</b></div>
          <div class="row"><span>Vapour pressure, bottom and top</span><b>611 and ${fmtN(esatIce(s.air))} Pa</b></div>
          <small>${s.kind === 'hoar' ? 'Surface hoar needs a clear sky, still air and some moisture. It is harmless until snow buries it, and then it can last for weeks.' : s.kind === 'crust' ? 'A crust is strong itself, but it is a smooth sliding surface, and the snow next to it often turns to facets.' : tg > TG_CRIT ? 'Vapour moves from the warm bottom to the cold top and builds angular grains. The warm snow near the ground changes fastest: depth hoar.' : 'Below about 10 °C per metre the grains round off and weld together. The layer slowly gains strength.'} The pace here is an illustration.</small>`),
    };
  },
};
