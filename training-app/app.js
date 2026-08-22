// トレーニング記録アプリ本体。localStorageのみを使い、この端末内で完結します。

const STORE_KEYS = {
  plan: "tt_plan_v1",
  workouts: "tt_workoutLogs_v1",
  weights: "tt_weightLogs_v1",
  meals: "tt_mealLogs_v1",
  settings: "tt_settings_v1"
};

const TYPE_MAP = {
  workout: { stateKey: "workoutLogs", storeKey: STORE_KEYS.workouts },
  weight: { stateKey: "weightLogs", storeKey: STORE_KEYS.weights },
  meal: { stateKey: "mealLogs", storeKey: STORE_KEYS.meals }
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("load failed", key, e);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("save failed", key, e);
    toast("保存に失敗しました（空き容量をご確認ください）");
  }
}

function clonePlan() {
  return JSON.parse(JSON.stringify(DEFAULT_PLAN));
}

function blankPlan() {
  return DEFAULT_PLAN.map(d => ({ day: d.day, label: "", type: "rest", exercises: [] }));
}

function defaultSettings() {
  return { heightCm: null, age: null, sex: "", goalWeightKg: null, activityFactor: 1.2, deficit: 500 };
}

let state = {
  plan: loadJSON(STORE_KEYS.plan, null) || clonePlan(),
  workoutLogs: loadJSON(STORE_KEYS.workouts, []),
  weightLogs: loadJSON(STORE_KEYS.weights, []),
  mealLogs: loadJSON(STORE_KEYS.meals, []),
  settings: loadJSON(STORE_KEYS.settings, null) || defaultSettings()
};

let planEditMode = false;
let recordFilter = "all";
let selectedMealType = "朝";

// ---------- utils ----------

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function safeUrl(url) {
  const trimmed = String(url ?? "").trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

function effectiveYtLink(ex) {
  return safeUrl(ex.customYtUrl) || ytLink(ex.name);
}

function toISODate(d) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function formatShortDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()} (${w})`;
}

function planIndexForDate(d) {
  return (d.getDay() + 6) % 7;
}

function dayTypeClass(type) {
  if (type === "rest") return "type-rest";
  if (type === "pool") return "type-pool";
  if (type === "training-pool") return "type-training-pool";
  return "type-training";
}

function sortedWeightLogs() {
  return [...state.weightLogs].sort((a, b) => a.date.localeCompare(b.date));
}

function computeCalorieTarget() {
  const s = state.settings;
  const wLogs = sortedWeightLogs();
  if (!s.heightCm || !s.age || !s.sex || wLogs.length === 0) return null;
  const weight = wLogs[wLogs.length - 1].weight;
  const bmr = s.sex === "male"
    ? 10 * weight + 6.25 * s.heightCm - 5 * s.age + 5
    : 10 * weight + 6.25 * s.heightCm - 5 * s.age - 161;
  const tdee = bmr * (s.activityFactor || 1.2);
  const target = tdee - (s.deficit || 0);
  return { bmr, tdee, target, weight };
}

function filterByRange(logsSortedAsc, days) {
  if (days >= 9999) return logsSortedAsc;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = toISODate(cutoff);
  return logsSortedAsc.filter(l => l.date >= cutoffIso);
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

// iOSのホーム画面追加（standalone）アプリでは window.confirm/alert が表示されないため、
// 自前のモーダルで置き換えています。
function showModal(message, { showCancel = true } = {}) {
  return new Promise(resolve => {
    const modal = document.getElementById("confirmModal");
    const okBtn = document.getElementById("confirmOkBtn");
    const cancelBtn = document.getElementById("confirmCancelBtn");
    document.getElementById("confirmMessage").textContent = message;
    cancelBtn.hidden = !showCancel;
    modal.hidden = false;
    function cleanup(result) {
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}
function showConfirm(message) {
  return showModal(message, { showCancel: true });
}
function showAlert(message) {
  return showModal(message, { showCancel: false });
}

// ---------- header / tabs ----------

function renderHeaderDate() {
  const d = new Date();
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  document.getElementById("headerDate").textContent = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} (${w})`;
}

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => { p.hidden = p.dataset.panel !== tab; });
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "today") renderToday();
  if (tab === "plan") renderPlan();
  if (tab === "records") renderRecords();
  if (tab === "graphs") renderGraphs();
  if (tab === "settings") renderSettings();
}

