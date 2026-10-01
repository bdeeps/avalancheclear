// Chapter 6: avalanches in the Himalaya, and staying safe. A mountain road crosses an avalanche path.
// Four people cross it, together or one at a time; a snow gallery (a roofed road that lets the snow
// pass overhead) can be switched on; the danger level sets how often the path runs.
// Danger levels and advice: the five-level table printed on every DGRE Avalanche Warning Bulletin
// (Defence Geoinformatics Research Establishment, Chandigarh; bulletins at drdo.gov.in):
// 1 Green "generally safe", 2 Yellow "partly unsafe", 3 Orange "unsafe", 4 Red "highly unsafe",
// 5 Black "extremely unsafe". The bulletin covers districts of Jammu & Kashmir, Ladakh, Himachal
// Pradesh, Uttarakhand and Sikkim. How often the path runs at each level here is an illustration.
// DGRE was raised on 15 November 2020 by merging the Snow and Avalanche Study Establishment (SASE,
// set up in 1969 at Manali) with the Defence Terrain Research Laboratory, Delhi (DRDO).
// Events (figures as reported; see history.json for sources): Lahaul valley March 1979, about 200
// dead; Gayari 7 April 2012, 140 buried (129 Pakistani soldiers, 11 civilians); Siachen 3 February
// 2016, ten Indian soldiers at about 19,600 ft; Gurez 25 January 2017, about 24 dead including 20
// soldiers; Chamoli 7 February 2021, about 27 million m³ of rock and ice from Ronti Peak, over 200
// dead or missing (Shugar et al. 2021, Science 373); Draupadi ka Danda II 4 October 2022, 27 dead;
// Mana 28 February 2025, 54 road workers buried, 8 died.
// Safety advice: NDMA (National Disaster Management Authority) avalanche do's and don'ts and the
// DGRE bulletin's "preferred action" column. One-at-a-time crossing is standard practice in every
// avalanche school: it limits the people exposed and leaves the rest free to search and dig.
import { THREE, M, box, clamp, HEX, COL, compact, fitNarrow, board, panelBg, placeBoard, mountain, tree, person, inReel, A } from '../snow.js';
import { swarm, beam } from '../kit.js';

const LEVELS = [
  null,
  { n: 1, colour: 'Green', hex: '#4ade80', cond: 'generally safe', short: 'Valleys safe. Check slopes before stepping on them', snow: 'Snowpack generally stable. Isolated weak spots.', act: 'Valley movement is generally safe. On snowy slopes, go with care after checking them.', every: 0, big: false },
  { n: 2, colour: 'Yellow', hex: '#ffd35a', cond: 'partly unsafe', short: 'Valleys with care. Avoid snow-loaded slopes', snow: 'Some paths are loaded. Small natural avalanches possible.', act: 'Move in valleys with care. Avoid snow-loaded slopes.', every: 24, big: false },
  { n: 3, colour: 'Orange', hex: '#ff9a3c', cond: 'unsafe', short: 'Safer valley routes only. Keep off snowy slopes', snow: 'Most paths loaded. Medium avalanches can reach the valley.', act: 'Only carefully chosen safer valley routes, with extreme care. No movement on snow-loaded slopes.', every: 15, big: true },
  { n: 4, colour: 'Red', hex: '#ff5a5a', cond: 'highly unsafe', short: 'Suspend all movement near avalanche paths', snow: 'All paths loaded. Large avalanches can reach the valley.', act: 'Suspend all movement near avalanche paths. Leave settlements on or near them.', every: 9, big: true },
  { n: 5, colour: 'Black', hex: '#9aa3b2', cond: 'extremely unsafe', short: 'Evacuate avalanche-prone areas', snow: 'Large avalanches likely, even from moderate slopes and on new paths.', act: 'Evacuate avalanche-prone areas.', every: 6, big: true },
];
const XR = 1050, NP = 110, PW = 1.15;

