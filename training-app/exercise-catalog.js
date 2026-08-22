// 部位別の種目カタログ。「プラン」タブの編集画面で、種目を選択式で追加するために使います。
// ここから追加した種目にはYouTubeリンクを個別設定していません（未設定の種目は種目名で自動検索されます）。

const EXERCISE_CATALOG = {
  "胸": [
    { name: "スミスマシン ベンチプレス", sets: 3, reps: "8-10", equipment: "スミスマシン" },
    { name: "チェストプレス", sets: 3, reps: "10", equipment: "マシン" },
    { name: "ダンベルベンチプレス", sets: 3, reps: "10", equipment: "フリーウェイト" },
    { name: "ダンベルフライ", sets: 3, reps: "12", equipment: "フリーウェイト" },
    { name: "腕立て伏せ", sets: 3, reps: "15", equipment: "自重" }
  ],
  "背中": [
    { name: "ラットプルダウン", sets: 3, reps: "10", equipment: "マシン" },
    { name: "スミスマシン デッドリフト", sets: 3, reps: "8", equipment: "スミスマシン" },
    { name: "ダンベルローイング", sets: 3, reps: "10", equipment: "フリーウェイト" },
    { name: "バックエクステンション", sets: 3, reps: "15", equipment: "マシン" }
  ],
  "脚": [
    { name: "スミスマシン スクワット", sets: 3, reps: "8-10", equipment: "スミスマシン" },
    { name: "レッグプレス", sets: 3, reps: "10", equipment: "マシン" },
    { name: "レッグカール", sets: 3, reps: "12", equipment: "マシン" },
    { name: "レッグエクステンション", sets: 3, reps: "12", equipment: "マシン" },
    { name: "アダクション（内転筋）", sets: 3, reps: "15", equipment: "マシン" },
    { name: "アブダクション（外転筋）", sets: 3, reps: "15", equipment: "マシン" },
    { name: "トータルヒップ", sets: 3, reps: "15", equipment: "マシン" },
    { name: "ダンベルランジ", sets: 3, reps: "10", equipment: "フリーウェイト" }
  ],
  "肩": [
    { name: "ショルダープレス", sets: 3, reps: "10", equipment: "マシン" },
    { name: "ダンベルサイドレイズ", sets: 3, reps: "15", equipment: "フリーウェイト" },
    { name: "ダンベルフロントレイズ", sets: 3, reps: "12", equipment: "フリーウェイト" },
    { name: "アップライトロウ", sets: 3, reps: "12", equipment: "フリーウェイト" }
  ],
  "腕": [
    { name: "トライセプスプレスダウン", sets: 3, reps: "12", equipment: "ラットプルダウン代用" },
    { name: "ダンベルカール", sets: 3, reps: "12", equipment: "フリーウェイト" },
    { name: "ダンベルキックバック", sets: 3, reps: "12", equipment: "フリーウェイト" }
  ],
  "腹筋・体幹": [
    { name: "クランチ", sets: 3, reps: "15", equipment: "マシン" },
    { name: "ロータリートーソ", sets: 3, reps: "15", equipment: "マシン" },
    { name: "アブドミナルボード", sets: 3, reps: "15", equipment: "マシン" },
    { name: "コアトレチェア", sets: 3, reps: "15", equipment: "マシン" },
    { name: "プランク", sets: 3, reps: "30秒", equipment: "自重" }
  ],
  "有酸素": [
    { name: "ランニングマシン", sets: 1, reps: "15-20分", equipment: "有酸素" },
    { name: "クロストレーナー", sets: 1, reps: "15-20分", equipment: "有酸素" },
    { name: "リカンベントバイク", sets: 1, reps: "15-20分", equipment: "有酸素" },
    { name: "アップライトバイク", sets: 1, reps: "15-20分", equipment: "有酸素" },
    { name: "ステアクライマー", sets: 1, reps: "10-15分", equipment: "有酸素" },
    { name: "水泳", sets: 1, reps: "20-30分", equipment: "プール" }
  ]
};
