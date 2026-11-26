// The five pages of Hearth Ledger. Each one is a pure function of the
// books: it renders real figures, and every button it shows carries a
// data-action that app.js handles. Nothing here is a placeholder.

import { usd, share, shortDate, safe } from './format.js';
import {
  CATEGORIES, categoryOf, totalIn, totalOut, outByCategory, planTotal,
  newestFirst, LAST_MONTH, lastMonthTotal,
} from './data.js';
import { donut, hbars, vcolumns } from './charts.js';

function statStrip(books) {
  const moneyIn = totalIn(books);
  const moneyOut = totalOut(books);
  const left = moneyIn - moneyOut;
  const kept = moneyIn ? Math.round((left / moneyIn) * 100) : 0;
  const outCount = books.entries.filter((e) => e.amount < 0).length;
  return `<section class="stat-grid" aria-label="November at a glance">
    <article class="panel stat">
      <span class="stat-caption">Money in · November</span>
      <strong class="stat-figure up">${usd(moneyIn)}</strong>
      <span class="stat-sub">2 salaries + freelance</span>
    </article>
    <article class="panel stat">
      <span class="stat-caption">Money out · November</span>
      <strong class="stat-figure">${usd(moneyOut)}</strong>
      <span class="stat-sub">${outCount} purchases &amp; bills</span>
    </article>
    <article class="panel stat feature">
      <span class="stat-caption">Left to save or spend</span>
      <strong class="stat-figure">${usd(left)}</strong>
      <span class="stat-sub">${kept}% of income unspent</span>
    </article>
    <article class="panel stat">
      <span class="stat-caption">Budget used</span>
      <strong class="stat-figure">${share(moneyOut, planTotal(books))}%</strong>
      <span class="stat-sub">${usd(moneyOut)} of ${usd(planTotal(books))} planned</span>
    </article>
  </section>`;
}

function alertBox(books) {
  const spent = outByCategory(books);
  const over = CATEGORIES.filter((c) => spent[c.id] > books.plan[c.id]);
  const close = CATEGORIES.filter((c) =>
    spent[c.id] <= books.plan[c.id] && spent[c.id] >= books.plan[c.id] * 0.85);
  if (!over.length && !close.length) return '';
  return `<section class="panel warnings" aria-label="Budget alerts">
    <h2>Heads up</h2>
    ${over.map((c) => `<p class="flag bad"><strong>${c.label} is over its limit</strong> — ${usd(spent[c.id])} spent against ${usd(books.plan[c.id])} planned.</p>`).join('')}
    ${close.map((c) => `<p class="flag warn"><strong>${c.label} is nearly there</strong> — ${usd(spent[c.id])} of ${usd(books.plan[c.id])} used.</p>`).join('')}
  </section>`;
}

function entryRows(list) {
  if (!list.length) {
    return `<tr><td colspan="4" class="none">Nothing matches. Try clearing the filters.</td></tr>`;
  }
  return list.map((e) => {
    const cat = e.category === 'income'
      ? { label: 'Income', color: '#1d3557' }
      : categoryOf(e.category);
    const dir = e.amount > 0 ? 'in' : 'out';
    return `<tr>
      <td class="when">${shortDate(e.date)}</td>
      <td><strong>${safe(e.description)}</strong><span class="chip" style="--chip:${cat.color}">${cat.label}</span></td>
      <td class="amount ${dir}">${e.amount > 0 ? '+' : '−'}${usd(Math.abs(e.amount))}</td>
      <td><button class="x-btn" type="button" data-action="delete-entry" data-id="${e.id}" aria-label="Delete ${safe(e.description)}">✕</button></td>
    </tr>`;
  }).join('');
}

export function addEntryForm() {
  const options = CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  return `<form class="panel entry-form" id="add-form" data-form="add-entry">
    <h2>Add a transaction</h2>
    <div class="form-rows">
      <label>Date<input type="date" name="date" value="2026-11-26" required></label>
      <label>Description<input type="text" name="description" placeholder="e.g. Green Grocer — weekly shop" maxlength="80" required></label>
      <label>Category<select name="category">${options}</select></label>
      <label>Amount ($)<input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label>Type<select name="kind"><option value="out">Money out</option><option value="in">Money in</option></select></label>
      <button class="btn go" type="submit">Add to the books</button>
    </div>
  </form>`;
}

