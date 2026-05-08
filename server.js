const express = require('express');
const { astro } = require('iztro');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const HOUR_MAP = {
  '子時': 0, '丑時': 1, '寅時': 2, '卯時': 3,
  '辰時': 4, '巳時': 5, '午時': 6, '未時': 7,
  '申時': 8, '酉時': 9, '戌時': 10, '亥時': 11,
};

const PALACE_DESC = {
  '命宮': '外在個性、氣質與一生命運走向',
  '兄弟': '兄弟姊妹緣份及朋友、平輩關係',
  '夫妻': '婚姻感情、伴侶特質',
  '子女': '子女緣份、部屬及創意能量',
  '財帛': '財運、理財能力與金錢觀',
  '疾厄': '健康狀態、身體弱點',
  '遷移': '出外運、異鄉發展與人際際遇',
  '僕役': '朋友、下屬、合作夥伴關係',
  '官祿': '事業、工作、成就與名望',
  '田宅': '不動產、家庭環境與祖蔭',
  '福德': '精神生活、享受與福氣',
  '父母': '父母緣份、上司關係與文書官司',
};

const PALACE_FLOW = {
  '命宮': { theme: '個人形象', advice: '本月關注自身發展，適合展現自我、建立個人品牌，重要決策宜主動出擊。' },
  '兄弟': { theme: '人際平輩', advice: '本月平輩人際活躍，朋友互動多，善加利用人脈，注意口舌是非。' },
  '夫妻': { theme: '感情婚姻', advice: '本月感情事項突出，感情宜多溝通增進關係，婚姻中注意伴侶需求。' },
  '子女': { theme: '創意部屬', advice: '本月適合創新思維與管理下屬，子女相關事宜需多關注。' },
  '財帛': { theme: '財運金錢', advice: '本月財運波動明顯，注意收支平衡，投資理財宜保守謹慎。' },
  '疾厄': { theme: '健康身體', advice: '本月注意身體健康，避免過勞，飲食作息要規律，定期健檢。' },
  '遷移': { theme: '出外異動', advice: '本月適合出差、旅行或更換環境，外出有助運勢，貴人在外。' },
  '僕役': { theme: '合作夥伴', advice: '本月合作事項活躍，下屬管理需用心，注意合夥契約細節。' },
  '官祿': { theme: '事業工作', advice: '本月事業運強旺，適合衝刺目標、爭取升遷，主動積極有回報。' },
  '田宅': { theme: '不動產家庭', advice: '本月家庭事項多，家人關係需多維護，不動產相關交易宜謹慎。' },
  '福德': { theme: '精神福氣', advice: '本月心情愉快，適合休閒充電、靜心思考，學習或修身養性佳。' },
  '父母': { theme: '長輩文書', advice: '本月長輩互動增多，文件合約需仔細閱讀，與上司溝通機會多。' },
};