function renderAll() {
  renderHeaderDate();
  const active = document.querySelector(".tab-btn.active");
  switchTab(active ? active.dataset.tab : "today");
}

// ---------- today ----------

function renderToday() {
  const now = new Date();
  const iso = toISODate(now);
  const idx = planIndexForDate(now);
  const day = state.plan[idx];

  renderTodaySummary(iso);
  renderTodayPlanCard(day, iso);
  renderTodayWeight(iso);
  renderTodayMeals(iso);
}

function renderTodaySummary(iso) {
  const el = document.getElementById("todaySummary");
  const wLogs = sortedWeightLogs();
  const latest = wLogs[wLogs.length - 1];
  const first = wLogs[0];

  let weightHtml = `<div class="value">--</div><div class="sub">未記録</div>`;
  if (latest) {
    let sub = "";
    if (first && first !== latest) {
      const diff = latest.weight - first.weight;
      sub = (diff > 0 ? "+" : "") + diff.toFixed(1) + "kg (開始比)";
    }
    weightHtml = `<div class="value">${latest.weight}kg</div><div class="sub">${sub}</div>`;
  }

  const todayCal = state.mealLogs.filter(m => m.date === iso).reduce((s, m) => s + (m.calories || 0), 0);
  const calc = computeCalorieTarget();
  let calHtml;
  if (calc) {
    const remain = Math.round(calc.target - todayCal);
    const cls = remain < 0 ? "over" : "under";
    calHtml = `<div class="value">${todayCal}<span style="font-size:12px;color:var(--muted)"> / ${Math.round(calc.target)}kcal</span></div><div class="sub ${cls}">${remain < 0 ? "+" + Math.abs(remain) + " 超過" : remain + " 残り"}</div>`;
  } else {
    calHtml = `<div class="value">${todayCal}kcal</div><div class="sub">設定で目標を計算できます</div>`;
  }

  const day = state.plan[planIndexForDate(new Date())];

  el.innerHTML = `
    <div class="summary-item"><div class="label">体重</div>${weightHtml}</div>
    <div class="summary-item"><div class="label">本日の摂取カロリー</div>${calHtml}</div>
    <div class="summary-item"><div class="label">今日のメニュー</div><div class="value" style="font-size:15px">${day.day}曜日・${escapeHtml(day.label)}</div></div>
  `;
}

function exerciseRowHTML(ex, i, iso) {
  const todays = state.workoutLogs.filter(l => l.date === iso && l.exerciseName === ex.name);
  const doneToday = todays.length > 0;
  const setsCount = ex.sets || 3;
  let rows = "";
  for (let s = 0; s < setsCount; s++) {
    rows += `
      <div class="set-row">
        <div class="set-idx">${s + 1}</div>
        <input type="number" inputmode="decimal" placeholder="重量kg" data-role="weight">
        <input type="number" inputmode="numeric" placeholder="回数" data-role="reps">
      </div>`;
  }
  const lastNote = doneToday
    ? `<div class="last-logged">✓ 本日記録済み（${todays[todays.length - 1].sets.map(s => `${s.weight}kg×${s.reps}`).join(" / ")}）</div>`
    : "";
  return `
    <div class="exercise-row" data-index="${i}">
      <div class="exercise-head">
        <div>
          <div class="exercise-name">${escapeHtml(ex.name)}</div>
          <div class="exercise-target">${ex.sets}セット × ${escapeHtml(String(ex.reps))}　<span style="opacity:.7">${escapeHtml(ex.equipment || "")}</span></div>
          ${lastNote}
        </div>
        <div class="exercise-actions">
          <a class="yt-badge" href="${effectiveYtLink(ex)}" target="_blank" rel="noopener">▶ YT</a>
          <button class="log-toggle-btn ${doneToday ? "done" : ""}" data-role="logbtn">${doneToday ? "再記録" : "記録する"}</button>
        </div>
      </div>
      <div class="set-log-panel" data-role="panel">
        ${rows}
        <div class="set-log-actions">
          <button class="btn btn-sm" data-role="addset">＋セット追加</button>
          <button class="btn btn-primary btn-sm" data-role="save">保存</button>
        </div>
      </div>
    </div>`;
}

