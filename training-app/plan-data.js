// デフォルトの週間トレーニングプラン。
// 「プラン」タブから自由に編集できます（編集内容はこの端末に保存されます）。
// 設備・種目は事前の相談内容をもとにした一例です。実際の設備に合わせて調整してください。

function ytLink(name) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " やり方");
}

const DEFAULT_PLAN = [
  {
    day: "月",
    label: "休養",
    type: "rest",
    exercises: []
  },
  {
    day: "火",
    label: "胸・三頭筋",
    type: "training",
    exercises: [
      { name: "スミスマシン ベンチプレス", sets: 3, reps: "8-10", equipment: "スミスマシン" },
      { name: "チェストプレス", sets: 3, reps: "10", equipment: "マシン" },
      { name: "ダンベルフライ", sets: 3, reps: "12", equipment: "フリーウェイト" },
      { name: "トライセプスプレスダウン", sets: 3, reps: "12", equipment: "ラットプルダウン代用" },
      { name: "コアトレチェア", sets: 3, reps: "15", equipment: "マシン" }
    ]
  },
  {
    day: "水",
    label: "休養",
    type: "rest",
    exercises: []
  },
  {
    day: "木",
    label: "背中・二頭筋",
    type: "training",
    exercises: [
      { name: "ラットプルダウン", sets: 3, reps: "10", equipment: "マシン" },
      { name: "スミスマシン デッドリフト", sets: 3, reps: "8", equipment: "スミスマシン" },
      { name: "ダンベルローイング", sets: 3, reps: "10", equipment: "フリーウェイト" },
      { name: "バックエクステンション", sets: 3, reps: "15", equipment: "マシン" },
      { name: "ダンベルカール", sets: 3, reps: "12", equipment: "フリーウェイト" }
    ]
  },
  {
    day: "金",
    label: "脚",
    type: "training",
    exercises: [
      { name: "スミスマシン スクワット", sets: 3, reps: "8-10", equipment: "スミスマシン" },
      { name: "レッグプレス", sets: 3, reps: "10", equipment: "マシン" },
      { name: "レッグカール", sets: 3, reps: "12", equipment: "マシン" },
      { name: "レッグエクステンション", sets: 3, reps: "12", equipment: "マシン" },
      { name: "アダクション／アブダクション", sets: 3, reps: "15", equipment: "マシン" },
      { name: "トータルヒップ", sets: 3, reps: "15", equipment: "マシン" },
      { name: "ダンベルランジ", sets: 3, reps: "10", equipment: "フリーウェイト" }
    ]
  },
  {
    day: "土",
    label: "肩・腹筋＋プール",
    type: "training-pool",
    exercises: [
      { name: "ショルダープレス", sets: 3, reps: "10", equipment: "マシン" },
      { name: "ダンベルサイドレイズ", sets: 3, reps: "15", equipment: "フリーウェイト" },
      { name: "ダンベルフロントレイズ", sets: 3, reps: "12", equipment: "フリーウェイト" },
      { name: "クランチ", sets: 3, reps: "15", equipment: "マシン" },
      { name: "ロータリートーソ", sets: 3, reps: "15", equipment: "マシン" },
      { name: "アブドミナルボード", sets: 3, reps: "15", equipment: "マシン" },
      { name: "ステアクライマー", sets: 1, reps: "10-15分", equipment: "有酸素・仕上げ" }
    ]
  },
  {
    day: "日",
    label: "水泳（有酸素）",
    type: "pool",
    exercises: []
  }
];
