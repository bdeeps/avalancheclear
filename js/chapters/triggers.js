// Chapter 4: triggers. A ridge with a gentle windward side (left) and a 38° lee slope (right) that
// carries a slab on a weak layer. Each trigger either adds load or takes away strength:
//   pull τ = m·g·sin 38°, index = strength ÷ (τ + any extra stress), release below 1 (see snow.js).
// Starting point: 50 cm of slab at 200 kg/m³ (100 kg on each m²), weak-layer strength 1.0 kPa.
// Heavy snowfall: +40 cm of new snow at 100 kg/m³ = +40 kg/m².
// Wind: moves snow from the windward side to the lee side. Avalanche centres teach that wind can
//   load a lee slope several times faster than snow falls, "up to ten times" (Utah Avalanche Center;
//   Avalanche Handbook). Here: the lee slope gets 3 times the snowfall, plus 30 kg/m² scoured from
//   the windward side, and a cornice grows on the crest.
// Rapid warming or rain: meltwater weakens the bonds (strength × 0.7 here, an illustration) and
//   10 mm of rain adds 10 kg/m².
// A skier (or a soldier on patrol): +155 ÷ depth Pa at the weak layer (Föhn 1987).
// An explosive charge: a short shock over a wide area, modelled as +350 Pa (an illustration). On a
//   stable slope it brings nothing down, which is itself useful to know: that is control blasting.
// "About 90%": in over 90% of cases the slab that buries winter-sports people was triggered by the
//   victims or someone in their group (WSL Institute for Snow and Avalanche Research SLF;
//   Schweizer & Lütschg 2001 found 90% for the Swiss Alps, 1987–1997).
import { THREE, M, box, sphere, clamp, HEX, fmtN, compact, fitNarrow, prism, shear, skierStress, person } from '../snow.js';
import { swarm, approach } from '../kit.js';

const RAD = Math.PI / 180, LEE = 38, WIN = 20, CX = -0.4, CY = 4.3, LR = 6.2, LW = 6.6, NB = 8, ZD = 3, BLAST = 350;
function calc(st, s, blast = 0) {
  const fresh = 40 * st.snow * (1 + 2 * st.wind) + 30 * st.wind, mass = 100 + fresh + 10 * st.warm, depth = 0.5 + fresh / 150;
  const tau = shear(mass, LEE), str = 1000 * (1 - 0.3 * st.warm), sk = s.skier ? skierStress(depth) : 0;
  return { fresh, mass, depth, tau, str, sk, S: str / (tau + sk + blast) };
}