function setupExerciseRow(ex, i, iso) {
  const row = document.querySelector(`#todayPlan .exercise-row[data-index="${i}"]`);
  if (!row) return;
  const panel = row.querySelector('[data-role="panel"]');

  row.querySelector('[data-role="logbtn"]').addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  row.querySelector('[data-role="addset"]').addEventListener("click", () => {
    const idx = panel.querySelectorAll(".set-row").length;
    const div = document.createElement("div");
    div.className = "set-row";
    div.innerHTML = `<div class="set-idx">${idx + 1}</div><input type="number" inputmode="decimal" placeholder="重量kg" data-role="weight"><input type="number" inputmode="numeric" placeholder="回数" data-role="reps">`;
    panel.insertBefore(div, panel.querySelector(".set-log-actions"));
  });

  row.querySelector('[data-role="save"]').addEventListener("click", () => {
    const sets = [];
    panel.querySelectorAll(".set-row").forEach(r => {
      const w = parseFloat(r.querySelector('[data-role="weight"]').value);
      const reps = parseInt(r.querySelector('[data-role="reps"]').value, 10);
      if (!isNaN(w) && !isNaN(reps)) sets.push({ weight: w, reps });
    });
    if (sets.length === 0) { toast("重量と回数を入力してください"); return; }
    state.workoutLogs.push({ id: uid(), date: iso, day: state.plan[planIndexForDate(new Date())].day, exerciseName: ex.name, sets });
    saveJSON(STORE_KEYS.workouts, state.workoutLogs);
    toast("記録しました");
    renderToday();
  });
}

function renderTodayPlanCard(day, iso) {
  const container = document.getElementById("todayPlan");
  const cls = dayTypeClass(day.type);
  let bodyHtml = "";
  if (day.exercises.length === 0) {
    bodyHtml = `<div class="rest-msg">${day.type === "pool" ? "🏊 プールで有酸素運動をしましょう。" : "😴 今日は休養日です。しっかり回復しましょう。"}</div>`;
  } else {
    bodyHtml = day.exercises.map((ex, i) => exerciseRowHTML(ex, i, iso)).join("");
  }
  if (day.type === "training-pool") {
    bodyHtml += `<div class="rest-msg">🏊 トレーニング後にプールも取り入れましょう。</div>`;
  }
  container.innerHTML = `
    <div class="day-card ${cls} is-today">
      <div class="day-card-head"><span>${day.day}曜日・${escapeHtml(day.label)}</span></div>
      <div class="day-card-body">${bodyHtml}</div>
    </div>
  `;
  day.exercises.forEach((ex, i) => setupExerciseRow(ex, i, iso));
}

function renderTodayWeight(iso) {
  const el = document.getElementById("todayWeight");
  const todays = state.weightLogs.filter(w => w.date === iso);
  const existing = todays[todays.length - 1];
  el.innerHTML = `
    <h2>体重を記録</h2>
    <div class="inline-form">
      <label>体重 (kg)<input type="number" inputmode="decimal" id="weightInput" step="0.1" value="${existing ? existing.weight : ""}"></label>
      <button class="btn btn-primary" id="weightSaveBtn">保存</button>
    </div>
  `;
  document.getElementById("weightSaveBtn").addEventListener("click", () => {
    const v = parseFloat(document.getElementById("weightInput").value);
    if (isNaN(v) || v <= 0) { toast("体重を入力してください"); return; }
    if (existing) {
      existing.weight = v;
    } else {
      state.weightLogs.push({ id: uid(), date: iso, weight: v });
    }
    saveJSON(STORE_KEYS.weights, state.weightLogs);
    toast("体重を記録しました");
    renderToday();
  });
}

function pfcBadgesHTML(m) {
  if (m.p == null && m.f == null && m.c == null) return "";
  return `<div class="pfc-badges"><span class="pfc-badge p">P${m.p ?? 0}g</span><span class="pfc-badge f">F${m.f ?? 0}g</span><span class="pfc-badge c">C${m.c ?? 0}g</span></div>`;
}

function mealItemHTML(m) {
  return `
    <div class="meal-item">
      <div class="meal-main">
        <div><span class="meal-type">${escapeHtml(m.mealType)}</span>${escapeHtml(m.content)}</div>
        ${pfcBadgesHTML(m)}
      </div>
      <div class="meal-cal">${m.calories ? m.calories + "kcal" : ""}</div>
      <button class="del-btn" data-role="delmeal" data-id="${m.id}">✕</button>
    </div>`;
}

