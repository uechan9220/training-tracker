// 消費カロリーの推定計算。すべて標準的な運動生理学の式に基づく「目安値」です
// （心拍数など個人差は反映していません）。

const STRENGTH_MET = 5.0;           // 筋トレ（中〜高強度）の目安METs
const STRENGTH_MIN_PER_SET = 1.5;   // 1セットあたりの実施時間の目安（動作+休憩）
const CARDIO_MET = 6.0;             // ランニングマシン以外の有酸素マシンの目安METs
const FAT_KCAL_PER_KG = 7700;       // 体脂肪1kgあたりの目安kcal

// 一般的なMET式: kcal/分 = MET × 3.5 × 体重(kg) / 200
function metToKcalPerMin(met, weightKg) {
  return met * 3.5 * weightKg / 200;
}

function strengthSetCalories(weightKg) {
  return metToKcalPerMin(STRENGTH_MET, weightKg) * STRENGTH_MIN_PER_SET;
}

function cardioCalories(weightKg, durationMin) {
  return metToKcalPerMin(CARDIO_MET, weightKg) * Math.max(0, durationMin);
}

// ACSM代謝式（ウォーキング/ランニング）。時速8km/hを境に式を切り替えます。
// VO2(ml/kg/分) = 係数A×速度(m/分) + 係数B×速度(m/分)×傾斜(比率) + 3.5
function treadmillCalories(weightKg, speedKmh, inclinePercent, durationMin) {
  const speed = Math.max(0, speedKmh);
  const grade = (inclinePercent || 0) / 100;
  const speedMPerMin = speed * 1000 / 60;
  const vo2 = speed < 8
    ? 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade + 3.5
    : 0.2 * speedMPerMin + 0.9 * speedMPerMin * grade + 3.5;
  const kcalPerMin = vo2 * weightKg / 200;
  return kcalPerMin * Math.max(0, durationMin);
}
