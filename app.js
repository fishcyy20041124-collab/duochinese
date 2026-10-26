/* DuoJapanese — 面向中文母语者的日语零基础互动学习引擎 */
(function () {
'use strict';

/* ======================= 状态与本地存档 (LocalStorage) ======================= */

const KEY = 'duojapanese.v1';   // 独立保存在浏览器本地的存档名
const MAX_CROWNS = 3;

const defaults = () => ({
  xp: 0, streak: 0, lastDay: null,
  progress: {},                         // lessonId -> crowns (皇冠数)
  totalLessons: 0,
});

let S = load();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw === 'object') return Object.assign(defaults(), raw);
  } catch (e) { /* 本地存储被禁用或损坏时，重新初始化 */ }
  return defaults();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
function today() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }

function bumpStreak() {
  const d = today();
  if (S.lastDay === d) return;
  S.streak = (S.lastDay && daysBetween(S.lastDay, d) === 1) ? S.streak + 1 : 1;
  S.lastDay = d;
}

/* ======================= 日语发音与音效引擎 (Audio) ======================= */

let jaVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices() || [];
  jaVoice = vs.find(v => /^ja[-_]?JP/i.test(v.lang)) || vs.find(v => /^ja/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
function audioOk() {
  if (!('speechSynthesis' in window)) return false;
  const vs = speechSynthesis.getVoices();
  if (!vs || !vs.length) return true;           // 语音列表尚未加载完成时默认可用
  return vs.some(v => /^ja/i.test(v.lang));
}
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[。！？、，]/g, ' '));
    u.lang = 'ja-JP';
    if (jaVoice) u.voice = jaVoice;
    u.rate = 0.85;                              // 稍微放慢语速，方便听清五十音
    speechSynthesis.speak(u);
  } catch (e) {}
}

let actx = null;
function tone(freqs, dur) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t0 = actx.currentTime + i * dur * 0.6;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    });
  } catch (e) {}
}
const dingOK = () => tone([660, 990], 0.16);
const dingNo = () => tone([200, 150], 0.22);

/* ======================= 题库辅助工具 ======================= */

const ALL_WORDS = Array.from(WORD_INDEX.values());
const rand = n => Math.floor(Math.random() * n);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a, n) { return shuffle(a).slice(0, n); }
function distractorWords(exclude, n) {
  const pool = ALL_WORDS.filter(w => !exclude.includes(w[0]) && !exclude.includes(w[2]));
  return pick(pool, n);
}
/* 过滤掉同音词作为听力或罗马音题的干扰项，防止出现多解 */
function soundAlikeSafe(w, n) {
  const pool = shuffle(ALL_WORDS.filter(x => x[0] !== w[0] && x[2] !== w[2]));
  const out = [], taken = [w[1]];
  for (const x of pool) {
    if (taken.includes(x[1])) continue;
    taken.push(x[1]); out.push(x);
    if (out.length === n) break;
  }
  return out;
}
/* 中文造句题的干扰词块池 */
const CN_FILLER = ['我', '你', '是', '不是', '喜欢', '老师', '学生', '朋友', '水', '茶',
  '寿司', '拉面', '好吃', '这个', '那个', '什么', '吗', '谢谢', '你好', '请给我',
  '中国人', '日本人', '上面', '秋天', '声音', '蓝色'];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function on(node, fn) { node.addEventListener('click', fn); return node; }

/* ======================= 题型生成器 ======================= */