function mealCatalogItemHTML(p, i) {
  return `
    <div class="meal-catalog-item">
      <div class="meal-catalog-info">
        <div class="meal-catalog-name">${escapeHtml(p.name)}</div>
        <div class="meal-catalog-macro">${p.kcal}kcal　P${p.p}g F${p.f}g C${p.c}g</div>
      </div>
      <a class="yt-badge" href="${recipeLink(p.name)}" target="_blank" rel="noopener">▶ 作り方</a>
      <button class="btn btn-primary btn-sm" data-role="quickadd" data-idx="${i}">＋追加</button>
    </div>`;
}

function renderTodayMeals(iso) {
  const el = document.getElementById("todayMeals");
  const meals = state.mealLogs.filter(m => m.date === iso);
  const total = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const calc = computeCalorieTarget();

  const chips = ["朝", "昼", "夜", "間食"].map(t => `<button class="chip ${t === selectedMealType ? "active" : ""}" data-meal-type="${t}">${t}</button>`).join("");

  const presets = MEAL_PRESETS[selectedMealType] || [];
  const catalogHtml = presets.length > 0 ? `
    <p class="hint">タップで記録に追加できます。複数選んで組み合わせてもOKです。</p>
    <div class="meal-catalog-list">${presets.map((p, i) => mealCatalogItemHTML(p, i)).join("")}</div>
  ` : "";

  const listHtml = meals.length === 0
    ? `<div class="empty-state">まだ記録がありません</div>`
    : meals.map(m => mealItemHTML(m)).join("");

  const totalRowCls = calc && total > calc.target ? "over" : "under";
  const totalRow = calc
    ? `<div class="today-total-row"><span>合計</span><span class="${totalRowCls}">${total} / ${Math.round(calc.target)}kcal</span></div>`
    : `<div class="today-total-row"><span>合計</span><span>${total}kcal</span></div>`;

  el.innerHTML = `
    <h2>今日の食事</h2>
    <div class="chip-row">${chips}</div>
    ${catalogHtml}
    <p class="hint">候補になければ自由入力できます。カロリー・PFCは目安値です。</p>
    <div class="inline-form">
      <label style="flex:2">内容<input type="text" id="mealContentInput" placeholder="例: 鶏胸肉とごはん"></label>
      <label>カロリー<input type="number" id="mealCalInput" inputmode="numeric" placeholder="kcal"></label>
    </div>
    <button class="btn btn-primary btn-block" id="mealAddBtn">追加</button>
    <div style="margin-top:12px">${listHtml}</div>
    ${totalRow}
  `;

  el.querySelectorAll("[data-meal-type]").forEach(btn => {
    btn.addEventListener("click", () => { selectedMealType = btn.dataset.mealType; renderTodayMeals(iso); });
  });
  el.querySelectorAll('[data-role="quickadd"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const p = presets[parseInt(btn.dataset.idx, 10)];
      if (!p) return;
      state.mealLogs.push({ id: uid(), date: iso, mealType: selectedMealType, content: p.name, calories: p.kcal, p: p.p, f: p.f, c: p.c });
      saveJSON(STORE_KEYS.meals, state.mealLogs);
      toast(`${p.name}を記録しました`);
      renderTodayMeals(iso);
      renderTodaySummary(iso);
    });
  });
  el.querySelector("#mealAddBtn").addEventListener("click", () => {
    const content = document.getElementById("mealContentInput").value.trim();
    const cal = parseInt(document.getElementById("mealCalInput").value, 10);
    if (!content) { toast("内容を入力してください"); return; }
    state.mealLogs.push({ id: uid(), date: iso, mealType: selectedMealType, content, calories: isNaN(cal) ? 0 : cal });
    saveJSON(STORE_KEYS.meals, state.mealLogs);
    toast("記録しました");
    renderTodayMeals(iso);
    renderTodaySummary(iso);
  });
  el.querySelectorAll('[data-role="delmeal"]').forEach(btn => {
    btn.addEventListener("click", () => {
      state.mealLogs = state.mealLogs.filter(m => m.id !== btn.dataset.id);
      saveJSON(STORE_KEYS.meals, state.mealLogs);
      renderTodayMeals(iso);
      renderTodaySummary(iso);
    });
  });
}

