// Hearth Ledger — boot, hash routing, and every control's behaviour.
//
// The books (data.js) are the single source of truth. Pages render them,
// and every form and button here writes back through them, saves, and
// re-renders, so no view can ever disagree with another.

import {
  readBooks, writeBooks, wipeBooks, freshId, HOUSEHOLD,
} from './data.js';
import { monthName } from './format.js';
import {
  pageDashboard, pageTransactions, pageBudgets, pageGoals, pageReports,
} from './pages.js';

let books = readBooks();
const app = document.getElementById('app');
const filter = { category: 'all', kind: 'all', q: '' };
let toastId = null;

function toast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastId);
  toastId = setTimeout(() => el.classList.remove('show'), 2600);
}

function routeName() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/transactions')) return 'transactions';
  if (hash.startsWith('#/budgets')) return 'budgets';
  if (hash.startsWith('#/goals')) return 'goals';
  if (hash.startsWith('#/reports')) return 'reports';
  return 'dashboard';
}

function draw() {
  const route = routeName();
  document.querySelectorAll('.ledger-nav a').forEach((a) => {
    a.classList.toggle('on', a.dataset.nav === route);
  });
  if (route === 'transactions') app.innerHTML = pageTransactions(books, filter);
  else if (route === 'budgets') app.innerHTML = pageBudgets(books);
  else if (route === 'goals') app.innerHTML = pageGoals(books);
  else if (route === 'reports') app.innerHTML = pageReports(books);
  else app.innerHTML = pageDashboard(books);
  window.scrollTo(0, 0);
}

function saveAndDraw() {
  writeBooks(books);
  draw();
}

function dollarsToCents(value) {
  const n = Math.round(parseFloat(value) * 100);
  return Number.isFinite(n) && n > 0 ? n : null;
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  const kind = form.dataset.form;
  const fields = new FormData(form);

  if (kind === 'add-entry') {
    const cents = dollarsToCents(fields.get('amount'));
    if (!cents) { toast('Enter an amount above $0.'); return; }
    const incoming = fields.get('kind') === 'in';
    books.entries.push({
      id: freshId(),
      date: fields.get('date') || '2026-11-26',
      description: String(fields.get('description') || 'Untitled').trim().slice(0, 80) || 'Untitled',
      category: incoming ? 'income' : String(fields.get('category')),
      amount: incoming ? cents : -cents,
    });
    saveAndDraw();
    toast(incoming ? 'Income added.' : 'Expense added.');
  }

  if (kind === 'filters') {
    filter.category = String(fields.get('category') || 'all');
    filter.kind = String(fields.get('kind') || 'all');
    filter.q = String(fields.get('q') || '').trim();
    draw();
  }

  if (kind === 'edit-plan') {
    const raw = fields.get('limit');
    const cents = dollarsToCents(raw);
    if (cents === null && raw !== '0') { toast('Enter a limit of $0 or more.'); return; }
    books.plan[form.dataset.category] = cents === null ? 0 : cents;
    saveAndDraw();
    toast('Budget updated.');
  }

  if (kind === 'add-saving') {
    const cents = dollarsToCents(fields.get('amount'));
    if (!cents) { toast('Enter an amount above $0.'); return; }
    const goal = books.goals.find((g) => g.id === form.dataset.goal);
    if (!goal) return;
    goal.saved = Math.min(goal.saved + cents, goal.target);
    saveAndDraw();
    toast(goal.saved >= goal.target ? goal.name + ' is fully funded!' : 'Added to ' + goal.name + '.');
  }

  if (kind === 'new-goal') {
    const target = dollarsToCents(fields.get('target'));
    if (!target) { toast('Enter a target above $0.'); return; }
    const saved = dollarsToCents(fields.get('saved')) || 0;
    books.goals.push({
      id: freshId(),
      name: String(fields.get('name') || 'New goal').trim().slice(0, 60) || 'New goal',
      target,
      saved: Math.min(saved, target),
      note: 'Added by the household in November 2026.',
    });
    saveAndDraw();
    toast('Goal created.');
  }
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'delete-entry') {
    const entry = books.entries.find((e) => e.id === button.dataset.id);
    books.entries = books.entries.filter((e) => e.id !== button.dataset.id);
    saveAndDraw();
    toast(entry ? 'Deleted: ' + entry.description : 'Deleted.');
  }

  if (action === 'clear-filters') {
    filter.category = 'all';
    filter.kind = 'all';
    filter.q = '';
    draw();
  }

  if (action === 'reset-demo') {
    if (window.confirm('Reset the household books back to the November demo figures? Your added transactions will be gone.')) {
      books = wipeBooks();
      filter.category = 'all';
      filter.kind = 'all';
      filter.q = '';
      writeBooks(books);
      draw();
      toast('Demo data restored.');
    }
  }
});

document.getElementById('household').textContent = HOUSEHOLD.name;
document.getElementById('month-now').textContent = monthName(HOUSEHOLD.month.year, HOUSEHOLD.month.month);

window.addEventListener('hashchange', draw);
draw();
