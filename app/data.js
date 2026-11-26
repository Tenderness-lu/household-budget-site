// Hearth Ledger — the Marlowe household's books for November 2026.
//
// One store, one truth: every page reads its figures from here and every
// edit writes back through here. Money is kept in whole cents so the sums
// never drift. The books persist in localStorage; the footer button wipes
// them back to these seed figures.
//
// Seed rows are compact tuples: [day, description, category, cents].
// A positive amount is money coming in, a negative one money going out.

export const HOUSEHOLD = {
  name: 'The Marlowe Household',
  people: ['Ana Marlowe', 'Ben Marlowe', 'Mia Marlowe', 'Leo Marlowe'],
  month: { year: 2026, month: 11 },
};

export const CATEGORIES = [
  { id: 'housing',   label: 'Housing',      color: '#1d3557', glyph: '⌂' },
  { id: 'groceries', label: 'Groceries',    color: '#2a9d8f', glyph: '◍' },
  { id: 'utilities', label: 'Utilities',    color: '#8a6d1b', glyph: '⚡' },
  { id: 'transport', label: 'Transport',    color: '#e76f51', glyph: '➢' },
  { id: 'dining',    label: 'Dining out',   color: '#f4a261', glyph: '✿' },
  { id: 'health',    label: 'Health',       color: '#457b9d', glyph: '✚' },
  { id: 'kids',      label: 'Kids',         color: '#9b5de5', glyph: '♥' },
  { id: 'home',      label: 'Home',         color: '#8d6b4a', glyph: '⚒' },
  { id: 'fun',       label: 'Fun & media',  color: '#ef476f', glyph: '♫' },
  { id: 'clothing',  label: 'Clothing',     color: '#495057', glyph: '✂' },
  { id: 'other',     label: 'Other',        color: '#6c757d', glyph: '•' },
];

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

// Planned monthly limit per category, in cents. The "Other" line holds the
// household's planned $1,200 transfer to the emergency fund, so the money
// moved on 23 November sits inside the plan rather than over it.
export const PLAN = {
  housing: 185000,
  groceries: 65000,
  utilities: 26000,
  transport: 32000,
  dining: 22000,
  health: 18000,
  kids: 28000,
  home: 20000,
  fun: 12000,
  clothing: 15000,
  other: 130000,
};

export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 1000000, saved: 640000,
    note: 'Six months of essentials, kept in a high-yield savings account.' },
  { id: 'g2', name: 'Summer road trip', target: 350000, saved: 185000,
    note: 'Two weeks down the coast in July — cabin, fuel and food.' },
  { id: 'g3', name: 'Replace the sedan', target: 800000, saved: 230000,
    note: 'The 2014 sedan is on its last legs; aiming for a used hybrid.' },
];

// The November ledger, 29 entries, oldest first.
const SEED_ROWS = [
  ['2026-11-01', 'Ana — salary, Northwind Studio', 'income', 485000],
  ['2026-11-01', 'Ben — salary, City Library', 'income', 520000],
  ['2026-11-01', 'Mortgage — First Community Bank', 'housing', -185000],
  ['2026-11-02', 'Green Grocer — weekly shop', 'groceries', -14260],
  ['2026-11-03', 'City power & light', 'utilities', -11840],
  ['2026-11-04', 'Fuel — Route 9 station', 'transport', -4820],
  ['2026-11-05', 'Mia — piano lessons', 'kids', -9000],
  ['2026-11-06', 'Trattoria Verde — family dinner', 'dining', -7640],
  ['2026-11-07', 'Green Grocer — weekly shop', 'groceries', -12890],
  ['2026-11-08', 'StreamBox + MusicPass', 'fun', -2798],
  ['2026-11-09', 'Pharmacy — flu shots x2', 'health', -6400],
  ['2026-11-10', 'Ben — freelance illustration', 'income', 64000],
  ['2026-11-11', 'Water & sewer', 'utilities', -6240],
  ['2026-11-12', 'Hardware store — faucet repair', 'home', -8650],
  ['2026-11-13', 'Green Grocer — weekly shop', 'groceries', -15430],
  ['2026-11-14', 'Bus passes — Ana & Ben', 'transport', -9600],
  ['2026-11-15', 'Leo — soccer fees', 'kids', -7500],
  ['2026-11-16', 'Noodle House — takeout', 'dining', -4230],
  ['2026-11-17', 'Dentist — Leo checkup', 'health', -7800],
  ['2026-11-18', 'Green Grocer — weekly shop', 'groceries', -13120],
  ['2026-11-19', 'Internet & mobile', 'utilities', -13420],
  ['2026-11-20', 'Fuel — Route 9 station', 'transport', -5140],
  ['2026-11-21', 'Winter coats — Mia & Leo', 'clothing', -11200],
  ['2026-11-22', 'Farmers market', 'groceries', -5640],
  ['2026-11-23', 'Cinema — family night', 'fun', -4850],
  ['2026-11-24', 'Transfer to emergency fund', 'other', -120000],
  ['2026-11-25', 'Green Grocer — Thanksgiving shop', 'groceries', -9860],
  ['2026-11-25', 'Bakery — Thanksgiving pies', 'dining', -3640],
  ['2026-11-26', 'Bookshop — Mia birthday gift', 'kids', -3250],
];

// October 2026, kept so the Reports page can compare month against month.
export const LAST_MONTH = {
  year: 2026,
  month: 10,
  income: 1069000,
  spent: {
    housing: 185000, groceries: 58900, utilities: 24700, transport: 30100,
    dining: 24100, health: 11900, kids: 21500, home: 9800, fun: 11200,
    clothing: 6400, other: 12400,
  },
};

const KEY = 'hearth-ledger-v2';

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function seedBooks() {
  return {
    entries: SEED_ROWS.map(([date, description, category, amount], i) => ({
      id: 'n' + String(i + 1).padStart(2, '0'),
      date,
      description,
      category,
      amount,
    })),
    plan: { ...PLAN },
    goals: deepCopy(SEED_GOALS),
  };
}

export function readBooks() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedBooks();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.entries) || typeof parsed.plan !== 'object' || !Array.isArray(parsed.goals)) {
      return seedBooks();
    }
    return parsed;
  } catch {
    return seedBooks();
  }
}

export function writeBooks(books) {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
  } catch {
    // Storage full or private mode: the site still works for this visit.
  }
}

export function wipeBooks() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return seedBooks();
}

// ---- Figures every page reads. Nothing else sums the books. ----

export function totalIn(books) {
  return books.entries.filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
}

export function totalOut(books) {
  return books.entries.filter((e) => e.amount < 0).reduce((sum, e) => sum - e.amount, 0);
}

export function outByCategory(books) {
  const totals = {};
  for (const c of CATEGORIES) totals[c.id] = 0;
  for (const e of books.entries) {
    if (e.amount < 0 && totals[e.category] !== undefined) totals[e.category] -= e.amount;
  }
  return totals;
}

export function planTotal(books) {
  return Object.values(books.plan).reduce((sum, v) => sum + v, 0);
}

export function newestFirst(books) {
  return [...books.entries].sort((a, b) =>
    b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function lastMonthTotal() {
  return Object.values(LAST_MONTH.spent).reduce((sum, v) => sum + v, 0);
}

export function freshId() {
  return 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
}
