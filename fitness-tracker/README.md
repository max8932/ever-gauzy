# Iron Ledger

A gym training log: record each session set by set, and track consistency,
training volume and strength progress over time.

Single self-contained HTML file — no build step, no dependencies, no backend.

## What it tracks

- **Sessions** — date, focus (push / pull / legs / …), duration, session RPE, notes.
- **Lifts** — each lift with its individual sets as `weight × reps`, with live
  tonnage and estimated 1RM as you type.
- **Ledger** — the current training week at a glance, against a weekly session
  target, plus week streak, day streak, total volume and time trained.
- **Volume** — training volume (weight × reps) per week over the last 12 weeks.
- **Consistency** — a day-by-day grid of the last 20 weeks, shaded by how much
  was moved that day.
- **Records** — best set and best estimated 1RM per lift, with a progression
  chart for the selected lift.

Estimated 1RM uses the Epley formula: `weight × (1 + reps ÷ 30)`. Lifts logged
with any unloaded set are treated as bodyweight movements and ranked by reps
instead, since an estimated 1RM from added weight alone would be meaningless.

Weights can be entered in kg or lb; they're stored internally in kg, so
switching units converts the whole history rather than relabelling it.

## Running it

Open `index.html` in a browser, or serve the folder:

```bash
cd fitness-tracker
python3 -m http.server 8080
# http://localhost:8080
```

## Where the data lives

Opened as a plain file, the log is kept in the browser's `localStorage` under
the `ironledger.*` keys — it stays on that device and in that browser. Use
**Export JSON** in the History view to copy a backup out.

The same page is also published as a Claude Artifact, where it persists through
the artifact `db` capability instead and follows you across devices. The page
detects which is available at load time and falls back to `localStorage`, so the
one file works in both places. The indicator in the header shows which is in use.

Until something is logged, the page shows a sample twelve-week training block so
the charts have something to say; it is clearly marked and is discarded the
moment a real session is saved.
