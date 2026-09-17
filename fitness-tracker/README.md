# FitTrack — Gym Session Tracker

A lightweight, standalone web app for logging gym sessions and tracking training
consistency and progress. No build step, no backend, no dependencies — just
static HTML/CSS/JS that stores your data locally in the browser.

## Features

- **Log sessions** — date, workout type, duration, perceived effort (1-10), and free-form notes/exercises.
- **Dashboard** — total sessions, current streak, longest streak, sessions this week, total minutes trained.
- **Weekly goal** — set how many sessions/week you're aiming for and track progress toward it.
- **Sessions-per-week chart** — a simple bar chart of the last 10 weeks.
- **Consistency heatmap** — GitHub-style heatmap of the last 18 weeks.
- **History** — searchable, editable, deletable list of all past sessions.
- **Export / Import** — back up or move your data as a JSON file.
- **Light / dark theme.**

## Running it

No install required. Just open `index.html` in a browser, or serve the folder:

```bash
cd fitness-tracker
python3 -m http.server 8080
# then open http://localhost:8080
```

## Data storage

All data is kept in the browser's `localStorage` under the `fittrack.*` keys —
nothing is sent to a server. Use the **Export** button regularly to keep a
backup, especially before clearing browser data.
