export interface VocabularyItem {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  category: string;
  level: number;
}

export const vocabularyData: VocabularyItem[] = [
  // Level 1 - Animals
  { id: 1, chinese: "狗", pinyin: "gǒu", english: "dog", category: "animals", level: 1 },
  { id: 2, chinese: "猫", pinyin: "māo", english: "cat", category: "animals", level: 1 },
  { id: 3, chinese: "鸟", pinyin: "niǎo", english: "bird", category: "animals", level: 1 },
  { id: 4, chinese: "鱼", pinyin: "yú", english: "fish", category: "animals", level: 1 },
  { id: 5, chinese: "兔子", pinyin: "tùzi", english: "rabbit", category: "animals", level: 1 },
  
  // Level 2 - Food
  { id: 6, chinese: "米饭", pinyin: "mǐfàn", english: "rice", category: "food", level: 2 },
  { id: 7, chinese: "面条", pinyin: "miàntiáo", english: "noodles", category: "food", level: 2 },
  { id: 8, chinese: "水果", pinyin: "shuǐguǒ", english: "fruit", category: "food", level: 2 },
  { id: 9, chinese: "蔬菜", pinyin: "shūcài", english: "vegetables", category: "food", level: 2 },
  { id: 10, chinese: "牛奶", pinyin: "niúnǎi", english: "milk", category: "food", level: 2 },
  
  // Level 3 - Family
  { id: 11, chinese: "爸爸", pinyin: "bàba", english: "father", category: "family", level: 3 },
  { id: 12, chinese: "妈妈", pinyin: "māma", english: "mother", category: "family", level: 3 },
  { id: 13, chinese: "哥哥", pinyin: "gēge", english: "older brother", category: "family", level: 3 },
  { id: 14, chinese: "姐姐", pinyin: "jiějie", english: "older sister", category: "family", level: 3 },
  { id: 15, chinese: "弟弟", pinyin: "dìdi", english: "younger brother", category: "family", level: 3 },
  
  // Level 4 - Daily Activities
  { id: 16, chinese: "学习", pinyin: "xuéxí", english: "study", category: "activities", level: 4 },
  { id: 17, chinese: "运动", pinyin: "yùndòng", english: "exercise", category: "activities", level: 4 },
  { id: 18, chinese: "睡觉", pinyin: "shuìjiào", english: "sleep", category: "activities", level: 4 },
  { id: 19, chinese: "吃饭", pinyin: "chīfàn", english: "eat", category: "activities", level: 4 },
  { id: 20, chinese: "看书", pinyin: "kànshū", english: "read", category: "activities", level: 4 },
  
  // Level 5 - Advanced
  { id: 21, chinese: "图书馆", pinyin: "túshūguǎn", english: "library", category: "places", level: 5 },
  { id: 22, chinese: "超市", pinyin: "chāoshì", english: "supermarket", category: "places", level: 5 },
  { id: 23, chinese: "学校", pinyin: "xuéxiào", english: "school", category: "places", level: 5 },
  { id: 24, chinese: "公园", pinyin: "gōngyuán", english: "park", category: "places", level: 5 },
  { id: 25, chinese: "医院", pinyin: "yīyuàn", english: "hospital", category: "places", level: 5 },
];

export const getVocabularyByLevel = (level: number): VocabularyItem[] => {
  return vocabularyData.filter(item => item.level === level);
};

export const getRandomOptions = (correct: VocabularyItem, count: number = 3): VocabularyItem[] => {
  const options = [correct];
  const available = vocabularyData.filter(item => item.id !== correct.id);
  
  while (options.length < count + 1 && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    options.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return options.sort(() => Math.random() - 0.5);
};