const STAR_PERSONALITY = {
  '紫微': {
    title: '紫微星', tags: ['領袖氣質', '自尊心強', '有謀略'],
    summary: '紫微為帝王之星，命宮坐紫微者，天生具有領導氣場，自尊心強，重視地位與尊嚴。處事穩重、有主見，善於統御他人，但有時過於自我，不易聽取他人意見。',
    strength: '領導力強、沉著穩重、有遠見、受人敬重',
    weakness: '自我意識過強、不易妥協、對他人要求高',
    career: '適合管理、政治、高階主管、創業',
    relationship: '感情主動性高，但需放下身段，避免讓伴侶感到壓力',
  },
  '天機': {
    title: '天機星', tags: ['聰明靈活', '善於謀略', '思慮周全'],
    summary: '天機為智慧之星，思維敏捷、善於分析，點子多、愛學習，對新事物充滿好奇。但思慮過多容易焦慮，難以下定決心，凡事多變化是其特色。',
    strength: '聰明機智、善於學習、反應快、思慮細膩',
    weakness: '善變、猶豫不決、想太多容易鑽牛角尖',
    career: '適合策略規劃、研究分析、顧問、IT、教育',
    relationship: '感情細膩，但多變不穩定，需要精神上的交流與共鳴',
  },
  '太陽': {
    title: '太陽星', tags: ['熱情開朗', '慷慨大方', '重名譽'],
    summary: '太陽為光明之星，個性外向開朗，熱情慷慨，重視名譽與社會地位，天生具有公眾魅力。男命最吉，喜歡付出，但也容易耗損自身能量。',
    strength: '熱情積極、人緣好、正義感強、有號召力',
    weakness: '過度付出、愛面子、容易過勞',
    career: '適合公關、政治、公益、業務、媒體',
    relationship: '感情熱烈，付出多，需注意對等關係',
  },
  '武曲': {
    title: '武曲星', tags: ['果斷剛毅', '重實際', '財帛主星'],
    summary: '武曲為財帛之星，個性剛毅果斷、重實際、不拖泥帶水。行動力強，目標明確，對金錢有敏銳直覺。處事乾脆，但有時顯得冷漠或強硬。',
    strength: '執行力強、果斷、務實、財運佳',
    weakness: '過於強硬、不善表達情感、人際關係較冷漠',
    career: '適合金融、投資、軍警、工程、外科醫師',
    relationship: '感情上不善表達，但忠誠可靠，需對方主動溝通',
  },
  '天同': {
    title: '天同星', tags: ['溫和隨和', '享受生活', '福氣星'],
    summary: '天同為福星，個性溫和隨和，喜歡舒適愉快的生活，重視精神享受。心地善良，不喜競爭，但有時過於被動，缺乏進取心，容易安於現狀。',
    strength: '溫和寬厚、人緣佳、生活品味高、心態平和',
    weakness: '缺乏野心、依賴性強、遇困難容易逃避',
    career: '適合服務業、藝術、教育、社福、休閒娛樂',
    relationship: '感情溫和體貼，但需注意過於順從造成失去自我',
  },
  '廉貞': {
    title: '廉貞星', tags: ['個性強烈', '才藝出眾', '多欲望'],
    summary: '廉貞為次桃花星，個性強烈，才藝豐富，有藝術天賦，欲望旺盛。處事積極，有創意，但情緒起伏大，容易陷入是非糾紛。',
    strength: '才藝多元、個性鮮明、執行力強、魅力十足',
    weakness: '情緒化、多欲、容易捲入是非',
    career: '適合藝術、娛樂、法律、政治、創業',
    relationship: '感情濃烈、感染力強，但感情路易有波折',
  },
  '天府': {
    title: '天府星', tags: ['穩重保守', '重積累', '南斗主星'],
    summary: '天府為財庫之星，個性穩重保守，重視物質安全感，善於積累財富與資源。處事謹慎，不輕易冒險，有計劃性，但有時過於保守，錯失機會。',
    strength: '穩重踏實、積累能力強、處事謹慎、理財有道',
    weakness: '過於保守、缺乏創新、固執己見',
    career: '適合財務、銀行、地產、管理、行政',
    relationship: '感情穩重踏實，重視家庭，是可靠的伴侶',
  },
  '太陰': {
    title: '太陰星', tags: ['細膩感性', '藝術氣質', '財富星'],
    summary: '太陰為月亮之星，個性細膩感性，具有藝術氣質，直覺敏銳，重視內在感受。女命最吉，男命需注意情緒波動。對美有高度敏感，喜歡安靜優雅的環境。',
    strength: '細膩溫柔、藝術感強、直覺準確、氣質出眾',
    weakness: '情緒起伏大、敏感脆弱、容易鑽牛角尖',
    career: '適合藝術、設計、文學、諮商、美容美學',
    relationship: '感情細膩深情，但情緒化易讓關係緊繃',
  },
  '貪狼': {
    title: '貪狼星', tags: ['多才多藝', '欲望旺盛', '桃花之星'],
    summary: '貪狼為桃花之星，個性多才多藝，魅力十足，欲望旺盛，好奇心強，喜歡嘗試新事物。社交能力強，但容易貪多嚼不爛，需培養專注力。',
    strength: '魅力迷人、多才多藝、社交力強、學習能力佳',
    weakness: '欲望過多、不夠專注、容易受誘惑',
    career: '適合公關、銷售、娛樂、藝術、餐飲業',
    relationship: '桃花旺盛，感情生活豐富，需注意專一',
  },
  '巨門': {
    title: '巨門星', tags: ['口才出眾', '善辯析', '多思慮'],
    summary: '巨門為是非之星，口才出眾，思慮深邃，善於分析與辯論。凡事喜歡追根究柢，有探究精神。但容易製造或陷入口舌是非，且多疑，人際關係需多用心。',
    strength: '口才佳、分析力強、思慮深刻、有說服力',
    weakness: '多疑、愛爭論、易陷口舌是非',
    career: '適合律師、演說、媒體、教育、顧問、談判',
    relationship: '感情上多溝通是優點，但多疑與爭論需節制',
  },
  '天相': {
    title: '天相星', tags: ['溫文爾雅', '重規矩', '印綬之星'],
    summary: '天相為印綬之星，個性溫文爾雅，重規矩與秩序，處事公正，有原則。善於協調，具服務精神，是天生的輔佐型人才。但有時過於保守，缺乏突破。',
    strength: '溫和有禮、公正謹慎、協調力強、值得信賴',
    weakness: '過於保守、依賴性強、缺乏獨立判斷',
    career: '適合行政、秘書、法律、協調管理、公務員',
    relationship: '感情忠誠體貼，重視儀式感與承諾',
  },
  '天梁': {
    title: '天梁星', tags: ['慈悲正直', '長者風範', '化蔭星'],
    summary: '天梁為蔭星，具有長者風範，個性正直慈悲，喜歡照顧他人，有保護弱者的使命感。處事有原則，不隨波逐流，但有時顯得固執或說教。',
    strength: '正直慈悲、有擔當、原則性強、受人信賴',
    weakness: '固執、愛說教、有時顯得清高',
    career: '適合醫療、宗教、社工、法律、教育、長輩照護',
    relationship: '感情照顧型，但需注意不要過於強勢主導',
  },
  '七殺': {
    title: '七殺星', tags: ['剛強獨立', '魄力十足', '孤剋之星'],
    summary: '七殺為將星，個性剛強獨立，有魄力，行動力強，不畏困難。天生的開創型人才，勇於挑戰。但有時獨斷獨行，不善與人合作，感情路較坎坷。',
    strength: '執行力強、勇敢果斷、開創能力強、不服輸',
    weakness: '剛愎自用、不善合作、情緒衝動',
    career: '適合創業、軍警、外科、運動競技、業務開拓',
    relationship: '感情路波折，需學習柔軟與溝通',
  },
  '破軍': {
    title: '破軍星', tags: ['開創革新', '破舊立新', '耗星'],
    summary: '破軍為耗星，個性開創革新，不喜守舊，充滿改革精神。對現狀充滿挑戰欲，喜歡突破框架。但破壞力強，人生起伏大，需有再生的心理準備。',
    strength: '創新能力強、突破力強、不怕改變、有開創精神',
    weakness: '破壞力強、不穩定、人生起伏大',
    career: '適合創業、改革型工作、創意產業、軍事、運動',
    relationship: '感情多波折，但熱情真誠，需穩定的伴侶平衡',
  },
};