export default {
  id: 'triggers',
  short: 'Triggers',
  title: 'What sets it off',
  subtitle: 'A loaded slope can wait for days. Then something adds a little weight, or takes away a little strength.',
  view: { pos: [0.2, 6.6, 13.2], target: [0.2, 5.2, 0] },
  learn: `<p>A slab on a weak layer is a loaded trap. A <b>trigger</b> is whatever springs it. Every trigger does one of two things: it <b>adds load</b>, or it <b>removes strength</b>.</p>
    <p><b>Heavy snowfall</b> is the simplest. Every 10 cm of new snow adds about 10 kg to each square metre, and the weak layer needs time to adjust. A lot of snow in a short time is the classic warning: most natural avalanches run during a storm or in the day after it.</p>
    <p><b>Wind</b> is the great loader. It strips snow from the side it blows onto and drops it just over the ridge, on the sheltered <b>lee side</b>. A lee slope can gain snow several times faster than it falls from the sky, packed into a stiff wind slab. On the crest the wind builds a <b>cornice</b>, an overhanging lip of snow that can break off and trigger the slope below.</p>
    <p><b>Rapid warming and rain</b> work the other way. Meltwater seeps between the grains and loosens their bonds, so the snow loses strength within hours. Rain also adds weight. A sudden warm spell after a cold one, or rain on new snow, is a red flag.</p>
    <p><b>A person</b> is a small load, but it is concentrated, and it lands exactly where the slab is thin and the weak layer is close. One skier, one climber or one soldier on patrol can start a crack that releases the whole slope. In over <b>90%</b> of the slab avalanches that bury winter-sports people, the avalanche was triggered by the victim or by someone in their group, according to the Swiss avalanche institute SLF. That is hard news, and useful news: the choice of slope matters more than luck.</p>
    <p><b>Explosives</b> use the same effect on purpose. Avalanche teams fire charges into loaded slopes while the road or the piste below is closed, so the snow comes down when nobody is there.</p>
    <p class="tip"><b>Try it:</b> switch on the snowfall and wait. Then add wind. Start again and try the skier on the bare slope, then after a snowfall. Last, throw a charge at a slope that is holding well.</p>`,
  terms: [
    { t: 'Trigger', d: 'Whatever tips a loaded slope over the edge: more weight, less strength, or a sudden jolt.' },
    { t: 'Lee slope', d: 'The sheltered side of a ridge, where the wind drops the snow it has carried.' },
    { t: 'Wind slab', d: 'Wind-packed snow on a lee slope: stiff, cohesive and quick to form.' },
    { t: 'Cornice', d: 'An overhanging lip of wind-packed snow on a ridge crest.' },
    { t: 'Natural release', d: 'An avalanche that starts with no person involved, from snowfall, wind, warming or a cornice fall.' },
    { t: 'Control blasting', d: 'Releasing avalanches on purpose with explosives while the area below is closed.' },
  ],
  defaults: { snow: false, wind: false, warm: false, skier: false },
  controls: [
    { key: 'snow', type: 'toggle', label: 'Heavy snowfall', hint: '40 cm of new snow: 40 kg more on every square metre.' },
    { key: 'wind', type: 'toggle', label: 'Strong wind over the ridge', hint: 'Loads the lee slope and builds a cornice.' },
    { key: 'warm', type: 'toggle', label: 'Rapid warming and rain', hint: 'Meltwater weakens the bonds between grains.' },
    { key: 'skier', type: 'toggle', label: 'A person on the slope' },
    { type: 'buttons', label: 'Explosive', items: [{ label: 'Throw a charge', act: (s, inst) => inst.blast?.() }] },
  ],
  quiz: [
    { q: 'On which side of a ridge does the wind pile up snow?', options: ['The side the wind blows onto', 'The sheltered lee side', 'Both sides equally', 'Neither: wind only removes snow'], answer: 1, why: 'Wind scours the windward side and drops its load just past the crest, on the lee slope.' },
    { q: 'How do rapid warming and rain make a slope less stable?', options: ['They make the snow lighter', 'Meltwater weakens the bonds between the grains', 'They freeze the weak layer solid', 'They blow the slab away'], answer: 1, why: 'Liquid water loosens the bonds, so strength falls quickly, and rain adds weight too.' },
    { q: 'Who triggers most of the avalanches that bury skiers and climbers?', options: ['Animals', 'Earthquakes', 'The victims themselves or people in their group', 'Aircraft noise'], answer: 2, why: 'The Swiss institute SLF puts it at over 90% for slab avalanches that bury winter-sports people.' },
  ],
  reel: [
    { ms: 6000, caption: 'Triggers add weight or take away strength: new snow, wind loading the lee slope, sudden warming, or one person.', set: { snow: true, wind: true, warm: false, skier: false }, act: (s, inst) => inst.seek?.(), view: { pos: [0.6, 4.6, 12], target: [0.6, 3.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root); stage.floor.visible = false;
    const la = LEE * RAD, wa = WIN * RAD, ex = CX + LR * Math.cos(la), ey = CY - LR * Math.sin(la), wx = CX - LW * Math.cos(wa), wy = CY - LW * Math.sin(wa);
    root.add(prism([[wx, wy], [CX, CY], [ex, ey], [ex, 0], [wx, 0]], -ZD / 2, ZD / 2, M.matte(HEX.rock)));
    const lee = new THREE.Group(); lee.position.set(CX, CY, 0); lee.rotation.z = -la; root.add(lee);      // local +x runs down the lee slope
    const win = new THREE.Group(); win.position.set(CX, CY, 0); win.rotation.z = wa; root.add(win);       // local −x runs down the windward side
    const oldL = box(LR, 0.28, ZD, M.matte(HEX.old)); oldL.position.set(LR / 2, 0.14, 0); lee.add(oldL);
    const weak = box(LR - 0.3, 0.07, ZD + 0.02, M.matte(HEX.weak)); weak.position.set(LR / 2 + 0.15, 0.315, 0); lee.add(weak);
    const crack = box(1, 0.1, ZD + 0.06, M.glow(0xffe14a)); lee.add(crack);
    const slabM = M.matte(0xffffff), blocks = Array.from({ length: NB }, () => { const b = box((LR - 0.3) / NB - 0.02, 1, ZD, slabM); lee.add(b); return b; });
    const oldW = box(LW, 1, ZD, M.matte(HEX.snow)); win.add(oldW);
    const cornice = box(1, 1, ZD, M.matte(0xffffff)); root.add(cornice);
    const skier = person(1.4, 0xff5a3a, true); lee.add(skier);
    const flash = sphere(0.3, M.glow(0xffe14a, { transparent: true, opacity: 0.85 }), 16); lee.add(flash);
    const sun = sphere(0.55, M.glow(0xffd35a), 20); sun.position.set(5.9, 7.6, -2); root.add(sun);
    const flakes = swarm(90, new THREE.OctahedronGeometry(0.04), M.glow(0xffffff)); root.add(flakes);
    const gusts = swarm(70, new THREE.BoxGeometry(0.16, 0.025, 0.025), M.glow(0xcfe8ff)); root.add(gusts);
    const rain = swarm(40, new THREE.BoxGeometry(0.02, 0.22, 0.02), M.glow(0x6fb8ff)); root.add(rain);
    const jit = Array.from({ length: 90 }, (_, i) => [((i * 0.618) % 1), ((i * 0.377) % 1), ((i * 0.853) % 1)]);
    const lState = stage.label('', [0.2, 0.05, 2], root, 'hot');
    const lLee = stage.label('Lee slope · 38°', [0, 0, 0], lee), lWin = stage.label('Windward side', [-3.6, 1.0, ZD / 2], win), lCor = stage.label('Cornice', [CX + 0.9, CY + 1.25, 0], root), lWk = stage.label('Weak layer', [LR - 0.4, -0.45, ZD / 2], lee);
    const minor = [lWin, lCor, lWk];

    const st = { snow: 0, wind: 0, warm: 0 };
    let phase = 'hold', t = 0, slide = 0, vs = 0, blast = 0, last = '', C = calc(st, { skier: false }), why = '';
    return {
      blast() { blast = 1; },
      seek() { st.snow = 0.5; st.wind = 0.3; st.warm = 0; phase = 'hold'; t = 0; blast = 0; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, minor);
        const key = `${s.snow}${s.wind}${s.warm}${s.skier}`; if (key !== last && phase === 'rest') { phase = 'hold'; t = 0; } last = key;
        if (phase === 'hold') { st.snow = approach(st.snow, s.snow ? 1 : 0, 0.45, dt); st.wind = approach(st.wind, s.wind ? 1 : 0, 0.45, dt); st.warm = approach(st.warm, s.warm ? 1 : 0, 0.45, dt); }
        blast = Math.max(0, blast - dt / 1.2);
        C = calc(st, s, blast > 0.4 ? BLAST : 0);
        t += dt;
        if (phase === 'hold') { if (C.S < 1) { phase = 'crack'; t = 0; why = blast > 0.4 ? 'The charge releases it, with the slope below closed' : s.skier && calc(st, { skier: false }).S >= 1 ? 'The person’s weight tips the balance' : s.warm && st.warm > 0.3 && calc({ ...st, warm: 0 }, s).S >= 1 ? 'Meltwater has weakened the layer' : 'The load is more than the weak layer can hold'; } }
        else if (phase === 'crack') { if (t > 0.8) { phase = 'slide'; t = 0; slide = 0; vs = 0; } }
        else if (phase === 'slide') { vs += 1.1 * dt; slide += vs * dt * 3; if (t > 3) { phase = 'rest'; t = 0; st.snow = st.wind = st.warm = 0; } }
        else if (t > 2.2 && (s.snow || s.wind || s.warm)) { phase = 'hold'; t = 0; }
        else if (t > 2.2 && C.S >= 1) { phase = 'hold'; t = 0; }
        const tv = 0.42 + C.fresh * 0.006, ys = 0.35, live = phase === 'hold' || phase === 'crack';
        const ck = phase === 'crack' ? clamp(t / 0.8, 0, 1) : phase === 'slide' ? 1 : 0, cc = s.skier ? 2.2 : 1.4;
        const c0 = Math.max(0.3, cc - ck * LR), c1 = Math.min(LR, cc + ck * LR); crack.visible = ck > 0; crack.scale.x = Math.max(0.01, c1 - c0); crack.position.set((c0 + c1) / 2, 0.315, 0);
        slabM.color.setHex(st.warm > 0.4 ? 0xdfe8f0 : 0xffffff);
        blocks.forEach((b, i) => { const x = 0.3 + (i + 0.5) * ((LR - 0.3) / NB), mv = phase === 'slide' && i > 0 ? slide * (1 + 0.06 * i) : 0; b.scale.y = tv; b.position.set(x + mv, ys + tv / 2 + (mv ? 0.05 * Math.sin(mv * 3 + i) : 0), 0); b.rotation.z = mv ? 0.1 * Math.sin(mv * 2 + i) : 0; b.visible = phase === 'rest' ? i === 0 : x + mv < LR + 2.2; });
        const sx = 2.2 + (phase === 'slide' ? slide * 1.2 : 0); skier.visible = s.skier && phase !== 'rest' && sx < LR + 2; skier.position.set(sx, ys + tv, 0.5); skier.rotation.z = la;
        flash.visible = blast > 0; flash.position.set(1.4, ys + tv + 0.3, 0); flash.scale.setScalar(0.5 + (1 - blast) * 5); flash.material.opacity = 0.85 * blast;
        // Windward snow is scoured as the wind blows; the cornice grows.
        const wt = 0.34 - 0.2 * st.wind + 0.1 * st.snow; oldW.scale.y = wt; oldW.position.set(-LW / 2, wt / 2, 0);
        const cw = 0.5 + 1.1 * st.wind, chh = 0.34 + 0.22 * st.wind; cornice.scale.set(cw, chh, 1); cornice.position.set(CX + cw / 2 - 0.25, CY + 0.3 + chh / 2, 0);
        // Particles.
        flakes.visible = st.snow > 0.03 && phase !== 'rest'; gusts.visible = st.wind > 0.03; rain.visible = st.warm > 0.03; sun.visible = st.warm > 0.03; sun.scale.setScalar(0.4 + 0.8 * st.warm);
        for (let i = 0; i < 90; i++) { const [a, b, c] = jit[i]; flakes.place(i, [-6.5 + a * 12 + (s.wind ? ((time * 1.5 + b * 3) % 3) : 0), 7.2 - ((b * 7 + time * (0.9 + c)) % 7), -1.4 + c * 2.8]); } flakes.done();
        for (let i = 0; i < 70; i++) {
          const [a, b, c] = jit[i], u = (a + time * (0.22 + 0.1 * b)) % 1; let x, y;
          if (u < 0.6) { const k = u / 0.6; x = wx + (CX - wx) * k; y = wy + (CY - wy) * k + 0.45 + 0.5 * b; }
          else { const k = (u - 0.6) / 0.4; x = CX + k * 3.4; y = CY + 0.45 + 0.5 * b - k * k * (2.4 + 0.5 * b) + 0.5 * k; }
          gusts.place(i, [x, y, -1.3 + c * 2.6], [0, 0, u < 0.6 ? wa : -0.5 - (u - 0.6) * 2]);
        } gusts.done();
        for (let i = 0; i < 40; i++) { const [a, b, c] = jit[i]; rain.place(i, [CX + a * 5.2, 6.6 - ((b * 5 + time * 4) % 5), -1.3 + c * 2.6]); } rain.done();
        lLee.position.set(3.5, ys + tv + 0.9, ZD / 2); lLee.element.textContent = `Lee slope · 38° · slab ${Math.round(C.depth * 100)} cm`;
        lCor.visible = !narrow && st.wind > 0.3;
        lState.position.set(3.4, 6.1, 0);
        lState.element.innerHTML = phase === 'crack' || phase === 'slide' ? `<b>Release.</b> ${why}` : phase === 'rest' ? 'The slab has gone. Switch something off, or watch the load build again' : blast > 0 ? 'The charge shakes the slope, and it holds: a good sign' : C.S < 1.25 ? `Only just holding · index ${C.S.toFixed(2)}` : `Holding · index ${C.S.toFixed(2)}`;
        lState.element.className = 'lbl' + (!live || C.S < 1.25 ? ' hot' : '');
      },
      dispose() { stage.floor.visible = true; stage.setShift(0, 0); },
      readout: (s) => {
        const cls = C.S < 1 ? 'no' : C.S < 1.5 ? '' : 'ok', on = [s.snow && 'snowfall', s.wind && 'wind loading', s.warm && 'warming and rain', s.skier && 'a person'].filter(Boolean);
        return compact(`<div class="big ${cls}">${phase === 'rest' ? 'Released' : `Stability index ${C.S.toFixed(2)}`}</div>
          <div class="row"><span>Slab on each m² of the lee slope</span><b>${fmtN(Math.round(C.mass))} kg</b></div>
          <div class="row"><span>Pull along the slope</span><b>${fmtN(Math.round(C.tau + C.sk))} Pa</b></div>
          <div class="row"><span>Weak layer can hold</span><b>${fmtN(Math.round(C.str))} Pa</b></div>
          <div class="row"><span>Added by wind and snowfall</span><b>${fmtN(Math.round(C.fresh))} kg per m²</b></div>
          ${s.skier ? `<div class="row"><span>The person adds</span><b>${fmtN(Math.round(C.sk))} Pa</b></div>` : ''}
          <small>${on.length ? `Acting now: ${on.join(', ')}.` : 'No trigger is acting. The slope is holding with room to spare.'} Wind is set to load the lee slope three times as fast as the snow falls; the loss of strength in a thaw and the size of the charge are illustrations.</small>`);
      },
    };
  },
};
