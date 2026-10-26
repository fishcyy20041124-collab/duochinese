/* DuoJapanese — 面向中文母语者的日语零基础 MVP 课程
   word     : [日语假名/汉字, 罗马音(romaji), 中文释义]
   sentence : [日语句子, 罗马音, 中文分词释义(用空格分隔供造句使用), [日语词块tokens]] */

const COURSE = [
{
  id: 'u1', title: '第一单元：五十音入门', subtitle: '掌握日语发音的基石', color: '#58CC02', icon: '🌸',
  lessons: [
    { id: 'u1l1', title: '元音行 (あ~お)',
      words: [
        ['あ', 'a', '平假名 a'],
        ['い', 'i', '平假名 i'],
        ['う', 'u', '平假名 u'],
        ['え', 'e', '平假名 e'],
        ['お', 'o', '平假名 o'],
      ],
      sentences: [
        ['あい', 'a i', '爱 (あ+い)', ['あ', 'い']],
        ['うえ', 'u e', '上面 (う+え)', ['う', 'え']],
        ['あおい', 'a o i', '蓝色 (あ+お+い)', ['あ', 'お', 'い']],
      ] },
    { id: 'u1l2', title: 'か行假名 (か~こ)',
      words: [
        ['か', 'ka', '平假名 ka'],
        ['き', 'ki', '平假名 ki'],
        ['く', 'ku', '平假名 ku'],
        ['け', 'ke', '平假名 ke'],
        ['こ', 'ko', '平假名 ko'],
      ],
      sentences: [
        ['あき', 'a ki', '秋天 (あ+き)', ['あ', 'き']],
        ['こえ', 'ko e', '声音 (こ+え)', ['こ', 'え']],
        ['いけ', 'i ke', '池塘 (い+け)', ['い', 'け']],
      ] },
    { id: 'u1l3', title: '假名拼词实战',
      words: [
        ['あい', 'ai', '爱'],
        ['うえ', 'ue', '上面'],
        ['あき', 'aki', '秋天'],
        ['こえ', 'koe', '声音'],
        ['かお', 'kao', '脸'],
      ],
      sentences: [
        ['あき', 'a ki', '秋天', ['あき']],
        ['かお', 'ka o', '脸', ['かお']],
      ] },
    { id: 'u1l4', title: '五十音复习', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u2', title: '第二单元：高频生存词汇', subtitle: '开口就能用的日常表达', color: '#1CB0F6', icon: '🍙',
  lessons: [
    { id: 'u2l1', title: '日常寒暄',
      words: [
        ['こんにちは', 'konnichiwa', '你好'],
        ['ありがとう', 'arigatou', '谢谢'],
        ['すみません', 'sumimasen', '不好意思'],
        ['はい', 'hai', '是'],
        ['いいえ', 'iie', '不是'],
      ],
      sentences: [
        ['はい、ありがとう！', 'hai, arigatou', '是 谢谢', ['はい', 'ありがとう']],
        ['すみません、こんにちは。', 'sumimasen, konnichiwa', '不好意思 你好', ['すみません', 'こんにちは']],
      ] },
    { id: 'u2l2', title: '美食与点餐',
      words: [
        ['みず', 'mizu', '水'],
        ['おちゃ', 'ocha', '茶'],
        ['すし', 'sushi', '寿司'],
        ['ラーメン', 'raamen', '拉面'],
        ['おいしい', 'oishii', '好吃'],
      ],
      sentences: [
        ['すし、おいしい！', 'sushi, oishii', '寿司 好吃', ['すし', 'おいしい']],
        ['みず、ありがとう。', 'mizu, arigatou', '水 谢谢', ['みず', 'ありがとう']],
      ] },
    { id: 'u2l3', title: '人物与称呼',
      words: [
        ['わたし', 'watashi', '我'],
        ['あなた', 'anata', '你'],
        ['せんせい', 'sensei', '老师'],
        ['がくせい', 'gakusei', '学生'],
        ['ともだち', 'tomodachi', '朋友'],
      ],
      sentences: [
        ['せんせい、こんにちは！', 'sensei, konnichiwa', '老师 你好', ['せんせい', 'こんにちは']],
        ['せんせい、ありがとう。', 'sensei, arigatou', '老师 谢谢', ['せんせい', 'ありがとう']],
      ] },
    { id: 'u2l4', title: '词汇大复习', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u3', title: '第三单元：核心简单句型', subtitle: '像搭积木一样拼出日语句子', color: '#CE82FF', icon: '💬',
  lessons: [
    { id: 'u3l1', title: '我是…… (自我介绍)',
      words: [
        ['は', 'wa', '提示主语助词'],
        ['です', 'desu', '是'],
        ['にほんじん', 'nihonjin', '日本人'],
        ['ちゅうごくじん', 'chuugokujin', '中国人'],
      ],
      sentences: [
        ['わたしはがくせいです。', 'watashi wa gakusei desu', '我 是 学生', ['わたし', 'は', 'がくせい', 'です']],
        ['わたしはちゅうごくじんです。', 'watashi wa chuugokujin desu', '我 是 中国人', ['わたし', 'は', 'ちゅうごくじん', 'です']],
        ['あなたはせんせいです。', 'anata wa sensei desu', '你 是 老师', ['あなた', 'は', 'せんせい', 'です']],
      ] },
    { id: 'u3l2', title: '这是什么？ (指示代词)',
      words: [
        ['これ', 'kore', '这个'],
        ['それ', 'sore', '那个'],
        ['なに', 'nani', '什么'],
        ['か', 'ka', '疑问助词(吗)'],
      ],
      sentences: [
        ['これはみずです。', 'kore wa mizu desu', '这个 是 水', ['これ', 'は', 'みず', 'です']],
        ['それはおちゃですか？', 'sore wa ocha desu ka', '那个 是 茶 吗', ['それ', 'は', 'おちゃ', 'です', 'か']],
        ['これはなにですか？', 'kore wa nani desu ka', '这个 是 什么 吗', ['これ', 'は', 'なに', 'です', 'か']],
      ] },
    { id: 'u3l3', title: '表达喜好与请求',
      words: [
        ['すき', 'suki', '喜欢'],
        ['が', 'ga', '提示对象助词'],
        ['ください', 'kudasai', '请给我'],
        ['を', 'o', '宾语助词'],
      ],
      sentences: [
        ['わたしはすしがすきです。', 'watashi wa sushi ga suki desu', '我 喜欢 寿司', ['わたし', 'は', 'すし', 'が', 'すき', 'です']],
        ['みずをください。', 'mizu o kudasai', '请给我 水', ['みず', 'を', 'ください']],
        ['ラーメンをください。', 'raamen o kudasai', '请给我 拉面', ['ラーメン', 'を', 'ください']],
      ] },
    { id: 'u3l4', title: '句型总复习', review: true, words: [], sentences: [] },
  ],
},
];

const EXTRA_WORDS = [];

/* ---- derived lookups ---------------------------------------------------- */

const WORD_INDEX = (() => {
  const m = new Map();
  for (const w of EXTRA_WORDS) m.set(w[0], w);
  for (const u of COURSE) for (const l of u.lessons) for (const w of l.words) m.set(w[0], w);
  return m;
})();

for (const u of COURSE) {
  for (const l of u.lessons) {
    if (!l.review) continue;
    const prior = u.lessons.filter(x => !x.review);
    l.words = prior.flatMap(x => x.words);
    l.sentences = prior.flatMap(x => x.sentences);
  }
}

const ALL_LESSONS = COURSE.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })));

function lessonById(id) { return ALL_LESSONS.find(l => l.id === id); }
function pinyinOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[1] : hz; }
function meaningOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[2] : hz; }
