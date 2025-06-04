export const QUESTIONS = [
  {
    id: "1",
    text: "今の学年は？",
    type: "radio",
    options: ["1回生", "2回生", "3回生", "4回生", "その他"],
  },
  {
    id: "2",
    text: "所属学部は？",
    type: "text",
  },
  // 必要に応じて続けて40問分書く
];

export const ANSWER_VALUES: Record<string, number> = {
  "とても当てはまる": 2,
  "まあまあ当てはまる": 1,
  "どちらでもない": 0,
  "あまり当てはまらない": -1,
  "まったく当てはまらない": -2,
};

export const CATEGORY_MAP: Record<string, number[]> = {
  talk: [1, 6, 11, 16, 21],
  focus: [2, 7, 12, 17, 22],
  idea: [3, 8, 13, 18, 23],
  organize: [4, 9, 14, 19, 24],
  adapt: [5, 10, 15, 20, 25],
  emotion: [26, 27, 28, 29, 30],
  decision: [31, 32, 33, 34, 35],
  express: [36, 37, 38, 39, 40],
};