function cSelectMeaning(w) {                    // 看假名/日语词 -> 选中文释义
  const opts = shuffle([w].concat(distractorWords([w[0]], 2))).map(x => x[2]);
  return { t: 'meaning', hz: w[0], py: w[1], q: '这个假名 / 词汇是什么意思？', options: opts, answer: opts.indexOf(w[2]) };
}
function cSelectHanzi(w) {                      // 看中文意思 -> 选日语假名/词汇
  const opts = shuffle([w].concat(distractorWords([w[0]], 2)));
  return { t: 'hanzi', q: '哪一个是“' + w[2] + '”？', options: opts, answer: opts.indexOf(w) };
}
function cAudio(w) {                            // 听日语发音 -> 选假名/词汇
  const opts = shuffle([w].concat(soundAlikeSafe(w, 2)));
  return { t: 'audio', q: '听音选词：点击你听到的内容', hz: w[0], options: opts, answer: opts.indexOf(w) };
}
function cPinyin(w) {                           // 看假名/词汇 -> 选罗马音读音
  const opts = shuffle([w].concat(soundAlikeSafe(w, 2))).map(x => x[1]);
  return { t: 'pinyin', hz: w[0], q: '这个词的正确发音（罗马音）是？', options: opts, answer: opts.indexOf(w[1]) };
}
function cPairs(words) {                        // 消消乐配对题
  return { t: 'pairs', q: '点击配对相应的日语和中文意思', items: pick(words, Math.min(5, words.length)) };
}
function cBuildZh(s, listen) {                  // 看中文（或听日语）-> 拼出日语句子
  const answer = s[3];
  const extra = distractorWords(answer, 3).map(w => w[0]);
  return {
    t: 'build', dir: listen ? 'listen' : 'en2zh',
    q: listen ? '听音拼句：点击听到的日语词块' : '请用日语拼出这句话',
    sent: s, answer: answer, bank: shuffle(answer.concat(extra)),
  };
}
function cBuildEn(s) {                          // 看日语句子 -> 拼出中文翻译
  const answer = s[2].split(' ');
  const extra = pick(CN_FILLER.filter(w => !answer.includes(w)), 3);
  return { t: 'build', dir: 'zh2en', q: '把这句话翻译成中文', sent: s, answer: answer, bank: shuffle(answer.concat(extra)) };
}

function generate(lesson, crowns) {
  const words = lesson.words, sents = lesson.sentences;
  const out = [];

  if (crowns === 0) {
    // 第一次学习该关卡：先依次认识每个新假名/新词
    words.forEach(w => out.push(cSelectMeaning(w)));
    if (words.length >= 4) out.push(cPairs(words));
    sents.forEach((s, i) => out.push(i % 2 ? cBuildEn(s) : cBuildZh(s, false)));
    words.slice(0, 3).forEach(w => out.push(cAudio(w)));
  } else {
    // 复习或进阶：增加听音、辨音与直接造句比重
    if (words.length >= 4) out.push(cPairs(words));
    pick(words, Math.min(4, words.length)).forEach((w, i) => {
      out.push(i % 3 === 0 ? cPinyin(w) : i % 3 === 1 ? cAudio(w) : cSelectHanzi(w));
    });
    shuffle(sents).forEach((s, i) => out.push(i % 3 === 0 ? cBuildEn(s) : cBuildZh(s, i % 3 === 2)));
  }

  let list;
  if (crowns === 0) {
    const intro = out.filter(c => c.t === 'meaning');
    const rest = out.filter(c => c.t !== 'meaning');
    const pairs = rest.filter(c => c.t === 'pairs');
    list = intro.concat(pairs, shuffle(rest.filter(c => c.t !== 'pairs')));
  } else {
    const pairs = out.filter(c => c.t === 'pairs');
    list = pairs.concat(shuffle(out.filter(c => c.t !== 'pairs')));
  }
  list = list.slice(0, 14);

  // 如果当前设备不支持日语语音，自动将听力题降级为看字题
  if (!audioOk()) {
    list = list.map(c => {
      if (c.t === 'audio') return cSelectHanzi(WORD_INDEX.get(c.hz));
      if (c.t === 'build' && c.dir === 'listen') {
        return Object.assign({}, c, { dir: 'en2zh', q: '请用日语拼出这句话' });
      }
      return c;
    });
  }
  return list;
}

/* ======================= 页面框架与视图渲染 ======================= */

const app = document.getElementById('app');
let screen = 'path';
let ses = null;

function clear() { app.innerHTML = ''; }
function render() {
  clear();
  if (screen === 'path') return renderPath();
  if (screen === 'lesson') return renderLesson();
  if (screen === 'done') return renderDone();
}

/* ---------- 闯关地图页 ---------- */

function currentLesson() {
  return ALL_LESSONS.find(l => !S.progress[l.id])
      || ALL_LESSONS.find(l => (S.progress[l.id] || 0) < MAX_CROWNS)
      || null;
}