// ---------- plan ----------

function renderPlan() {
  const container = document.getElementById("planList");
  container.innerHTML = state.plan.map((day, di) => planDayCardHTML(day, di)).join("");
  if (planEditMode) {
    state.plan.forEach((day, di) => setupPlanDayEdit(day, di));
  }
}

function catalogCategoryOptionsHTML() {
  return Object.keys(EXERCISE_CATALOG).map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("");
}

function populateCatalogExerciseSelect(exSelect, category) {
  const list = EXERCISE_CATALOG[category] || [];
  exSelect.innerHTML = list.map((ex, i) => `<option value="${i}">${escapeHtml(ex.name)}</option>`).join("");
}

function planDayCardHTML(day, di) {
  const cls = dayTypeClass(day.type);

  if (!planEditMode) {
    const body = day.exercises.length === 0
      ? `<div class="rest-msg">${day.type === "pool" ? "🏊 プール（有酸素）" : "😴 休養日"}</div>`
      : day.exercises.map(ex => `
        <div class="exercise-row">
          <div class="exercise-head">
            <div>
              <div class="exercise-name">${escapeHtml(ex.name)}</div>
              <div class="exercise-target">${ex.sets}セット × ${escapeHtml(String(ex.reps))}　<span style="opacity:.7">${escapeHtml(ex.equipment || "")}</span></div>
            </div>
            <a class="yt-badge" href="${effectiveYtLink(ex)}" target="_blank" rel="noopener">▶ YT</a>
          </div>
        </div>`).join("");
    return `<div class="day-card ${cls}"><div class="day-card-head">${day.day}曜日・${escapeHtml(day.label)}</div><div class="day-card-body">${body}</div></div>`;
  }

  const typeOptions = [["training", "トレーニング"], ["rest", "休養"], ["pool", "プール"], ["training-pool", "トレーニング＋プール"]]
    .map(([v, l]) => `<option value="${v}" ${day.type === v ? "selected" : ""}>${l}</option>`).join("");
  const exRows = day.exercises.map((ex, ei) => `
    <div class="plan-ex-edit" data-ex-index="${ei}">
      <div class="plan-ex-edit-row1">
        <input type="text" value="${escapeHtml(ex.name)}" data-field="name" placeholder="種目名">
        <button class="del-btn" data-role="delex" data-ex-index="${ei}">✕</button>
      </div>
      <div class="plan-ex-edit-row2">
        <input type="number" value="${ex.sets}" data-field="sets" placeholder="セット">
        <input type="text" value="${escapeHtml(String(ex.reps))}" data-field="reps" placeholder="回数">
      </div>
      <div class="plan-ex-edit-row3">
        <input type="text" value="${escapeHtml(ex.customYtUrl || "")}" data-field="customYtUrl" placeholder="YouTubeリンク（任意・空欄なら自動検索）">
        <a class="yt-badge" data-role="ytpreview" href="${effectiveYtLink(ex)}" target="_blank" rel="noopener">▶</a>
      </div>
    </div>`).join("");
  return `
    <div class="day-card ${cls}" data-day-index="${di}">
      <div class="day-card-head">
        <input type="text" value="${escapeHtml(day.label)}" data-role="label" style="flex:1;margin-right:8px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:6px;padding:4px 8px;font-size:13px">
        <select data-role="type" style="font-size:12px">${typeOptions}</select>
      </div>
      <div class="day-card-body">
        ${exRows}
        <div class="catalog-add">
          <div class="hint" style="margin:4px 0 6px">部位を選んでカタログから追加、または自由入力で追加できます。</div>
          <div class="catalog-add-row">
            <select data-role="catCategory" class="range-select">${catalogCategoryOptionsHTML()}</select>
            <select data-role="catExercise" class="range-select"></select>
          </div>
          <div class="catalog-add-actions">
            <button class="btn btn-primary btn-sm" data-role="catAdd">選んだ種目を追加</button>
            <button class="btn btn-sm" data-role="addex">自由入力で追加</button>
          </div>
        </div>
      </div>
    </div>`;
}