const EMPTY_MING_PERSONALITY = {
  title: '空宮（借對宮主星）', tags: ['受環境影響大', '可塑性強', '借力使力'],
  summary: '命宮無主星，需借對宮星曜論命。此類型個性可塑性強，受環境與周圍人影響較大，但也因此適應力強，善於借助他人力量來成就自己。',
  strength: '適應力強、可塑性高、善於借力',
  weakness: '個性較不鮮明、易受外界影響',
  career: '依對宮主星而定，通常較能配合環境調整自己',
  relationship: '感情上較為配合，易受伴侶影響',
};

function getMingPersonality(majorStars) {
  if (!majorStars || majorStars.length === 0) return EMPTY_MING_PERSONALITY;
  if (majorStars.length === 1) return STAR_PERSONALITY[majorStars[0]] || EMPTY_MING_PERSONALITY;
  const main = STAR_PERSONALITY[majorStars[0]];
  if (!main) return EMPTY_MING_PERSONALITY;
  return {
    ...main,
    title: `${majorStars.join('＋')}`,
    tags: [...(main.tags || []), `${majorStars[1]}特質加持`],
    summary: `命宮坐${majorStars.join('＋')}。` + main.summary +
      (STAR_PERSONALITY[majorStars[1]]
        ? `\n\n同時受${majorStars[1]}影響：` + STAR_PERSONALITY[majorStars[1]].summary : ''),
  };
}