function renderPath() {
  const top = el('div', 'top');
  const mk = (cls, icon, val) => {
    const s = el('div', 'stat ' + cls);
    s.appendChild(el('span', 'icon', icon));
    s.appendChild(el('span', val === '∞' ? 'inf' : null, val));
    return s;
  };
  top.appendChild(mk('fire', '🔥', S.streak));
  top.appendChild(mk('gem', '💎', S.xp));
  top.appendChild(mk('heart', '❤️', '∞'));
  top.appendChild(el('div', 'spacer'));
  const reset = on(el('button', null, '重置进度'), () => {
    if (confirm('确定要清空所有学习记录并重新开始吗？')) { S = defaults(); save(); render(); }
  });
  reset.style.cssText = 'color:var(--grey);font-size:12px;letter-spacing:.6px';
  top.appendChild(reset);
  app.appendChild(top);

  const hero = el('div', 'hero');
  hero.appendChild(el('h1', null, '🌸 多邻国日语'));
  const doneCount = Object.values(S.progress).filter(v => v > 0).length;
  hero.appendChild(el('p', null, doneCount
    ? '已解锁 ' + doneCount + ' / ' + ALL_LESSONS.length + ' 个关卡 · 继续加油！'
    : '专为中文母语者打造的零基础日语课：五十音、高频词、简单句型，免费畅学！'));
  app.appendChild(hero);

  const path = el('div', 'path');
  const cur = currentLesson();

  COURSE.forEach(u => {
    const head = el('div', 'unit-head');
    head.style.background = u.color;
    head.appendChild(el('div', 'u-ic', u.icon));
    const box = el('div');
    box.appendChild(el('h2', null, u.title));
    box.appendChild(el('p', null, u.subtitle));
    head.appendChild(box);
    path.appendChild(head);

    const nodes = el('div', 'nodes');
    u.lessons.forEach((l, i) => {
      const row = el('div', 'node-row');
      const offs = [0, 46, 70, 46, 0, -46, -70, -46];
      row.style.transform = 'translateX(' + offs[i % offs.length] + 'px)';

      const wrap = el('div', 'node-wrap');
      const crowns = S.progress[l.id] || 0;
      const full = crowns >= MAX_CROWNS;

      const btn = el('button', 'node' + (crowns ? ' done' : ' fresh'));
      btn.textContent = full ? '👑' : l.review ? '🏆' : '★';
      btn.style.background = full ? '#FFC800' : u.color;
      btn.style.boxShadow = '0 7px 0 ' + (full ? '#E0A900' : shade(u.color));
      btn.title = l.title;
      on(btn, () => startLesson(l.id));
      wrap.appendChild(btn);

      if (crowns > 0) wrap.appendChild(el('div', 'crowns', '👑' + crowns));
      wrap.appendChild(el('div', 'lbl', l.title));
      if (cur && cur.id === l.id) wrap.appendChild(el('div', 'start-bubble', crowns ? '继续练习' : '开始'));

      row.appendChild(wrap);
      nodes.appendChild(row);
    });
    path.appendChild(nodes);
  });

  app.appendChild(path);
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.round(c * 0.78));
  return '#' + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)]
    .map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- 答题闯关页 ---------- */

function startLesson(id) {
  const l = lessonById(id);
  const queue = generate(l, S.progress[id] || 0);
  if (!queue.length) return;
  ses = {
    lesson: l,
    queue: queue,
    i: 0, right: 0, wrong: 0, state: 'answering',
    sel: null, built: [], used: {}, matched: 0, pairSel: null,
    startedAt: Date.now(),
  };
  screen = 'lesson';
  render();
}

function cur() { return ses.queue[ses.i]; }

function renderLesson() {
  const c = cur();
  const wrap = el('div', 'lesson');

  /* 顶部进度栏 */
  const top = el('div', 'lesson-top');
  top.appendChild(on(el('button', 'close', '✕'), () => { if (confirm('确定要退出当前关卡吗？本局进度将不会保存。')) { screen = 'path'; render(); } }));
  const bar = el('div', 'bar');
  const fill = el('i');
  fill.style.width = Math.round(ses.i / ses.queue.length * 100) + '%';
  bar.appendChild(fill);
  top.appendChild(bar);
  const h = el('div', 'hearts');
  h.appendChild(el('span', null, '❤️'));
  h.appendChild(el('span', 'inf', '∞'));
  top.appendChild(h);
  wrap.appendChild(top);

  /* 中间题目展示区 */
  const stage = el('div', 'stage');
  stage.appendChild(el('h2', 'q', c.q));
  ({
    meaning: rMeaning, hanzi: rHanzi, audio: rAudio, pinyin: rPinyin,
    pairs: rPairs, build: rBuild,
  })[c.t](stage, c);
  wrap.appendChild(stage);

  /* 底部检查与反馈栏 */
  wrap.appendChild(renderFoot(c));
  app.appendChild(wrap);
}