function setupPlanDayEdit(day, di) {
  const card = document.querySelector(`#planList .day-card[data-day-index="${di}"]`);
  if (!card) return;

  card.querySelector('[data-role="label"]').addEventListener("input", e => {
    day.label = e.target.value;
    saveJSON(STORE_KEYS.plan, state.plan);
  });
  card.querySelector('[data-role="type"]').addEventListener("change", e => {
    day.type = e.target.value;
    saveJSON(STORE_KEYS.plan, state.plan);
    renderPlan();
  });
  card.querySelectorAll(".plan-ex-edit").forEach(row => {
    const ei = parseInt(row.dataset.exIndex, 10);
    row.querySelector('[data-field="name"]').addEventListener("input", e => { day.exercises[ei].name = e.target.value; saveJSON(STORE_KEYS.plan, state.plan); syncYtPreview(row, day.exercises[ei]); });
    row.querySelector('[data-field="sets"]').addEventListener("input", e => { day.exercises[ei].sets = parseInt(e.target.value, 10) || 0; saveJSON(STORE_KEYS.plan, state.plan); });
    row.querySelector('[data-field="reps"]').addEventListener("input", e => { day.exercises[ei].reps = e.target.value; saveJSON(STORE_KEYS.plan, state.plan); });
    row.querySelector('[data-field="customYtUrl"]').addEventListener("input", e => { day.exercises[ei].customYtUrl = e.target.value; saveJSON(STORE_KEYS.plan, state.plan); syncYtPreview(row, day.exercises[ei]); });
    row.querySelector('[data-role="delex"]').addEventListener("click", () => {
      day.exercises.splice(ei, 1);
      saveJSON(STORE_KEYS.plan, state.plan);
      renderPlan();
    });
  });

  const catCategory = card.querySelector('[data-role="catCategory"]');
  const catExercise = card.querySelector('[data-role="catExercise"]');
  populateCatalogExerciseSelect(catExercise, catCategory.value);
  catCategory.addEventListener("change", () => populateCatalogExerciseSelect(catExercise, catCategory.value));
  card.querySelector('[data-role="catAdd"]').addEventListener("click", () => {
    const list = EXERCISE_CATALOG[catCategory.value] || [];
    const picked = list[parseInt(catExercise.value, 10)];
    if (!picked) return;
    day.exercises.push({ name: picked.name, sets: picked.sets, reps: picked.reps, equipment: picked.equipment || "", customYtUrl: "" });
    saveJSON(STORE_KEYS.plan, state.plan);
    renderPlan();
  });

  card.querySelector('[data-role="addex"]').addEventListener("click", () => {
    day.exercises.push({ name: "新しい種目", sets: 3, reps: "10", equipment: "", customYtUrl: "" });
    saveJSON(STORE_KEYS.plan, state.plan);
    renderPlan();
  });
}

function syncYtPreview(row, ex) {
  const a = row.querySelector('[data-role="ytpreview"]');
  if (a) a.href = effectiveYtLink(ex);
}

// ---------- records ----------

function renderRecords() {
  const container = document.getElementById("recordsList");
  const items = [];
  state.workoutLogs.forEach(l => items.push({ type: "workout", date: l.date, id: l.id, data: l }));
  state.weightLogs.forEach(l => items.push({ type: "weight", date: l.date, id: l.id, data: l }));
  state.mealLogs.forEach(l => items.push({ type: "meal", date: l.date, id: l.id, data: l }));

  const filtered = recordFilter === "all" ? items : items.filter(i => i.type === recordFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">まだ記録がありません</div>`;
    return;
  }

  const groups = {};
  filtered.forEach(i => { (groups[i.date] = groups[i.date] || []).push(i); });
  const dates = Object.keys(groups).sort().reverse();

  container.innerHTML = dates.map(date => `
    <div class="record-day-group">
      <div class="record-day-label">${formatDateLabel(date)}</div>
      ${groups[date].map(i => recordItemHTML(i)).join("")}
    </div>
  `).join("");

  container.querySelectorAll('[data-role="delrecord"]').forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!await showConfirm("この記録を削除しますか？")) return;
      deleteRecord(btn.dataset.type, btn.dataset.id);
    });
  });
}