export default {
  id: 'safe',
  short: 'The Himalaya and staying safe',
  title: 'Avalanches in the Himalaya, and staying safe',
  subtitle: 'Soldiers, road crews, villagers, pilgrims and climbers share the world’s highest mountains with avalanches. Forecasts, galleries and good habits keep them alive.',
  view: { pos: [-1.4, 10.4, 15.5], target: [0.6, 4.6, 0] },
  learn: `<p><b>Where.</b> In India avalanches belong to the high Himalaya and the Karakoram: Ladakh and the Siachen glacier, the Kashmir valley's upper reaches such as Gurez, Sonamarg and the Zoji La road, Lahaul and Spiti and Kinnaur in Himachal Pradesh, the upper valleys of Uttarakhand, and north Sikkim. The people most exposed are soldiers at high posts, road workers, villagers in the upper valleys, and trekkers and climbers.</p>
    <p><b>Some hard days.</b> In March 1979 avalanches in the Lahaul valley killed about 200 people. On 3 February 2016 an ice and snow avalanche buried an Indian Army post at about 19,600 feet on the Siachen glacier, and ten soldiers of the Madras Regiment died. One of them, Lance Naik Hanumanthappa Koppad, was found alive after six days and died in hospital on 11 February. Across the line, the Gayari avalanche of 7 April 2012 buried 140 people at a Pakistani base. In January 2017 avalanches in Gurez killed about 24 people, 20 of them soldiers. On 4 October 2022 an avalanche struck a training course of the Nehru Institute of Mountaineering on Draupadi ka Danda II in Uttarkashi. Twenty-seven trainees and instructors died, the worst mountaineering accident in India's record. On 28 February 2025 an avalanche buried 54 road workers in their camp near Mana, and eight of them died.</p>
    <p><b>Chamoli, 7 February 2021</b> was a different kind of avalanche. About 27 million cubic metres of <b>rock and glacier ice</b> broke from Ronti Peak, fell nearly two kilometres, and turned into a flood of debris down the Rishiganga and Dhauliganga valleys. It destroyed one hydropower project and badly damaged another, and more than 200 people were killed or never found. Snow was not the cause: a mountainside failed. That story belongs with ${A('landslideclear', 'LandslideClear')}.</p>
    <p><b>Who forecasts.</b> India's avalanche forecaster is the <b>Defence Geoinformatics Research Establishment (DGRE)</b> of DRDO, at Chandigarh. It was formed in 2020 from the Snow and Avalanche Study Establishment (SASE), which began at Manali in 1969. DGRE publishes a daily <b>Avalanche Warning Bulletin</b>, district by district, for Jammu and Kashmir, Ladakh, Himachal Pradesh, Uttarakhand and Sikkim, on a scale of five danger levels. District authorities pass it on.</p>
    <p><b>Protecting roads.</b> Engineers hold snow in place with fences and nets high in the start zone, turn it aside with earth dams, and roof the road with a <b>snow gallery</b> so that the avalanche passes overhead. The Border Roads Organisation has been adding galleries and other works on the approach to the Atal Tunnel near Manali and on the Zoji La road, with DGRE. Where a slope keeps loading, crews close the road and bring the snow down on purpose with a charge.</p>
    <p><b>What to do</b> (National Disaster Management Authority and DGRE guidance).<br><b>Before you go:</b> read the avalanche bulletin and the weather forecast, tell someone your route, and never go alone. At level 3 and above, stay off snow-covered slopes. Wait at least a day or two after heavy snowfall, strong wind, rain or a sudden thaw.<br><b>On the way:</b> avoid slopes of 30° to 45°, gullies and the ground below them. Cross a suspect slope <b>one at a time</b>, with the others watching from a safe spot. Treat cracks shooting out from your feet, a "whumpf" under you, or fresh avalanches nearby as orders to turn back.<br><b>If you are caught:</b> try to get off to the side. Drop heavy gear, and fight to stay on the surface with swimming movements. As the snow slows, bring your arms up to make an air space in front of your face.<br><b>If a companion is buried:</b> watch where they were last seen and mark it. Check it is safe, then search at once: do not go for help first if you can search yourselves, because minutes count. Dig them out, clear the mouth and nose, keep them warm, and call for help. Emergency number: <b>112</b>. NDMA helpline: <b>1078</b>.</p>
    <p>Other hazards of the mountains and the seasons have their own boxes: ${A('landslideclear', 'LandslideClear')}, ${A('earthquakeclear', 'EarthquakeClear')} and ${A('floodclear', 'FloodClear')}, with HeatwaveClear and WildfireClear on the way.</p>
    <p class="tip"><b>Try it:</b> set level 3 and send the group across together. Then make them cross one at a time and compare who is left to dig. Add the gallery. Last, set level 4 and see what the bulletin tells them to do.</p>`,
  terms: [
    { t: 'DGRE', d: 'Defence Geoinformatics Research Establishment, the DRDO laboratory that forecasts avalanches in India. Formerly SASE.' },
    { t: 'Avalanche Warning Bulletin', d: 'DGRE’s daily forecast: a danger level from 1 to 5 for each mountain district.' },
    { t: 'Danger level', d: 'How unstable the snowpack is and how likely avalanches are, from 1 (generally safe) to 5 (extremely unsafe).' },
    { t: 'Snow gallery', d: 'A roofed stretch of road that lets an avalanche pass over the top. Also called a snow shed.' },
    { t: 'Companion rescue', d: 'Search and digging by the people already on the spot. It is the rescue that arrives in time.' },
    { t: 'Rock-ice avalanche', d: 'A fall of rock and glacier ice, as at Chamoli in 2021. Far larger and rarer than a snow avalanche.' },
  ],
  defaults: { level: 3, cross: 'together', gallery: false },
  controls: [
    { key: 'level', type: 'seg', label: 'Danger level in today’s bulletin', options: [1, 2, 3, 4, 5].map((v) => ({ v, label: `${v}` })), fmt: (v) => `${LEVELS[v].colour}: ${LEVELS[v].cond}` },
    { key: 'cross', type: 'seg', label: 'How the group crosses the path', options: [{ v: 'together', label: 'All together' }, { v: 'one', label: 'One at a time' }], fmt: (v) => (v === 'one' ? 'One exposed, three watching' : 'Four exposed at once') },
    { key: 'gallery', type: 'toggle', label: 'Snow gallery over the road', hint: 'The avalanche runs over the roof.' },
    { type: 'buttons', label: 'Control work', items: [{ label: 'Close the road and fire a charge', act: (s, inst) => inst.blast?.() }] },
  ],
  quiz: [
    { q: 'Who issues India’s daily avalanche warning bulletin?', options: ['The Geological Survey of India', 'DGRE, the Defence Geoinformatics Research Establishment (formerly SASE)', 'The Survey of India', 'The Indian Navy'], answer: 1, why: 'DGRE, a DRDO laboratory at Chandigarh, forecasts avalanche danger district by district on a five-level scale.' },
    { q: 'Why should a group cross a suspect slope one at a time?', options: ['It is faster', 'Only one person is exposed, and the others are free to search and dig', 'It makes less noise', 'It keeps the snow cold'], answer: 1, why: 'If the slope goes, one person is caught and the rest can start the rescue within seconds.' },
    { q: 'Your friend has just been buried and you are unhurt. What comes first?', options: ['Walk out to fetch help', 'Check it is safe, then search and dig at once', 'Wait for a helicopter', 'Take photographs'], answer: 1, why: 'Survival drops steeply after about 15 minutes. The people on the spot are the rescue that matters.' },
  ],
  reel: [
    { ms: 7000, caption: 'Read the avalanche bulletin, stay off steep slopes after heavy snow, cross one at a time, and if someone is buried, dig at once.', set: { level: 3, cross: 'one', gallery: false }, act: (s, inst) => inst.seek?.(), view: { pos: [-2, 7, 11.5], target: [0.2, 3.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const mt = mountain({ s: 1 / 170, x0: 6.3, y0: 0.5, z0: -3, z1: 3 }); root.add(mt.g);
    const at = (X, up = 0, z = 0) => { const [x, y] = mt.P(X, up); return [x, y + mt.th(X), z]; };
    [[700, -2.4], [800, 2.3], [900, -2.0], [950, 2.6], [1250, -2.5], [1300, 2.2], [1500, -1.9], [1700, 2.4], [1900, -2.6], [2050, 1.8], [600, 2.6], [620, -2.7]].forEach(([X, z], i) => { const t = tree(0.55 + 0.15 * (i % 3)); t.position.set(...at(X, 0, z)); root.add(t); });
    const rp = at(XR, 0, 0), road = box(0.62, 0.16, 6.2, M.matte(0x4a4f59)); road.position.set(rp[0], rp[1] + 0.02, 0); root.add(road);
    const cut = box(0.3, 0.42, 6.2, M.matte(HEX.rock2)); cut.position.set(rp[0] + 0.42, rp[1] + 0.2, 0); root.add(cut);
    const gal = new THREE.Group(); root.add(gal);
    { const roof = box(1.15, 0.09, 3.0, M.matte(0xb9c0cc)); roof.position.set(rp[0] + 0.08, rp[1] + 0.62, 0); roof.rotation.z = 0.3; gal.add(roof);
      for (let i = 0; i < 6; i++) gal.add(beam([rp[0] - 0.3, rp[1] + 0.1, -1.4 + i * 0.56], [rp[0] - 0.3, rp[1] + 0.5, -1.4 + i * 0.56], 0.035, M.matte(0x8d94a0))); }
    const people = [0xff5a3a, 0x3aa0ff, 0xffd35a, 0x7be07b].map((c) => { const p = person(1.1, c); root.add(p); return p; });
    const bits = swarm(NP, new THREE.BoxGeometry(0.12, 0.1, 0.12), M.matte(0xffffff)); root.add(bits);
    const jit = Array.from({ length: NP }, (_, i) => [((i * 0.618) % 1) - 0.5, ((i * 0.377) % 1), ((i * 0.853) % 1) - 0.5, (i * 2.4) % 6.28]);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 8), M.glow(0xffe14a, { transparent: true })); flash.position.set(...at(200, 0.4, 0)); root.add(flash);
    const lState = stage.label('', [rp[0], rp[1] + 1.9, 0], root, 'hot'), lRoad = stage.label('Road', [rp[0], rp[1] + 0.5, 3.1], root), lPath = stage.label('Avalanche path', at(520, 0.9, 0), root);
    const minor = [lRoad, lPath];

    let lvl = 3;
    const brd = board(root, 6.0, 3.5, 516, 301, (g, w, h) => {
      panelBg(g, w, h);
      g.fillStyle = COL.ink; g.font = 'bold 22px sans-serif'; g.fillText('DGRE bulletin: five danger levels', 14, 28);
      LEVELS.slice(1).forEach((L, i) => {
        const y = 40 + i * 50, on = L.n === lvl;
        if (on) { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(8, y, w - 16, 47); }
        g.fillStyle = L.hex; g.fillRect(16, y + 5, 38, 38); g.fillStyle = '#111'; g.font = 'bold 26px sans-serif'; g.fillText(`${L.n}`, 28, y + 33);
        if (L.n === 5) { g.fillStyle = '#16181d'; g.fillRect(16, y + 5, 38, 38); g.strokeStyle = '#9aa3b2'; g.lineWidth = 2; g.strokeRect(16, y + 5, 38, 38); g.fillStyle = '#fff'; g.fillText('5', 28, y + 33); }
        g.fillStyle = COL.ink; g.font = 'bold 20px sans-serif'; g.fillText(`${L.colour}: ${L.cond}`, 66, y + 22);
        g.font = '14px sans-serif'; g.fillStyle = on ? COL.warn : COL.soft; g.fillText(L.short, 66, y + 41);
      });
      
    }, [0, 0, 0]);

    // State: where the walkers are (z along the road), the avalanche (X of its front), counters.
    let tc = 0, av = -1, timer = 0, ctl = 0, caught = [false, false, false, false], total = 0, events = 0, rest = 0, key = '', msg = '', inPath = 0, closed = false;
    const reset = () => { tc = 0; caught = [false, false, false, false]; };
    return {
      blast() { if (av < 0) { ctl = 1.4; reset(); } },
      seek() { reset(); tc = 4.4; timer = 0.6 * LEVELS[3].every; av = -1; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, minor);
        placeBoard(brd, [[-4.4, 4.2, 0], 0, 1], [[0.2, 9.6, -2], 0, 1.6]); brd.mesh.visible = !narrow || inReel();
        if (lvl !== s.level) { lvl = s.level; brd.redraw(); }
        const k2 = `${s.level}|${s.cross}|${s.gallery}`; if (k2 !== key) { key = k2; total = 0; events = 0; timer = 0; reset(); }
        const L = LEVELS[s.level]; closed = s.level >= 4 || ctl > 0; gal.visible = s.gallery;
        // Walkers.
        if (rest > 0) rest -= dt; else if (!closed) tc += dt;
        inPath = 0;
        people.forEach((p, i) => {
          let z;
          if (closed) z = 2.0 + i * 0.3;
          else if (s.cross === 'together') { const u = tc * 0.55 - i * 0.38; z = 2.9 - u; if (i === 3 && z < -3.2) reset(); }
          else { const t0 = i * 4.2, u = clamp((tc - t0) / 3.4, 0, 1); z = u <= 0 ? 1.55 + i * 0.3 : u >= 1 ? -1.6 - i * 0.3 : 1.55 - u * 3.15; if (i === 3 && tc > t0 + 5) reset(); }
          if (Math.abs(z) < PW && !closed) inPath++;
          p.userData.z = z; p.visible = !caught[i];
          p.position.set(rp[0] - 0.05, rp[1] + 0.1 + (Math.abs(z) < PW || closed ? 0 : 0.02 * Math.abs(Math.sin(time * 8 + i))), z);
        });
        // The avalanche: natural releases by level, or the control charge.
        if (ctl > 0) { ctl -= dt; if (ctl <= 0) { av = 150; msg = 'Road closed, charge fired: the slope is emptied with nobody below'; timer = -L.every; this.big = true; this.ctl = true; } }
        else if (av < 0 && rest <= 0 && L.every) { timer += dt; if (timer > L.every) { av = 150; timer = 0; this.big = L.big; this.ctl = false; msg = L.big ? '' : 'A small avalanche. It stops high on the path'; } }
        flash.visible = ctl > 0 && ctl < 0.5; flash.scale.setScalar(1 + (0.5 - ctl) * 6);
        if (av >= 0) {
          const end = this.big ? 1750 : 620, before = av; av += dt * 520;
          if (this.big && before < XR && av >= XR) {
            events++;
            if (s.gallery) msg = 'The snow runs over the gallery roof. The road stays open';
            else if (!this.ctl) { let n = 0; people.forEach((p, i) => { if (Math.abs(p.userData.z) < PW && !closed) { caught[i] = true; n++; } }); total += n; msg = n === 0 ? 'It crosses the road. Nobody was in the path' : n === 4 ? '<b>All four are buried.</b> Nobody is left to search' : `<b>${n} buried.</b> ${4 - n} can search and dig at once`; }
          }
          if (av > end) { av = -1; rest = 3.2; if (!caught.some(Boolean)) rest = 1.2; this.after = true; }
        } else if (rest <= 0 && this.after) { this.after = false; msg = ''; reset(); }
        const front = av >= 0 ? av : this.after ? (this.big ? 1750 : 620) : -1;
        for (let i = 0; i < NP; i++) {
          const j = jit[i], X = clamp(front + j[0] * 260, 120, 2150), lift = s.gallery ? 0.62 * Math.exp(-(((X - XR) / 75) ** 2)) : 0;
          bits.place(i, at(X, 0.05 + j[1] * 0.22 + lift, j[2] * 2 * PW), [j[3] + (av >= 0 ? time * 6 : 0), j[3], 0], front >= 0 ? 0.7 + j[1] * 0.7 : 0);
        } bits.done();
        lState.element.innerHTML = msg || (ctl > 0 ? 'Road closed. Everyone waits clear of the path' : closed ? `Level ${s.level}: <b>all movement suspended</b>. The group waits` : s.cross === 'one' ? 'One crosses. The others watch from a safe spot' : 'All four are in the path together');
        lState.element.className = 'lbl' + (msg || closed ? ' hot' : '');
      },
      readout: (s) => {
        const L = LEVELS[s.level], exposed = closed ? 0 : s.gallery ? 0 : s.cross === 'one' ? 1 : 4;
        return compact(`<div class="big" style="color:${L.n === 5 ? '#e8eef8' : L.hex}">Level ${L.n} · ${L.colour}: ${L.cond}</div>
          <div class="row"><span>Bulletin says</span><b>${L.short}</b></div>
          <div class="row"><span>Most people in the path at one time</span><b>${exposed}</b></div>
          <div class="row"><span>If it ran then: left free to dig</span><b>${4 - exposed} of 4</b></div>
          <div class="row"><span>In the path right now</span><b>${s.gallery ? `${inPath}, under the roof` : inPath}</b></div>
          <div class="row"><span>Avalanches across the road · people buried</span><b>${events} · ${total}</b></div>
          <small>${s.level >= 4 ? 'At levels 4 and 5 the bulletin says to stop moving near avalanche paths, so the group waits.' : s.gallery ? 'A gallery takes the road out of the avalanche’s way. It protects only the stretch it covers.' : s.cross === 'one' ? 'One at a time: if the slope goes, three people can start the search within seconds.' : 'Together, one avalanche can bury the whole group, with no one left to dig.'} How often the path runs at each level is an illustration.</small>`);
      },
    };
  },
};