function speakerBtn(text, big) {
  const b = el('button', 'speaker' + (big ? ' big' : ''), '🔊');
  on(b, () => speak(text));
  return b;
}

function optionList(stage, c, labels, cols) {
  const box = el('div', 'opts' + (cols ? ' cols' : ''));
  labels.forEach((lab, i) => {
    const o = el('button', 'opt');
    o.appendChild(el('span', 'num', String(i + 1)));
    if (typeof lab === 'string') {
      o.appendChild(el('span', null, lab));
    } else {
      const t = el('span');
      t.appendChild(el('span', 'o-hz', lab[0]));
      t.appendChild(el('span', 'o-py', ' ' + lab[1]));
      o.appendChild(t);
    }
    if (ses.state === 'checked') {
      if (i === c.answer) o.classList.add('ok');
      else if (i === ses.sel) o.classList.add('bad');
    } else if (ses.sel === i) o.classList.add('sel');
    on(o, () => {
      if (ses.state === 'checked') return;
      ses.sel = i;
      if (c.t === 'audio' || c.t === 'hanzi') speak(typeof lab === 'string' ? lab : lab[0]);
      render();
    });
    box.appendChild(o);
  });
  stage.appendChild(box);
}

function rMeaning(stage, c) {
  stage.appendChild(el('div', 'big-hz', c.hz));
  stage.appendChild(el('div', 'big-py', c.py));
  const sp = speakerBtn(c.hz); sp.style.margin = '0 auto 22px';
  stage.appendChild(sp);
  optionList(stage, c, c.options);
  if (ses.state === 'answering') speakOnce(c.hz);
}
function rHanzi(stage, c) {
  optionList(stage, c, c.options.map(w => [w[0], w[1]]), true);
}
function rAudio(stage, c) {
  stage.appendChild(speakerBtn(c.hz, true));
  optionList(stage, c, c.options.map(w => [w[0], w[1]]), true);
  if (ses.state === 'answering') speakOnce(c.hz);
}
function rPinyin(stage, c) {
  stage.appendChild(el('div', 'big-hz', c.hz));
  const sp = speakerBtn(c.hz); sp.style.margin = '8px auto 22px';
  stage.appendChild(sp);
  optionList(stage, c, c.options, true);
  if (ses.state === 'answering') speakOnce(c.hz);
}

let lastSpoken = null;
function speakOnce(text) {
  const tag = ses.i + ':' + text;
  if (lastSpoken === tag) return;
  lastSpoken = tag;
  setTimeout(() => speak(text), 350);
}

function rPairs(stage, c) {
  const grid = el('div', 'pairs');
  if (!ses.pairLeft) {
    ses.pairLeft = shuffle(c.items);
    ses.pairRight = shuffle(c.items);
    ses.gone = {};
  }
  const col = (items, side) => {
    const box = el('div');
    box.style.cssText = 'display:flex;flex-direction:column;gap:12px';
    items.forEach(w => {
      const b = el('button', 'pair' + (ses.gone[w[0]] ? ' gone' : ''));
      b.setAttribute('aria-label', side === 'L' ? w[0] + ' ' + w[1] : w[2]);
      if (side === 'L') {
        b.appendChild(el('div', null, w[0]));
        b.appendChild(el('div', 'p-py', w[1]));
      } else {
        b.appendChild(el('div', null, w[2]));
      }
      if (ses.pairSel && ses.pairSel.side === side && ses.pairSel.hz === w[0]) b.classList.add('sel');
      on(b, () => {
        if (ses.gone[w[0]]) return;
        if (side === 'L') speak(w[0]);
        if (!ses.pairSel || ses.pairSel.side === side) { ses.pairSel = { side: side, hz: w[0] }; return render(); }
        if (ses.pairSel.hz === w[0]) {
          ses.gone[w[0]] = true; ses.pairSel = null; ses.matched++;
          dingOK();
          if (ses.matched >= c.items.length) {
            ses.state = 'checked'; ses.ok = true; ses.right++;
            setTimeout(() => { next(); }, 400);
          }
          return render();
        }
        // 配对错误
        dingNo();
        ses.pairSel = null;
        ses.pairMiss = (ses.pairMiss || 0) + 1;
        render();
      });
      box.appendChild(b);
    });
    return box;
  };
  grid.appendChild(col(ses.pairLeft, 'L'));
  grid.appendChild(col(ses.pairRight, 'R'));
  stage.appendChild(grid);
  stage.appendChild(el('div', 'hint', '先点左侧日语，再点右侧对应的中文意思'));
}

