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
      const crowns = S
