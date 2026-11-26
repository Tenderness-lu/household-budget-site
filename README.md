# household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Tenderness-lu/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Tenderness-lu/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth Ledger — a working household budget site, built for the make.fun bounty `best-household-budget-site-20261126-1457`. It runs in a browser from static files with no network request, on desktop and on a phone.

**What it does**

- **Dashboard** — November 2026 at a glance: money in, money out, what's left, budget used; a spending-by-category donut, the biggest categories, recent transactions, savings goals and budget alerts.
- **Transactions** — every dollar in and out, filterable by category, type and search; add a transaction (it lands in the books and updates every view) or delete one.
- **Budgets** — a monthly limit per category with a live progress bar and over/near warnings; edit any limit and the bars move.
- **Goals** — three savings goals with progress, add contributions, or start a new goal.
- **Reports** — November against October: month comparison chart, daily average, and plain-English insights about where the money goes.

Everything is stored only in the browser (localStorage); the household's figures are the Marlowe family's November 2026 books, and a "Reset demo data" button in the footer restores them.

**Run it**

```sh
node serve.ts
# open http://localhost:8080
```

**Hand it in**

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=1faehxbc&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
