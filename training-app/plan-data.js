// デフォルトの週間トレーニングプラン。
// 「プラン」タブから自由に編集できます（編集内容はこの端末に保存されます）。
// 設備・種目は事前の相談内容をもとにした一例です。実際の設備に合わせて調整してください。
// kind: "strength"=重量×回数で記録／"cardio"=時間で記録／"treadmill"=速度・傾斜・時間で記録

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
      { name: "スミスマシン ベンチプレス", sets: 3, reps: "8-10", equipment: "スミスマシン", kind: "strength" },
      { name: "チェストプレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
      { name: "ダンベルフライ", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" },
      { name: "トライセプスプレスダウン", sets: 3, reps: "12", equipment: "ラットプルダウン代用", kind: "strength" },
      { name: "コアトレチェア", sets: 3, reps: "15", equipment: "マシン", kind: "strength" }
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
      { name: "ラットプルダウン", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
      { name: "スミスマシン デッドリフト", sets: 3, reps: "8", equipment: "スミスマシン", kind: "strength" },
      { name: "ダンベルローイング", sets: 3, reps: "10", equipment: "フリーウェイト", kind: "strength" },
      { name: "バックエクステンション", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "ダンベルカール", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" }
    ]
  },
  {
    day: "金",
    label: "脚",
    type: "training",
    exercises: [
      { name: "スミスマシン スクワット", sets: 3, reps: "8-10", equipment: "スミスマシン", kind: "strength" },
      { name: "レッグプレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
      { name: "レッグカール", sets: 3, reps: "12", equipment: "マシン", kind: "strength" },
      { name: "レッグエクステンション", sets: 3, reps: "12", equipment: "マシン", kind: "strength" },
      { name: "アダクション／アブダクション", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "トータルヒップ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "ダンベルランジ", sets: 3, reps: "10", equipment: "フリーウェイト", kind: "strength" }
    ]
  },
  {
    day: "土",
    label: "肩・腹筋＋プール",
    type: "training-pool",
    exercises: [
      { name: "ショルダープレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
      { name: "ダンベルサイドレイズ", sets: 3, reps: "15", equipment: "フリーウェイト", kind: "strength" },
      { name: "ダンベルフロントレイズ", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" },
      { name: "クランチ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "ロータリートーソ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "アブドミナルボード", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
      { name: "ステアクライマー", sets: 1, reps: "10-15分", equipment: "有酸素・仕上げ", kind: "cardio" }
    ]
  },
  {
    day: "日",
    label: "水泳（有酸素）",
    type: "pool",
    exercises: []
  }
];