function recordItemHTML(item) {
  let main = "", sub = "", extra = "";
  if (item.type === "workout") {
    main = escapeHtml(item.data.exerciseName);
    sub = item.data.sets.map(s => `${s.weight}kg×${s.reps}`).join(" / ");
  } else if (item.type === "weight") {
    main = `${item.data.weight} kg`;
  } else if (item.type === "meal") {
    main = `${escapeHtml(item.data.mealType)} ${escapeHtml(item.data.content)}`;
    sub = item.data.calories ? `${item.data.calories}kcal` : "";
    extra = pfcBadgesHTML(item.data);
  }
  const typeLabel = { workout: "筋トレ", weight: "体重", meal: "食事" }[item.type];
  return `
    <div class="record-item">
      <span class="rtype ${item.type}">${typeLabel}</span>
      <div class="record-main">${main}${sub ? `<div class="record-sub">${escapeHtml(sub)}</div>` : ""}${extra}</div>
      <button class="del-btn" data-role="delrecord" data-type="${item.type}" data-id="${item.id}">✕</button>
    </div>`;
}

function deleteRecord(type, id) {
  const map = TYPE_MAP[type];
  state[map.stateKey] = state[map.stateKey].filter(l => l.id !== id);
  saveJSON(map.storeKey, state[map.stateKey]);
  renderRecords();
  toast("削除しました");
}

// ---------- graphs ----------

function renderGraphs() {
  renderWeightChart();
  renderCalorieChart();
  renderLiftChart();
}

function renderWeightChart() {
  const days = parseInt(document.getElementById("weightRange").value, 10);
  const logs = filterByRange(sortedWeightLogs(), days);
  const points = logs.map(l => ({ label: formatShortDate(l.date), value: l.weight }));
  const opts = { type: "line", color: "#3b82f6", unit: "kg" };
  if (state.settings.goalWeightKg) opts.refLine = { value: state.settings.goalWeightKg, label: "目標 " + state.settings.goalWeightKg + "kg" };
  renderChart(document.getElementById("weightChart"), points, opts);
}

function renderCalorieChart() {
  const days = parseInt(document.getElementById("calorieRange").value, 10);
  const mealsAsc = [...state.mealLogs].sort((a, b) => a.date.localeCompare(b.date));
  const meals = filterByRange(mealsAsc, days);
  const byDate = {};
  meals.forEach(m => { byDate[m.date] = (byDate[m.date] || 0) + (m.calories || 0); });
  const dates = Object.keys(byDate).sort();
  const points = dates.map(d => ({ label: formatShortDate(d), value: byDate[d] }));
  const opts = { type: "bar", color: "#f59e0b", unit: "kcal" };
  const calc = computeCalorieTarget();
  if (calc) opts.refLine = { value: Math.round(calc.target), label: "目標 " + Math.round(calc.target) };
  renderChart(document.getElementById("calorieChart"), points, opts);
}

function renderLiftChart() {
  const names = [...new Set(state.workoutLogs.map(l => l.exerciseName))];
  const sel = document.getElementById("liftExerciseSelect");
  const prevValue = sel.value;
  sel.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");

  if (names.length === 0) {
    renderChart(document.getElementById("liftChart"), [], {});
    return;
  }
  sel.value = names.includes(prevValue) ? prevValue : names[0];
  const chosen = sel.value;
  const logs = state.workoutLogs.filter(l => l.exerciseName === chosen).sort((a, b) => a.date.localeCompare(b.date));
  const points = logs.map(l => ({ label: formatShortDate(l.date), value: Math.max(...l.sets.map(s => s.weight)) }));
  renderChart(document.getElementById("liftChart"), points, { type: "line", color: "#a855f7", unit: "kg" });
}

// ---------- settings ----------

function renderSettings() {
  const s = state.settings;
  document.getElementById("setHeight").value = s.heightCm || "";
  document.getElementById("setAge").value = s.age || "";
  document.getElementById("setSex").value = s.sex || "";
  document.getElementById("setGoalWeight").value = s.goalWeightKg || "";
  document.getElementById("setActivity").value = s.activityFactor || 1.2;
  document.getElementById("setDeficit").value = s.deficit != null ? s.deficit : 500;
  updateCalorieTargetResult();
}

