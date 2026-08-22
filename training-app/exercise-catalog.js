// 部位別の種目カタログ。「プラン」タブの編集画面で、種目を選択式で追加するために使います。
// ここから追加した種目にはYouTubeリンクを個別設定していません（未設定の種目は種目名で自動検索されます）。
// kind: "strength"=重量×回数で記録／"cardio"=時間で記録／"treadmill"=速度・傾斜・時間で記録

const EXERCISE_CATALOG = {
  "胸": [
    { name: "スミスマシン ベンチプレス", sets: 3, reps: "8-10", equipment: "スミスマシン", kind: "strength" },
    { name: "チェストプレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
    { name: "ダンベルベンチプレス", sets: 3, reps: "10", equipment: "フリーウェイト", kind: "strength" },
    { name: "ダンベルフライ", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" },
    { name: "腕立て伏せ", sets: 3, reps: "15", equipment: "自重", kind: "strength" }
  ],
  "背中": [
    { name: "ラットプルダウン", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
    { name: "スミスマシン デッドリフト", sets: 3, reps: "8", equipment: "スミスマシン", kind: "strength" },
    { name: "ダンベルローイング", sets: 3, reps: "10", equipment: "フリーウェイト", kind: "strength" },
    { name: "バックエクステンション", sets: 3, reps: "15", equipment: "マシン", kind: "strength" }
  ],
  "脚": [
    { name: "スミスマシン スクワット", sets: 3, reps: "8-10", equipment: "スミスマシン", kind: "strength" },
    { name: "レッグプレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
    { name: "レッグカール", sets: 3, reps: "12", equipment: "マシン", kind: "strength" },
    { name: "レッグエクステンション", sets: 3, reps: "12", equipment: "マシン", kind: "strength" },
    { name: "アダクション（内転筋）", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "アブダクション（外転筋）", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "トータルヒップ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "ダンベルランジ", sets: 3, reps: "10", equipment: "フリーウェイト", kind: "strength" }
  ],
  "肩": [
    { name: "ショルダープレス", sets: 3, reps: "10", equipment: "マシン", kind: "strength" },
    { name: "ダンベルサイドレイズ", sets: 3, reps: "15", equipment: "フリーウェイト", kind: "strength" },
    { name: "ダンベルフロントレイズ", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" },
    { name: "アップライトロウ", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" }
  ],
  "腕": [
    { name: "トライセプスプレスダウン", sets: 3, reps: "12", equipment: "ラットプルダウン代用", kind: "strength" },
    { name: "ダンベルカール", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" },
    { name: "ダンベルキックバック", sets: 3, reps: "12", equipment: "フリーウェイト", kind: "strength" }
  ],
  "腹筋・体幹": [
    { name: "クランチ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "ロータリートーソ", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "アブドミナルボード", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "コアトレチェア", sets: 3, reps: "15", equipment: "マシン", kind: "strength" },
    { name: "プランク", sets: 3, reps: "30秒", equipment: "自重", kind: "strength" }
  ],
  "有酸素": [
    { name: "ランニングマシン", sets: 1, reps: "15-20分", equipment: "有酸素", kind: "treadmill" },
    { name: "クロストレーナー", sets: 1, reps: "15-20分", equipment: "有酸素", kind: "cardio" },
    { name: "リカンベントバイク", sets: 1, reps: "15-20分", equipment: "有酸素", kind: "cardio" },
    { name: "アップライトバイク", sets: 1, reps: "15-20分", equipment: "有酸素", kind: "cardio" },
    { name: "ステアクライマー", sets: 1, reps: "10-15分", equipment: "有酸素", kind: "cardio" },
    { name: "水泳", sets: 1, reps: "20-30分", equipment: "プール", kind: "cardio" }
  ]
};
