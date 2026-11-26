// Charts drawn straight from the household's figures — no library, no
// network. Each one is plain SVG or plain divs, so the picture can never
// disagree with the numbers beside it.

import { usd, usdShort } from './format.js';

// Donut of spending by category, built from arc paths: each slice is a
// wedge from the centre, with a thin gap between neighbours. The middle
// carries the month's total spend.
export function donut(spent, categories) {
  const total = Object.values(spent).reduce((s, v) => s + v, 0);
  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 104;
  const inner = 66;
  const shown = categories
    .map((c) => ({ ...c, spent: spent[c.id] || 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  let angle = -Math.PI / 2;
  let wedges = '';
  for (const c of shown) {
    const frac = c.spent / total;
    const sweep = frac * Math.PI * 2;
    const gap = 0.015;
    const a0 = angle + gap;
    const a1 = angle + sweep - gap;
    const large = sweep - 2 * gap > Math.PI ? 1 : 0;
    const x0 = cx + outer * Math.cos(a0);
    const y0 = cy + outer * Math.sin(a0);
    const x1 = cx + outer * Math.cos(a1);
    const y1 = cy + outer * Math.sin(a1);
    const x2 = cx + inner * Math.cos(a1);
    const y2 = cy + inner * Math.sin(a1);
    const x3 = cx + inner * Math.cos(a0);
    const y3 = cy + inner * Math.sin(a0);
    wedges += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${outer} ${outer} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z" fill="${c.color}"><title>${c.label}: ${usd(c.spent)}</title></path>`;
    angle += sweep;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category, total ${usd(total)}">
    ${wedges}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-centre">${usdShort(total)}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-sub">spent in Nov</text>
  </svg>`;
}

// One horizontal row per item: label, a track filled to the biggest value,
// and the figure on the right.
export function hbars(rows, biggest) {
  return rows.map((row) => {
    const width = biggest ? Math.max((row.value / biggest) * 100, 2) : 0;
    return `<div class="hbar">
      <span class="hbar-name"><span class="swatch" style="background:${row.color}"></span>${row.label}</span>
      <span class="hbar-track"><span class="hbar-fill" style="width:${width.toFixed(1)}%;background:${row.color}"></span></span>
      <span class="hbar-value">${row.text}</span>
    </div>`;
  }).join('');
}

// A row of vertical columns, each labelled underneath, for comparing two
// months side by side.
export function vcolumns(bars, height) {
  const top = Math.max(...bars.map((b) => b.value), 1);
  return `<div class="vcols" style="height:${height}px">` + bars.map((b) => {
    const h = Math.max(((b.value / top) * (height - 42)).toFixed(0), 4);
    return `<div class="vcol">
      <span class="vcol-value">${b.text}</span>
      <span class="vcol-fill" style="height:${h}px;background:${b.color}" title="${b.label}: ${b.text}"></span>
      <span class="vcol-label">${b.label}</span>
    </div>`;
  }).join('') + '</div>';
}
