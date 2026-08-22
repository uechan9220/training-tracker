// 依存ライブラリなしの軽量SVGチャート（体重・カロリー・重量推移の折れ線／棒グラフ用）

function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function niceStep(range) {
  if (range <= 0) return 1;
  const rough = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

// points: [{ label: string, value: number }]
// opts: { type: 'line'|'bar', color, unit, refLine: {value,label}, height }
function renderChart(container, points, opts) {
  container.innerHTML = "";
  if (!points || points.length === 0) {
    const div = document.createElement("div");
    div.className = "chart-empty";
    div.textContent = "まだデータがありません";
    container.appendChild(div);
    return;
  }

  const opt = Object.assign({ type: "line", color: "#3b82f6", unit: "", height: 220 }, opts);
  const W = 600, H = opt.height;
  const padL = 40, padR = 16, padT = 18, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const values = points.map(p => p.value);
  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  if (opt.refLine) {
    minV = Math.min(minV, opt.refLine.value);
    maxV = Math.max(maxV, opt.refLine.value);
  }
  if (opt.type === "bar") minV = Math.min(minV, 0); // bars must start at a zero baseline
  if (minV === maxV) { minV -= 1; maxV += 1; }
  const step = niceStep(maxV - minV);
  const gridMin = Math.floor(minV / step) * step;
  const gridMax = Math.ceil(maxV / step) * step;
  const range = gridMax - gridMin || 1;

  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });

  const yAt = v => padT + plotH - ((v - gridMin) / range) * plotH;
  const n = points.length;
  const xAt = i => n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW;

  // gridlines + y labels
  for (let gv = gridMin; gv <= gridMax + 0.0001; gv += step) {
    const y = yAt(gv);
    svg.appendChild(svgEl("line", { x1: padL, x2: W - padR, y1: y, y2: y, stroke: "#2c2f36", "stroke-width": 1 }));
    const t = svgEl("text", { x: padL - 6, y: y + 4, "text-anchor": "end", "font-size": 10, fill: "#8a8f98" });
    t.textContent = Number.isInteger(step) ? gv.toFixed(0) : gv.toFixed(1);
    svg.appendChild(t);
  }

  // reference line (goal / target)
  if (opt.refLine) {
    const y = yAt(opt.refLine.value);
    const line = svgEl("line", { x1: padL, x2: W - padR, y1: y, y2: y, stroke: "#f59e0b", "stroke-width": 1.5, "stroke-dasharray": "4,4" });
    svg.appendChild(line);
    const t = svgEl("text", { x: W - padR, y: y - 5, "text-anchor": "end", "font-size": 10, fill: "#f59e0b" });
    t.textContent = opt.refLine.label;
    svg.appendChild(t);
  }

  // x labels: show at most ~6, always first & last
  const maxLabels = 6;
  const labelEvery = Math.max(1, Math.ceil(n / maxLabels));
  points.forEach((p, i) => {
    if (i % labelEvery === 0 || i === n - 1) {
      const t = svgEl("text", { x: xAt(i), y: H - 8, "text-anchor": "middle", "font-size": 10, fill: "#8a8f98" });
      t.textContent = p.label;
      svg.appendChild(t);
    }
  });

  if (opt.type === "bar") {
    const bw = Math.min(28, (plotW / n) * 0.6);
    points.forEach((p, i) => {
      const x = xAt(i) - bw / 2;
      const y = yAt(p.value);
      const h = padT + plotH - y;
      svg.appendChild(svgEl("rect", { x, y, width: bw, height: Math.max(0, h), fill: opt.color, rx: 3 }));
    });
  } else {
    let d = "";
    points.forEach((p, i) => {
      d += (i === 0 ? "M" : "L") + xAt(i) + "," + yAt(p.value) + " ";
    });
    svg.appendChild(svgEl("path", { d, fill: "none", stroke: opt.color, "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" }));

    const showAllLabels = n <= 8;
    points.forEach((p, i) => {
      const cx = xAt(i), cy = yAt(p.value);
      svg.appendChild(svgEl("circle", { cx, cy, r: 3.5, fill: opt.color }));
      if (showAllLabels || i === 0 || i === n - 1) {
        const t = svgEl("text", { x: cx, y: cy - 9, "text-anchor": "middle", "font-size": 10, fill: "#eee" });
        t.textContent = (Number.isInteger(p.value) ? p.value : p.value.toFixed(1)) + opt.unit;
        svg.appendChild(t);
      }
      const title = svgEl("title", {});
      title.textContent = `${p.label}: ${p.value}${opt.unit}`;
      svg.appendChild(title);
    });
  }

  container.appendChild(svg);
}