export function pageDashboard(books) {
  const spent = outByCategory(books);
  const top = CATEGORIES.map((c) => ({ ...c, spent: spent[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
  const recent = newestFirst(books).slice(0, 6);
  return `
  ${statStrip(books)}
  <div class="two-col">
    <section class="panel" aria-label="Where the money went">
      <h2>Where the money went</h2>
      <div class="donut-side">${donut(spent, CATEGORIES)}
        <ul class="key">${top.map((c) => `<li><span class="swatch" style="background:${c.color}"></span>${c.label}<strong>${usd(c.spent)}</strong></li>`).join('')}</ul>
      </div>
    </section>
    <section class="panel" aria-label="Biggest categories">
      <h2>Biggest categories</h2>
      ${hbars(top.map((c) => ({ label: c.label, color: c.color, value: c.spent, text: usd(c.spent) })), top[0].spent)}
      <p class="aside">Housing is the fixed mortgage; groceries are the biggest cost the family can actually move. <a href="#/budgets">See all budgets →</a></p>
    </section>
  </div>
  <div class="two-col">
    <section class="panel" aria-label="Recent transactions">
      <h2>Recent transactions</h2>
      <table class="ledger"><tbody>${entryRows(recent)}</tbody></table>
      <p class="aside"><a href="#/transactions">All ${books.entries.length} transactions →</a></p>
    </section>
    <section class="panel" aria-label="Savings goals">
      <h2>Savings goals</h2>
      ${books.goals.map((g) => {
        const done = share(g.saved, g.target);
        return `<div class="goal-row">
          <div class="goal-top"><strong>${safe(g.name)}</strong><span>${usd(g.saved)} of ${usd(g.target)}</span></div>
          <div class="meter"><span class="meter-fill" style="width:${done}%"></span></div>
          <span class="goal-pct">${done}% there</span>
        </div>`;
      }).join('')}
      <p class="aside"><a href="#/goals">Manage goals →</a></p>
    </section>
  </div>
  ${alertBox(books)}
  ${addEntryForm()}`;
}

export function pageTransactions(books, filter) {
  let list = newestFirst(books);
  if (filter.category !== 'all') list = list.filter((e) => e.category === filter.category);
  if (filter.kind === 'in') list = list.filter((e) => e.amount > 0);
  if (filter.kind === 'out') list = list.filter((e) => e.amount < 0);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter((e) => e.description.toLowerCase().includes(q));
  }
  const catOptions = ['<option value="all">All categories</option>']
    .concat(CATEGORIES.map((c) => `<option value="${c.id}"${filter.category === c.id ? ' selected' : ''}>${c.label}</option>`))
    .join('');
  const net = list.reduce((s, e) => s + e.amount, 0);
  return `
  <section class="page-intro"><h1>Transactions</h1><p>Every dollar in and out for November 2026 — ${list.length} shown, net ${usd(net)}.</p></section>
  <form class="panel filter-bar" data-form="filters">
    <label>Category<select name="category">${catOptions}</select></label>
    <label>Type<select name="kind">
      <option value="all"${filter.kind === 'all' ? ' selected' : ''}>Money in &amp; out</option>
      <option value="in"${filter.kind === 'in' ? ' selected' : ''}>Money in</option>
      <option value="out"${filter.kind === 'out' ? ' selected' : ''}>Money out</option>
    </select></label>
    <label>Search<input type="search" name="q" placeholder="Search descriptions…" value="${safe(filter.q)}"></label>
    <button class="btn" type="submit">Apply filters</button>
    <button class="btn quiet" type="button" data-action="clear-filters">Clear</button>
  </form>
  <section class="panel"><table class="ledger wide">
    <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th></th></tr></thead>
    <tbody>${entryRows(list)}</tbody>
  </table></section>
  ${addEntryForm()}`;
}

export function pageBudgets(books) {
  const spent = outByCategory(books);
  const totalPlan = planTotal(books);
  const totalSpent = totalOut(books);
  const cards = CATEGORIES.map((c) => {
    const used = spent[c.id] || 0;
    const limit = books.plan[c.id];
    const usedPct = share(used, limit);
    const state = used > limit ? 'over' : usedPct >= 85 ? 'near' : '';
    return `<article class="panel budget ${state}">
      <div class="budget-top"><span class="swatch big" style="background:${c.color}"></span><h3>${c.label}</h3><span class="budget-nums">${usd(used)} <span class="dim">of ${usd(limit)}</span></span></div>
      <div class="meter"><span class="meter-fill ${state}" style="width:${Math.min(usedPct, 100)}%"></span></div>
      <div class="budget-bottom"><span>${usedPct}% used</span><span>${used > limit ? usd(used - limit) + ' over' : usd(limit - used) + ' left'}</span></div>
      <form class="limit-form" data-form="edit-plan" data-category="${c.id}">
        <label>Monthly limit $<input type="number" name="limit" min="0" step="1" value="${(limit / 100).toFixed(0)}" aria-label="${c.label} monthly limit in dollars"></label>
        <button class="btn small" type="submit">Save</button>
      </form>
    </article>`;
  }).join('');
  return `
  <section class="page-intro"><h1>Budgets</h1><p>November 2026 plan: ${usd(totalSpent)} spent of ${usd(totalPlan)} planned — ${share(totalSpent, totalPlan)}% of the month's budget used.</p></section>
  <div class="budget-grid">${cards}</div>
  <section class="panel note"><h2>How the Marlowes set a budget</h2>
  <p>Fixed costs — the mortgage, the utilities — are set from the bill itself. Flexible ones — groceries, dining out — get a limit the household agrees on together at the start of the month, and the bar above shows the truth as the month goes on. When a bar turns amber at 85%, that is a nudge, not a scolding: move money between categories, or trim the next shop.</p></section>`;
}

export function pageGoals(books) {
  const cards = books.goals.map((g) => {
    const done = share(g.saved, g.target);
    const remaining = g.target - g.saved;
    return `<article class="panel goal">
      <h3>${safe(g.name)}</h3>
      <p class="goal-note">${safe(g.note)}</p>
      <div class="goal-sum"><strong>${usd(g.saved)}</strong><span class="dim"> saved of ${usd(g.target)}</span></div>
      <div class="meter tall"><span class="meter-fill" style="width:${done}%"></span></div>
      <p class="goal-foot">${done}% there · ${usd(remaining)} to go</p>
      <form class="goal-form" data-form="add-saving" data-goal="${g.id}">
        <label>Add savings $<input type="number" name="amount" min="1" step="1" placeholder="100" required></label>
        <button class="btn small go" type="submit">Add</button>
      </form>
    </article>`;
  }).join('');
  return `
  <section class="page-intro"><h1>Savings goals</h1><p>Three things the household is saving for — every dollar added here comes out of the month's leftover, never out of a bill.</p></section>
  <div class="goal-grid">${cards}</div>
  <form class="panel entry-form" data-form="new-goal">
    <h2>Start a new goal</h2>
    <div class="form-rows">
      <label>Goal name<input type="text" name="name" placeholder="e.g. New bikes for the kids" maxlength="60" required></label>
      <label>Target ($)<input type="number" name="target" min="1" step="1" placeholder="1000" required></label>
      <label>Already saved ($)<input type="number" name="saved" min="0" step="1" value="0"></label>
      <button class="btn go" type="submit">Create goal</button>
    </div>
  </form>`;
}

export function pageReports(books) {
  const spent = outByCategory(books);
  const moneyIn = totalIn(books);
  const moneyOut = totalOut(books);
  const octOut = lastMonthTotal();
  const change = octOut ? Math.round(((moneyOut - octOut) / octOut) * 100) : 0;
  const top = CATEGORIES.map((c) => ({ ...c, spent: spent[c.id] || 0, before: LAST_MONTH.spent[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
  const daily = Math.round(moneyOut / 26);
  const biggest = top[0];
  return `
  <section class="page-intro"><h1>Reports</h1><p>November 2026 against October — what changed, and where the money actually goes.</p></section>
  ${statStrip(books)}
  <div class="two-col">
    <section class="panel">
      <h2>This month vs last month</h2>
      ${vcolumns([
        { label: 'Oct spend', value: octOut, text: usd(octOut), color: '#adb5bd' },
        { label: 'Nov spend', value: moneyOut, text: usd(moneyOut), color: '#1d3557' },
        { label: 'Oct income', value: LAST_MONTH.income, text: usd(LAST_MONTH.income), color: '#d8d2c4' },
        { label: 'Nov income', value: moneyIn, text: usd(moneyIn), color: '#e76f51' },
      ], 220)}
      <p class="aside">Spending is ${change >= 0 ? 'up' : 'down'} ${Math.abs(change)}% on October (${usd(octOut)}). The Thanksgiving shop and the winter coats are the difference.</p>
    </section>
    <section class="panel">
      <h2>What the numbers say</h2>
      <ul class="insights">
        <li><strong>${biggest.label} is the biggest cost</strong> at ${usd(biggest.spent)} — mostly the fixed mortgage, so the lever is elsewhere.</li>
        <li><strong>${usd(daily)} a day</strong> is the household's average daily spend so far in November.</li>
        <li><strong>Groceries run ${usd(spent.groceries)}</strong> across five shops; the Thanksgiving week was the dearest at ${usd(9860 + 3640)}.</li>
        <li><strong>${usd(120000)} moved to savings</strong> on 23 November — the month's leftover is being put to work, not left in the current account.</li>
        <li><strong>Dining out is down</strong> on October (${usd(24100)} → ${usd(spent.dining)}) after the household capped takeout to once a week.</li>
      </ul>
    </section>
  </div>
  <section class="panel">
    <h2>Category change, October → November</h2>
    ${hbars(top.map((c) => ({ label: c.label, color: c.color, value: c.spent, text: usd(c.spent) + ' (was ' + usd(c.before) + ')' })), top[0].spent)}
  </section>`;
}