// 流年四化評估（判斷吉凶傾向）
function getYearlyScore(mutagen, palaceFlow) {
  const [lu, quan, ke, ji] = mutagen;
  const flowDesc = PALACE_FLOW[palaceFlow] || {};
  // 有化祿落在事業財帛官祿：偏吉；化忌落在財帛疾厄：需注意
  const goodPalaces = ['命宮', '官祿', '財帛', '遷移', '福德'];
  const alertPalaces = ['疾厄', '夫妻', '兄弟'];
  let score = 'neutral';
  if (goodPalaces.includes(palaceFlow)) score = 'good';
  if (alertPalaces.includes(palaceFlow)) score = 'alert';
  return { ...flowDesc, mutagen: { lu, quan, ke, ji }, score };
}

app.post('/api/chart', (req, res) => {
  const { name, gender, solarDate, timeKey } = req.body;
  if (!name || !gender || !solarDate || !timeKey) {
    return res.status(400).json({ error: '請填寫所有欄位' });
  }
  const hourNum = HOUR_MAP[timeKey];
  if (hourNum === undefined) {
    return res.status(400).json({ error: '無效的出生時辰' });
  }

  try {
    const iztroGender = gender === 'male' ? 'male' : 'female';
    const chart = astro.astrolabeBySolarDate(solarDate, hourNum, iztroGender, true, 'zh-TW');
    const mingGong = chart.palace('命宮');
    const lunarDate = chart.rawDates.lunarDate;

    const palaces = chart.palaces.map(p => ({
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      majorStars: p.majorStars?.map(s => ({ name: s.name, mutagen: s.mutagen })) || [],
      minorStars: p.minorStars?.map(s => s.name) || [],
      isMingGong: p.name === '命宮',
      isBodyPalace: p.earthlyBranch === chart.bodyPalace,
      description: PALACE_DESC[p.name] || '',
    }));

    // 大限
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(solarDate.split('-')[0]);
    const currentAge = currentYear - birthYear;
    const decadalList = chart.palaces
      .filter(p => p.decadal?.range)
      .map(p => ({
        palaceName: p.name,
        heavenlyStem: p.decadal.heavenlyStem,
        decadalBranch: p.decadal.earthlyBranch,
        range: p.decadal.range,
        majorStars: p.majorStars?.map(s => ({ name: s.name, mutagen: s.mutagen })) || [],
        isCurrent: currentAge >= p.decadal.range[0] && currentAge <= p.decadal.range[1],
      }))
      .sort((a, b) => a.range[0] - b.range[0]);

    // 流年分析（固定 2026 年）
    const yearlyH = chart.horoscope('2026-06-01', hourNum);
    const yearly = yearlyH.yearly;
    const yearlyMingPalace = yearly.palaceNames[0];
    const yearlyInfo = getYearlyScore(yearly.mutagen, yearlyMingPalace);

    const monthlyAnalysis = [];
    for (let m = 1; m <= 12; m++) {
      const dateStr = `2026-${String(m).padStart(2, '0')}-15`;
      const h = chart.horoscope(dateStr, hourNum);
      const monthly = h.monthly;
      const flowPalace = monthly.palaceNames[0];
      const info = getYearlyScore(monthly.mutagen, flowPalace);
      monthlyAnalysis.push({
        month: m,
        heavenlyStem: monthly.heavenlyStem,
        earthlyBranch: monthly.earthlyBranch,
        flowPalace,
        theme: info.theme || '',
        advice: info.advice || '',
        mutagen: monthly.mutagen,
        score: info.score,
      });
    }

    const mingStarNames = mingGong.majorStars?.map(s => s.name) || [];

    res.json({
      name,
      gender: gender === 'male' ? '男' : '女',
      solarDate,
      timeKey,
      lunarDate: `農曆 ${lunarDate.lunarYear} 年 ${lunarDate.lunarMonth} 月 ${lunarDate.lunarDay} 日${lunarDate.isLeap ? '（閏月）' : ''}`,
      yearlyBranch: chart.rawDates.chineseDate.yearly.join(''),
      fiveElementsClass: chart.fiveElementsClass,
      mingGong: {
        heavenlyStem: mingGong.heavenlyStem,
        earthlyBranch: mingGong.earthlyBranch,
        majorStars: mingStarNames,
      },
      bodyPalace: chart.bodyPalace,
      zodiac: chart.zodiac,
      palaces,
      personality: getMingPersonality(mingStarNames),
      decadalList,
      currentAge,
      yearlyAnalysis: {
        year: 2026,
        ganzhi: `${yearly.heavenlyStem}${yearly.earthlyBranch}年`,
        mingPalace: yearlyMingPalace,
        mutagen: yearly.mutagen,
        theme: yearlyInfo.theme || '',
        advice: yearlyInfo.advice || '',
        score: yearlyInfo.score,
        monthlyAnalysis,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '排盤失敗：' + err.message });
  }
});

// ==================== 八字模組 ====================

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_ELEM = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
const STEM_YY = {'甲':'陽','乙':'陰','丙':'陽','丁':'陰','戊':'陽','己':'陰','庚':'陽','辛':'陰','壬':'陽','癸':'陰'};
const BRANCH_ELEM = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
const GEN = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
const CON = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
const SIXTY = Array.from({length:60}, (_,i) => STEMS[i%10] + BRANCHES[i%12]);

const ELEM_COLOR = {'木':'#6db86d','火':'#e07060','土':'#c8a84e','金':'#b8c8e8','水':'#6090d0'};

function getTenGod(dm, ts) {
  const de = STEM_ELEM[dm], te = STEM_ELEM[ts];
  const sy = STEM_YY[dm] === STEM_YY[ts];
  if (de === te) return sy ? '比肩' : '劫財';
  if (GEN[de] === te) return sy ? '食神' : '傷官';
  if (GEN[te] === de) return sy ? '偏印' : '正印';
  if (CON[de] === te) return sy ? '偏財' : '正財';
  if (CON[te] === de) return sy ? '七殺' : '正官';
  return '—';
}

const DAY_MASTER_PERSONALITY = {
  '甲': { element:'木', yinYang:'陽', symbol:'參天大樹', tags:['剛直正義','積極進取','理想主義'],
    summary:'甲木為陽木，如參天大樹，個性剛直正義，有強烈的上進心與目標感。天生具有領袖氣質，不喜受拘束，喜歡開創新局。意志力堅強，但有時固執己見，不易妥協。',
    strength:'意志堅定、執行力強、有理想抱負、正直坦率', weakness:'固執、不善變通、有時自以為是',
    career:'適合管理、法律、建築、教育、創業', relationship:'感情專一直接，但偶爾過於剛硬，需學習柔軟' },
  '乙': { element:'木', yinYang:'陰', symbol:'藤蔓花草', tags:['柔韌適應','溫和細膩','善於處世'],
    summary:'乙木為陰木，如藤蔓花草，柔韌而有生命力。個性溫和細膩，善於適應環境，有藝術感與美感。處世靈活，善於借助他人之力，但有時缺乏主見。',
    strength:'適應力強、溫柔體貼、藝術天賦、人際關係好', weakness:'優柔寡斷、過於依賴他人、缺乏主見',
    career:'適合藝術、設計、教育、服務業', relationship:'感情細膩溫柔，善於付出，需注意不要失去自我' },
  '丙': { element:'火', yinYang:'陽', symbol:'太陽之火', tags:['熱情開朗','慷慨大方','社交達人'],
    summary:'丙火為陽火，如太陽般耀眼，個性熱情開朗、積極外向，天生的社交達人。充滿活力與創造力，喜歡展現自我，對他人慷慨。但有時過於衝動，需學習沉著。',
    strength:'熱情積極、號召力強、創造力旺盛、慷慨大方', weakness:'衝動、過於外向消耗能量、注意力分散',
    career:'適合公關、業務、演藝、政治、創意產業', relationship:'感情熱烈奔放，有魅力，需注意持久性' },
  '丁': { element:'火', yinYang:'陰', symbol:'燈燭之火', tags:['細膩溫暖','有藝術感','持久沉穩'],
    summary:'丁火為陰火，如燈燭溫暖而持久，個性細膩溫暖，有藝術與靈性氣質。思維深邃，重視情感交流，有強烈的內在世界。處事沉穩，但有時過於敏感。',
    strength:'細膩體貼、藝術天賦、思慮深刻、情感豐富', weakness:'過於敏感、情緒波動、容易鑽牛角尖',
    career:'適合藝術、文學、心理諮商、教育', relationship:'感情深情專一，注重心靈交流' },
  '戊': { element:'土', yinYang:'陽', symbol:'廣闊大地', tags:['穩重踏實','包容力強','務實可靠'],
    summary:'戊土為陽土，如廣闊大地，包容萬物。個性穩重踏實，責任感強，有強大的包容力。處事可靠，重視信用與承諾。但有時過於保守，思想較為傳統。',
    strength:'可靠踏實、包容力強、責任心重、意志堅定', weakness:'思想保守、行動遲緩、過於固執傳統',
    career:'適合地產、金融、農業、管理、工程', relationship:'感情穩重忠誠，是可靠的伴侶，但需增加浪漫感' },
  '己': { element:'土', yinYang:'陰', symbol:'田園沃土', tags:['細緻踏實','親和力強','謹慎細心'],
    summary:'己土為陰土，如田園沃土，滋養萬物。個性細緻親和，做事謹慎細心，善於照顧他人。有服務精神，重視細節，但有時過於謹小慎微，缺乏魄力。',
    strength:'細緻踏實、親和力強、服務精神好、謹慎負責', weakness:'缺乏魄力、過於謹慎、容易優柔寡斷',
    career:'適合行政、服務業、醫療護理、教育', relationship:'感情體貼細心，是溫柔的伴侶' },
  '庚': { element:'金', yinYang:'陽', symbol:'鋼刀利劍', tags:['剛強果決','行動力強','義氣當先'],
    summary:'庚金為陽金，如鋼刀利劍，剛強銳利。個性果決剛強，行動力強，重義氣，有正義感。處事乾脆俐落，不拖泥帶水，但有時過於強硬，不知變通。',
    strength:'果決勇敢、執行力強、義氣重情、不服輸', weakness:'過於剛硬、不善變通、易與人衝突',
    career:'適合軍警、外科、金融、法律、運動競技', relationship:'感情直接坦率，忠誠義氣，需學習表達柔情' },
  '辛': { element:'金', yinYang:'陰', symbol:'珠寶首飾', tags:['精緻優雅','自尊心強','審美出眾'],
    summary:'辛金為陰金，如珠寶首飾，精緻而有質感。個性優雅細緻，自尊心強，重視品質與美感。有藝術鑑賞力，但有時過於自傲，或在意他人眼光。',
    strength:'精緻優雅、品味出眾、審美能力強、有質感', weakness:'自尊心過強、過度在意外表與評價',
    career:'適合藝術、珠寶、美容、設計、外交', relationship:'感情精緻浪漫，重視儀式感，對伴侶有一定要求' },
  '壬': { element:'水', yinYang:'陽', symbol:'江河大海', tags:['智慧廣博','包容靈動','善謀策略'],
    summary:'壬水為陽水，如江河大海，廣闊深遠。個性智慧靈動，思維廣博，善於謀略。適應力強，善於察言觀色。有大格局的視野，但有時過於飄忽，缺乏定性。',
    strength:'智慧廣博、應變能力強、有大局觀、包容性高', weakness:'定性不足、善變、有時過於算計',
    career:'適合策略規劃、外交、貿易、媒體、顧問', relationship:'感情靈動多變，魅力十足，需培養穩定感' },
  '癸': { element:'水', yinYang:'陰', symbol:'雨露甘霖', tags:['細膩敏感','直覺準確','溫柔滋潤'],
    summary:'癸水為陰水，如雨露甘霖，滋潤萬物。個性細膩敏感，直覺準確，善於感受他人情感。內心世界豐富，有藝術與靈性氣質。但有時過於感性，情緒起伏大。',
    strength:'直覺敏銳、細膩溫柔、藝術感強、同理心強', weakness:'情緒化、過於敏感、容易多愁善感',
    career:'適合藝術、諮商、醫療、寫作、靈性探索', relationship:'感情深情細膩，善於感受伴侶需求' },
};

const BAZI_FLOW_ADVICE = {
  '比肩': { theme:'競爭合作', advice:'今年同行競爭增多，適合發展合作關係，可借同儕力量共同成長，需防因人際而有財務損耗。' },
  '劫財': { theme:'財運起伏', advice:'今年財運波動明顯，需防因人破財，投資理財宜保守，善用人際關係可化解風險。' },
  '食神': { theme:'才藝表現', advice:'今年表現機會多，適合展現才華與創意，生活享受豐富，是創業或從事創意工作的好時機。' },
  '傷官': { theme:'突破創新', advice:'今年有強烈突破欲望，適合改革創新或開展新事業，但需注意與上司長輩的關係。' },
  '偏財': { theme:'偏財機遇', advice:'今年偏財旺，貴人相助帶來意外機遇，適合業務開拓與投資，需積極把握。' },
  '正財': { theme:'穩定收入', advice:'今年正財旺，收入穩定增加，適合長期投資與儲蓄，工作踏實可獲相應回報。' },
  '七殺': { theme:'挑戰壓力', advice:'今年競爭與挑戰增強，壓力較大，但可激發潛能突破，需謹防意外健康與訴訟風險。' },
  '正官': { theme:'事業升遷', advice:'今年事業運強，升遷機會多，適合求職或爭取晉升，職場表現受到肯定。' },
  '偏印': { theme:'學習充電', advice:'今年學習運強，適合進修充電、研究探索，貴人暗助，需防過度依賴或懶散。' },
  '正印': { theme:'學術貴人', advice:'今年得長輩貴人提攜，文書考試順利，適合進修取得資格認證，得官方認可。' },
};

function getBaziDecadal(monthStem, monthBranch, gender, yearStem, birthYear, birthDay) {
  const isYangYear = STEM_YY[yearStem] === '陽';
  const isMale = gender === 'male';
  const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);
  const dir = isForward ? 1 : -1;

  // Approximate starting age using distance to nearest solar term (节 ≈ day 6 of each month)
  const termDay = 6;
  const days = isForward
    ? (birthDay < termDay ? termDay - birthDay : 30 - birthDay + termDay)
    : (birthDay > termDay ? birthDay - termDay : birthDay + 24);
  const startAge = Math.max(1, Math.round(days / 3));

  const monthIdx = SIXTY.findIndex(gz => gz[0] === monthStem && gz[1] === monthBranch);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  return {
    direction: isForward ? '順行' : '逆行',
    startAge,
    limits: Array.from({length: 8}, (_, i) => {
      const idx = ((monthIdx + dir * (i + 1)) % 60 + 60) % 60;
      const gz = SIXTY[idx];
      const ageStart = startAge + i * 10;
      return {
        ganzhi: gz,
        stem: gz[0],
        branch: gz[1],
        stemElement: STEM_ELEM[gz[0]],
        branchElement: BRANCH_ELEM[gz[1]],
        ageRange: [ageStart, ageStart + 9],
        isCurrent: currentAge >= ageStart && currentAge <= ageStart + 9,
      };
    }),
  };
}

