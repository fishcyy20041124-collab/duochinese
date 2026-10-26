/* DuoJapanese — 面向中文母语者的日语零基础 MVP 课程（选项领域强关联优化版）
   word     : [日语假名/汉字, 罗马音(romaji), 中文释义, 所属领域分类]
   sentence : [日语句子, 罗马音, 中文分词释义, [日语词块tokens]] */

const COURSE = [
{
  id: 'u1', title: '第一单元：五十音入门', subtitle: '掌握日语发音的基识与字形辨析', color: '#58CC02', icon: '🌸',
  lessons: [
    { id: 'u1l1', title: '元音行 (あ~お)',
      words: [
        ['あ', 'a', '平假名 a', 'vowel'],
        ['い', 'i', '平假名 i', 'vowel'],
        ['う', 'u', '平假名 u', 'vowel'],
        ['え', 'e', '平假名 e', 'vowel'],
        ['お', 'o', '平假名 o', 'vowel'],
      ],
      sentences: [
        ['あい', 'a i', '爱 (あ+い)', ['あ', 'い']],
        ['うえ', 'u e', '上面 (う+え)', ['う', 'え']],
        ['あおい', 'a o i', '蓝色 (あ+お+い)', ['あ', 'お', 'い']],
      ] },
    { id: 'u1l2', title: 'か行假名 (か~こ)',
      words: [
        ['か', 'ka', '平假名 ka', 'ka_row'],
        ['き', 'ki', '平假名 ki', 'ka_row'],
        ['く', 'ku', '平假名 ku', 'ka_row'],
        ['け', 'ke', '平假名 ke', 'ka_row'],
        ['こ', 'ko', '平假名 ko', 'ka_row'],
      ],
      sentences: [
        ['あき', 'a ki', '秋天 (あ+き)', ['あ', 'き']],
        ['こえ', 'ko e', '声音 (こ+え)', ['こ', 'え']],
        ['いけ', 'i ke', '池塘 (い+け)', ['い', 'け']],
      ] },
    { id: 'u1l3', title: '假名拼词实战',
      words: [
        ['あい', 'ai', '爱', 'noun_base'],
        ['うえ', 'ue', '上面', 'noun_base'],
        ['あき', 'aki', '秋天', 'noun_base'],
        ['こえ', 'koe', '声音', 'noun_base'],
        ['かお', 'kao', '脸', 'noun_base'],
      ],
      sentences: [
        ['あき', 'a ki', '秋天', ['あき']],
        ['かお', 'ka o', '脸', ['かお']],
      ] },
    { id: 'u1l4', title: '五十音复习', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u2', title: '第二单元：高频生存词汇', subtitle: '场景化分类：寒暄、美食与人物', color: '#1CB0F6', icon: '🍙',
  lessons: [
    { id: 'u2l1', title: '日常寒暄',
      words: [
        ['こんにちは', 'konnichiwa', '你好', 'greeting'],
        ['ありがとう', 'arigatou', '谢谢', 'greeting'],
        ['すみません', 'sumimasen', '不好意思', 'greeting'],
        ['はい', 'hai', '是', 'response'],
        ['いいえ', 'iie', '不是', 'response'],
      ],
      sentences: [
        ['はい、ありがとう！', 'hai, arigatou', '是 谢谢', ['はい', 'ありがとう']],
        ['すみません、こんにちは。', 'sumimasen, konnichiwa', '不好意思 你好', ['すみません', 'こんにちは']],
      ] },
    { id: 'u2l2', title: '美食与点餐',
      words: [
        ['みず', 'mizu', '水', 'food_drink'],
        ['おちゃ', 'ocha', '茶', 'food_drink'],
        ['すし', 'sushi', '寿司', 'food_drink'],
        ['ラーメン', 'raamen', '拉面', 'food_drink'],
        ['おいしい', 'oishii', '好吃', 'adj'],
      ],
      sentences: [
        ['すし、おいしい！', 'sushi, oishii', '寿司 好吃', ['すし', 'おいしい']],
        ['みず、ありがとう。', 'mizu, arigatou', '水 谢谢', ['みず', 'ありがとう']],
      ] },
    { id: 'u2l3', title: '人物与称呼',
      words: [
        ['わたし', 'watashi', '我', 'person'],
        ['あなた', 'anata', '你', 'person'],
        ['せんせい', 'sensei', '老师', 'person'],
        ['がくせい', 'gakusei', '学生', 'person'],
        ['ともだち', 'tomodachi', '朋友', 'person'],
      ],
      sentences: [
        ['せんせい、こんにちは！', 'sensei, konnichiwa', '老师 你好', ['せんせい', 'こんにちは']],
        ['せんせい、ありがとう。', 'sensei, arigatou', '老师 谢谢', ['せんせい', 'ありがとう']],
      ] },
    { id: 'u2l4', title: '词汇大复习', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u3', title: '第三单元：核心简单句型', subtitle: '语法关联：助词、代词与谓语动词', color: '#CE82FF', icon: '💬',
  lessons: [
    { id: 'u3l1', title: '我是…… (自我介绍)',
      words: [
        ['は', 'wa', '提示主语助词', 'particle'],
        ['です', 'desu', '是', 'verb_aux'],
        ['にほんじん', 'nihonjin', '日本人', 'nationality'],
        ['ちゅうごくじん', 'chuugokujin', '中国人', 'nationality'],
      ],
      sentences: [
        ['わたしはがくせいです。', 'watashi wa gakusei desu', '我 是 学生', ['わたし', 'は', 'がくせい', 'です']],
        ['わたしはちゅうごくじんです。', 'watashi wa chuugokujin desu', '我 是 中国人', ['わたし', 'は', 'ちゅうごくじん', 'です']],
        ['あなたはせんせいです。', 'anata wa sensei desu', '你 是 老师', ['あなた', 'は', 'せんせい', 'です']],
      ] },
    { id: 'u3l2', title: '这是什么？ (指示代词)',
      words: [
        ['これ', 'kore', '这个', 'pronoun'],
        ['それ', 'sore', '那个', 'pronoun'],
        ['なに', 'nani', '什么', 'pronoun'],
        ['か', 'ka', '疑问助词(吗)', 'particle'],
      ],
      sentences: [
        ['これはみずです。', 'kore wa mizu desu', '这个 是 水', ['これ', 'は', 'みず', 'です']],
        ['それはおちゃですか？', 'sore wa ocha desu ka', '那个 是 茶 吗', ['それ', 'は', 'おちゃ', 'です', 'か']],
        ['これはなにですか？', 'kore wa nani desu ka', '这个 是 什么 吗', ['これ', 'は', 'なに', 'です', 'か']],
      ] },
    { id: 'u3l3', title: '表达喜好与请求',
      words: [
        ['すき', 'suki', '喜欢', 'adj_verb'],
        ['が', 'ga', '提示对象助词', 'particle'],
        ['ください', 'kudasai', '请给我', 'verb_aux'],
        ['を', 'o', '宾语助词', 'particle'],
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

/* ---- 领域优先的智能干扰项匹配引擎 ---------------------------------------------------- */

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

/* 核心升级：优先从相同分类（field）中挑选干扰项，确保选项属于同一领域 */
function getSmartDistractors(targetWord, n) {
  const targetField = targetWord[3]; // 获取当前词的分类标签
  // 1. 优先寻找同类分类的词汇
  let sameFieldPool = ALL_WORDS.filter(w => w[0] !== targetWord[0] && w[3] === targetField);
  
  // 如果同类池不够，用全站词汇补充
  if (sameFieldPool.length < n) {
    const otherPool = ALL_WORDS.filter(w => w[0] !== targetWord[0] && w[3] !== targetField);
    sameFieldPool = sameFieldPool.concat(otherPool);
  }
  
  // 随机洗牌并截取需要的数量
  const shuffled = sameFieldPool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