function updateCalorieTargetResult() {
  const el = document.getElementById("calorieTargetResult");
  const calc = computeCalorieTarget();
  if (!calc) {
    el.textContent = "身長・年齢・性別と、体重の記録が揃うと目標カロリーを計算します。";
    return;
  }
  el.textContent = `現在の体重(${calc.weight}kg)から算出: 基礎代謝 約${Math.round(calc.bmr)}kcal / 消費目安 約${Math.round(calc.tdee)}kcal → 目標摂取 約${Math.round(calc.target)}kcal`;
}

// ---------- init ----------

function init() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.getElementById("planEditToggle").addEventListener("click", () => {
    planEditMode = !planEditMode;
    document.getElementById("planEditToggle").textContent = planEditMode ? "完了" : "編集";
    document.getElementById("planResetBtn").hidden = !planEditMode;
    document.getElementById("planClearBtn").hidden = !planEditMode;
    renderPlan();
  });
  document.getElementById("planResetBtn").addEventListener("click", async () => {
    if (!await showConfirm("プランを初期状態のサンプルメニューに戻しますか？編集内容は失われます。")) return;
    state.plan = clonePlan();
    saveJSON(STORE_KEYS.plan, state.plan);
    renderPlan();
    toast("初期メニューに戻しました");
  });
  document.getElementById("planClearBtn").addEventListener("click", async () => {
    if (!await showConfirm("プランの内容をすべて削除します。消しても大丈夫ですか？")) return;
    state.plan = blankPlan();
    saveJSON(STORE_KEYS.plan, state.plan);
    renderPlan();
    toast("プランを全消去しました");
  });

  document.querySelectorAll("#recordFilters .chip").forEach(btn => {
    btn.addEventListener("click", () => {
      recordFilter = btn.dataset.filter;
      document.querySelectorAll("#recordFilters .chip").forEach(b => b.classList.toggle("active", b === btn));
      renderRecords();
    });
  });

  document.getElementById("weightRange").addEventListener("change", renderWeightChart);
  document.getElementById("calorieRange").addEventListener("change", renderCalorieChart);
  document.getElementById("liftExerciseSelect").addEventListener("change", renderLiftChart);

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    state.settings = {
      heightCm: parseFloat(document.getElementById("setHeight").value) || null,
      age: parseInt(document.getElementById("setAge").value, 10) || null,
      sex: document.getElementById("setSex").value,
      goalWeightKg: parseFloat(document.getElementById("setGoalWeight").value) || null,
      activityFactor: parseFloat(document.getElementById("setActivity").value),
      deficit: parseInt(document.getElementById("setDeficit").value, 10) || 0
    };
    saveJSON(STORE_KEYS.settings, state.settings);
    updateCalorieTargetResult();
    toast("設定を保存しました");
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = {
      exportedAt: new Date().toISOString(),
      plan: state.plan,
      workoutLogs: state.workoutLogs,
      weightLogs: state.weightLogs,
      mealLogs: state.mealLogs,
      settings: state.settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-backup-${toISODate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (err) {
        await showAlert("ファイルの読み込みに失敗しました。正しいバックアップファイルか確認してください。");
        return;
      }
      if (!await showConfirm("現在のデータを読み込んだバックアップで置き換えます。よろしいですか？")) return;
      state.plan = data.plan || clonePlan();
      state.workoutLogs = data.workoutLogs || [];
      state.weightLogs = data.weightLogs || [];
      state.mealLogs = data.mealLogs || [];
      state.settings = data.settings || defaultSettings();
      saveJSON(STORE_KEYS.plan, state.plan);
      saveJSON(STORE_KEYS.workouts, state.workoutLogs);
      saveJSON(STORE_KEYS.weights, state.weightLogs);
      saveJSON(STORE_KEYS.meals, state.mealLogs);
      saveJSON(STORE_KEYS.settings, state.settings);
      toast("復元しました");
      renderAll();
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("resetAllBtn").addEventListener("click", async () => {
    if (!await showConfirm("全ての記録・プラン・設定を削除します。この操作は取り消せません。よろしいですか？")) return;
    if (!await showConfirm("本当によろしいですか？バックアップを取っていない場合は先にエクスポートしてください。")) return;
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
    state = { plan: clonePlan(), workoutLogs: [], weightLogs: [], mealLogs: [], settings: defaultSettings() };
    toast("削除しました");
    renderAll();
  });

  renderAll();

  if ("serviceWorker" in navigator) {
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

init();