function rBuild(stage, c) {
  const s = c.sent;
  if (c.dir === 'listen') {
    stage.appendChild(speakerBtn(s[0], true));
    if (ses.state === 'answering') speakOnce(s[0]);
  } else if (c.dir === 'en2zh') {
    stage.appendChild(el('div', 'en-prompt', '“' + s[2].replace(/\s+/g, '') + '”'));
  } else {
    const p = el('div', 'prompt');
    p.appendChild(speakerBtn(s[0]));
    const b = el('div', 'bubble');
    b.appendChild(el('div', 'hz', s[0]));
    b.appendChild(el('div', 'py', s[1]));
    p.appendChild(b);
    stage.appendChild(p);
    speakOnce(s[0]);
  }

  const slots = el('div', 'slots');
  const line = el('div', 'slot-line');
  ses.built.forEach((tok, idx) => {
    const t = el('button', 'tile');
    t.appendChild(document.createTextNode(tok.text));
    if (c.dir !== 'zh2en') t.appendChild(el('span', 't-py', pinyinOf(tok.text)));
    on(t, () => {
      if (ses.state === 'checked') return;
      ses.built.splice(idx, 1);
      delete ses.used[tok.key];
      render();
    });
    line.appendChild(t);
  });
  slots.appendChild(line);
  stage.appendChild(slots);

  const bank = el('div', 'bank');
  c.bank.forEach((tok, idx) => {
    const key = idx + ':' + tok;
    const t = el('button', 'tile' + (ses.used[key] ? ' used' : ''));
    t.appendChild(document.createTextNode(tok));
    if (c.dir !== 'zh2en') t.appendChild(el('span', 't-py', pinyinOf(tok)));
    on(t, () => {
      if (ses.state === 'checked' || ses.used[key]) return;
      ses.used[key] = true;
      ses.built.push({ text: tok, key: key });
      if (c.dir !== 'zh2en') speak(tok);
      render();
    });
    bank.appendChild(t);
  });
  stage.appendChild(bank);
}

/* ---------- 底部栏与判分逻辑 ---------- */

function answerReady(c) {
  if (c.t === 'build') return ses.built.length > 0;
  if (c.t === 'pairs') return false;
  return ses.sel !== null;
}

function renderFoot(c) {
  const foot = el('div', 'foot' + (ses.state === 'checked' ? (ses.ok ? ' ok' : ' bad') : ''));
  const inner = el('div', 'foot-in');

  if (ses.state === 'checked') {
    const v = el('div', 'verdict');
    v.appendChild(el('div', 'v-ic', ses.ok ? '✓' : '✕'));
    const txt = el('div');
    txt.appendChild(el('h3', null, ses.ok ? nice() : '正确答案：'));
    txt.appendChild(el('p', null, solutionLine(c)));
    v.appendChild(txt);
    inner.appendChild(v);
    const b = on(el('button', 'btn' + (ses.ok ? '' : ' red'), '继续'), next);
    inner.appendChild(b);
  } else {
    inner.appendChild(el('div', 'verdict'));
    const b = el('button', 'btn', c.t === 'pairs' ? '请完成所有配对' : '检查');
    b.disabled = !answerReady(c);
    on(b, check);
    inner.appendChild(b);
  }
  foot.appendChild(inner);
  return foot;
}

const PRAISE = ['太棒了！', '干得漂亮！', '完全正确！', '完美！', 'すごいです (太厉害了)！', '正解！'];
function nice() { return PRAISE[rand(PRAISE.length)]; }

function solutionLine(c) {
  if (c.t === 'build') {
    if (c.dir === 'zh2en') return c.answer.join('');
    return c.answer.join('') + '  ·  ' + c.sent[1];
  }
  if (c.t === 'meaning') return c.options[c.answer];
  if (c.t === 'pinyin') return c.hz + '  ·  ' + c.options[c.answer];
  if (c.t === 'pairs') return '配对完成！';
  const w = c.options[c.answer];
  return w[0] + '  ·  ' + w[1] + '  ·  ' + w[2];
}