app.post('/api/bazi', (req, res) => {
  const { name, gender, solarDate, timeKey } = req.body;
  if (!name || !gender || !solarDate || !timeKey) {
    return res.status(400).json({ error: '請填寫所有欄位' });
  }
  const hourNum = HOUR_MAP[timeKey];
  if (hourNum === undefined) return res.status(400).json({ error: '無效的出生時辰' });

  try {
    const iztroGender = gender === 'male' ? 'male' : 'female';
    const chart = astro.astrolabeBySolarDate(solarDate, hourNum, iztroGender, true, 'zh-TW');
    const cd = chart.rawDates.chineseDate;

    const [yearStem, yearBranch] = cd.yearly;
    const [monthStem, monthBranch] = cd.monthly;
    const [dayStem, dayBranch] = cd.daily;
    const [hourStem, hourBranch] = cd.hourly;
    const dayMaster = dayStem;

    const pillars = [
      { label:'年柱', pos:'年', stem:yearStem,  branch:yearBranch  },
      { label:'月柱', pos:'月', stem:monthStem, branch:monthBranch },
      { label:'日柱', pos:'日', stem:dayStem,   branch:dayBranch,  isDayMaster:true },
      { label:'時柱', pos:'時', stem:hourStem,  branch:hourBranch  },
    ].map(p => ({
      ...p,
      stemElement:  STEM_ELEM[p.stem],
      stemYinYang:  STEM_YY[p.stem],
      branchElement: BRANCH_ELEM[p.branch],
      tenGod: p.isDayMaster ? '日主' : getTenGod(dayMaster, p.stem),
    }));

    const fiveElements = {'木':0,'火':0,'土':0,'金':0,'水':0};
    for (const p of pillars) {
      fiveElements[p.stemElement]++;
      fiveElements[p.branchElement]++;
    }

    const birthYear = parseInt(solarDate.split('-')[0]);
    const birthDay  = parseInt(solarDate.split('-')[2]);

    const decadal = getBaziDecadal(monthStem, monthBranch, gender, yearStem, birthYear, birthDay);

    const personality = DAY_MASTER_PERSONALITY[dayMaster] || {
      element: STEM_ELEM[dayMaster], yinYang: STEM_YY[dayMaster], symbol:'—',
      tags:[], summary:'日主資料待補充', strength:'', weakness:'', career:'', relationship:'',
    };

    // 2026 = 丙午年
    const flowYearStem = '丙', flowYearBranch = '午';
    const tenGod2026 = getTenGod(dayMaster, flowYearStem);
    const flowAdvice = BAZI_FLOW_ADVICE[tenGod2026] || { theme:'運勢平穩', advice:'今年運勢平穩，按部就班可有所成就。' };

    res.json({
      name,
      gender: gender === 'male' ? '男' : '女',
      solarDate,
      timeKey,
      dayMaster,
      dayMasterElement: STEM_ELEM[dayMaster],
      dayMasterYinYang: STEM_YY[dayMaster],
      dayMasterSymbol: personality.symbol,
      pillars,
      fiveElements,
      decadal,
      personality,
      flowYear: {
        year: 2026,
        ganzhi: `${flowYearStem}${flowYearBranch}年`,
        tenGod: tenGod2026,
        branchElement: BRANCH_ELEM[flowYearBranch],
        theme: flowAdvice.theme,
        advice: flowAdvice.advice,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '八字排盤失敗：' + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`紫微斗數排盤伺服器已啟動：http://localhost:${PORT}`);
});
