// Small pure helpers: money, dates, and safe text. No DOM here.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// $10,690.00 — cents in, a readable dollar figure out.
export function usd(cents) {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  return (neg ? '-$' : '$') + whole.toLocaleString('en-US') + '.' + rest;
}

// $5k for tight spaces like a chart centre.
export function usdShort(cents) {
  if (Math.abs(cents) >= 100000) {
    return '$' + (cents / 100000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return usd(cents);
}

// Whole percent, 0 when there is nothing to divide by.
export function share(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function monthName(year, month) {
  return MONTH_NAMES[month - 1] + ' ' + year;
}

// "2026-11-26" -> "Nov 26".
export function shortDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return MONTH_NAMES[d.getMonth()].slice(0, 3) + ' ' + d.getDate();
}

// Escape user text before it is placed into the page.
export function safe(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