function check() {
  const c = cur();
  let ok;
  if (c.t === 'build') {
    const got = ses.built.map(t => t.text);
    ok = got.length === c.answer.length && got.every((t, i) => t.toLowerCase() === c.answer[i].toLowerCase());
  } else {
    ok = ses.sel === c.answer;
  }
  ses.ok = ok;
  ses.state = 'checked';
  if (ok) { ses.right++; dingOK(); if (c.t !== 'pairs') speakTarget(c); }
  else { ses.wrong++; dingNo(); }
  render();
}

function speakTarget(c) {
  if (c.t === 'build' && c.dir !== 'zh2en') speak(c.answer.join(''));
  else if (c.hz) speak(c.hz);
  else if (c.t === 'hanzi' || c.t === 'audio') speak(c.options[c.answer][0]);
}

function next() {
  const c = cur();
  if (!ses.ok) ses.queue.push(c);          // 答错的题目会自动排到队尾重做，直到学会为止
  ses.i++;
  ses.state = 'answering';
  ses.sel = null; ses.built = []; ses.used = {};
  ses.pairLeft = null; ses.pairRight = null; ses.pairSel = null; ses.matched = 0; ses.gone = {};

  if (ses.i >= ses.queue.length) return finish();
  render();
}

function finish() {
  const id = ses.lesson.id;
  const perfect = ses.wrong === 0;
  ses.gainedXp = 10 + (perfect ? 5 : 0);
  S.xp += ses.gainedXp;
  S.progress[id] = Math.min(MAX_CROWNS, (S.progress[id] || 0) + 1);
  bumpStreak();
  save();
  screen = 'done';
  tone([523, 659, 784, 1046], 0.18);
  render();
}

function renderDone() {
  const secs = Math.max(1, Math.round((Date.now() - ses.startedAt) / 1000));
  const acc = Math.round(ses.right / Math.max(1, ses.right + ses.wrong) * 100);
  const wrap = el('div', 'finish');
  const box = el('div');
  box.appendChild(el('div', 'trophy', ses.wrong === 0 ? '🏆' : '🎉'));
  box.appendChild(el('h1', null, ses.wrong === 0 ? '完美通关！' : '关卡完成！'));

  const cards = el('div', 'cards');
  const card = (cls, title, val) => {
    const c = el('div', 'card ' + cls);
    c.appendChild(el('h4', null, title));
    c.appendChild(el('div', null, val));
    return c;
  };
  cards.appendChild(card('', '获得经验', '+' + ses.gainedXp + ' XP'));
  cards.appendChild(card('blue', '用时', (secs < 60 ? secs + '秒' : Math.floor(secs / 60) + '分' + (secs % 60) + '秒')));
  cards.appendChild(card('red', '正确率', acc + '%'));
  box.appendChild(cards);
  wrap.appendChild(box);
  app.appendChild(wrap);

  const foot = el('div', 'foot');
  const inner = el('div', 'foot-in');
  inner.appendChild(el('div', 'verdict'));
  inner.appendChild(on(el('button', 'btn', '继续'), () => { screen = 'path'; render(); }));
  foot.appendChild(inner);
  app.appendChild(foot);
}

/* ---------- 键盘快捷键支持 ---------- */

document.addEventListener('keydown', e => {
  if (screen === 'done') {
    if (e.key === 'Enter') {
      e.preventDefault();
      const b = document.querySelector('.foot .btn');
      if (b) b.click();
    }
    return;
  }
  if (screen !== 'lesson' || !ses) return;
  const c = cur();
  if (e.key === 'Enter') {
    e.preventDefault();
    if (ses.state === 'checked') next();
    else if (answerReady(c)) check();
    return;
  }
  if (/^[1-9]$/.test(e.key) && ses.state === 'answering' && c.options) {
    const i = +e.key - 1;
    if (i < c.options.length) { ses.sel = i; render(); }
  }
  if (e.key === 'Backspace' && c.t === 'build' && ses.state === 'answering' && ses.built.length) {
    const tok = ses.built.pop(); delete ses.used[tok.key]; render();
  }
});

render();
})();
