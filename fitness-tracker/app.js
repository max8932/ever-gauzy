const STORAGE_KEY = 'fittrack.sessions.v1';
const GOAL_KEY = 'fittrack.weeklyGoal.v1';
const THEME_KEY = 'fittrack.theme.v1';

const els = {
  tabs: document.getElementById('tabs'),
  panels: document.querySelectorAll('.tab-panel'),
  form: document.getElementById('sessionForm'),
  editId: document.getElementById('editId'),
  fDate: document.getElementById('fDate'),
  fType: document.getElementById('fType'),
  fDuration: document.getElementById('fDuration'),
  fEffort: document.getElementById('fEffort'),
  fNotes: document.getElementById('fNotes'),
  formTitle: document.getElementById('formTitle'),
  submitBtn: document.getElementById('submitBtn'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  historyList: document.getElementById('historyList'),
  historySearch: document.getElementById('historySearch'),
  emptyState: document.getElementById('emptyState'),
  statTotal: document.getElementById('statTotal'),
  statStreak: document.getElementById('statStreak'),
  statLongest: document.getElementById('statLongest'),
  statWeek: document.getElementById('statWeek'),
  statMinutes: document.getElementById('statMinutes'),
  goalSlider: document.getElementById('goalSlider'),
  goalBar: document.getElementById('goalBar'),
  goalText: document.getElementById('goalText'),
  weeklyChart: document.getElementById('weeklyChart'),
  heatmap: document.getElementById('heatmap'),
  themeToggle: document.getElementById('themeToggle'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
};

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function dateKey(d) {
  return d; // stored already as YYYY-MM-DD
}

function todayKey() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const msPerDay = 86400000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

let sessions = loadSessions();

// ---- Tabs ----
els.tabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const target = btn.dataset.tab;
  els.panels.forEach((p) => p.classList.toggle('active', p.id === target));
});

// ---- Theme ----
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    els.themeToggle.textContent = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    els.themeToggle.textContent = '🌙';
  }
}
let currentTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(currentTheme);
els.themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
  renderChart();
});

// ---- Form ----
els.fDate.value = todayKey();

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = els.editId.value;
  const entry = {
    id: id || uid(),
    date: els.fDate.value,
    type: els.fType.value,
    duration: Number(els.fDuration.value) || 0,
    effort: Number(els.fEffort.value) || 0,
    notes: els.fNotes.value.trim(),
  };
  if (id) {
    sessions = sessions.map((s) => (s.id === id ? entry : s));
  } else {
    sessions.push(entry);
  }
  saveSessions(sessions);
  resetForm();
  renderAll();
  document.querySelector('.tab-btn[data-tab="history"]').click();
});

els.cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  els.editId.value = '';
  els.form.reset();
  els.fDate.value = todayKey();
  els.fDuration.value = 60;
  els.fEffort.value = 7;
  els.formTitle.textContent = 'Log a Gym Session';
  els.submitBtn.textContent = 'Save Session';
  els.cancelEditBtn.hidden = true;
}

function editSession(id) {
  const s = sessions.find((x) => x.id === id);
  if (!s) return;
  els.editId.value = s.id;
  els.fDate.value = s.date;
  els.fType.value = s.type;
  els.fDuration.value = s.duration;
  els.fEffort.value = s.effort;
  els.fNotes.value = s.notes;
  els.formTitle.textContent = 'Edit Session';
  els.submitBtn.textContent = 'Update Session';
  els.cancelEditBtn.hidden = false;
  document.querySelector('.tab-btn[data-tab="log"]').click();
}

function deleteSession(id) {
  if (!confirm('Delete this session?')) return;
  sessions = sessions.filter((s) => s.id !== id);
  saveSessions(sessions);
  renderAll();
}

// ---- History ----
els.historySearch.addEventListener('input', renderHistory);

function renderHistory() {
  const q = els.historySearch.value.trim().toLowerCase();
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = sorted.filter(
    (s) => !q || s.type.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q)
  );
  els.historyList.innerHTML = '';
  els.emptyState.hidden = sessions.length !== 0;

  filtered.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-main">
        <div class="history-top">
          <span class="history-date">${formatDate(s.date)}</span>
          <span class="badge">${escapeHtml(s.type)}</span>
        </div>
        <div class="history-meta">${s.duration} min · effort ${s.effort}/10</div>
        ${s.notes ? `<div class="history-notes">${escapeHtml(s.notes)}</div>` : ''}
      </div>
      <div class="history-actions">
        <button class="edit" title="Edit" data-id="${s.id}">✏️</button>
        <button class="delete" title="Delete" data-id="${s.id}">🗑️</button>
      </div>
    `;
    els.historyList.appendChild(item);
  });
}

els.historyList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit');
  const delBtn = e.target.closest('.delete');
  if (editBtn) editSession(editBtn.dataset.id);
  if (delBtn) deleteSession(delBtn.dataset.id);
});

function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Stats ----
function uniqueDatesSorted() {
  return [...new Set(sessions.map((s) => s.date))].sort();
}

function computeStreaks() {
  const dates = new Set(sessions.map((s) => s.date));
  if (dates.size === 0) return { current: 0, longest: 0 };

  // longest streak over all dates
  const sorted = [...dates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // current streak counting back from today (or yesterday if no session today)
  let current = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const cursorKey = () => {
    const d = new Date(cursor);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  if (!dates.has(cursorKey())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(cursorKey())) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

function startOfWeek(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7; // Monday-based
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function renderStats() {
  els.statTotal.textContent = sessions.length;
  const { current, longest } = computeStreaks();
  els.statStreak.textContent = current;
  els.statLongest.textContent = longest;

  const weekStart = startOfWeek(new Date());
  const thisWeekCount = sessions.filter((s) => new Date(s.date + 'T00:00:00') >= weekStart).length;
  els.statWeek.textContent = thisWeekCount;

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  els.statMinutes.textContent = totalMinutes.toLocaleString();

  updateGoal(thisWeekCount);
}

// ---- Goal ----
let weeklyGoal = Number(localStorage.getItem(GOAL_KEY)) || 3;
els.goalSlider.value = weeklyGoal;
els.goalSlider.addEventListener('input', () => {
  weeklyGoal = Number(els.goalSlider.value);
  localStorage.setItem(GOAL_KEY, weeklyGoal);
  renderStats();
});

function updateGoal(thisWeekCount) {
  const pct = Math.min(100, Math.round((thisWeekCount / weeklyGoal) * 100));
  els.goalBar.style.width = pct + '%';
  els.goalText.textContent = `${thisWeekCount} / ${weeklyGoal} sessions this week`;
}

// ---- Weekly chart (canvas bar chart, last 10 weeks) ----
function renderChart() {
  const canvas = els.weeklyChart;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth;
  const cssHeight = 160;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const weeks = 10;
  const now = new Date();
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = startOfWeek(now);
    ws.setDate(ws.getDate() - i * 7);
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    const count = sessions.filter((s) => {
      const d = new Date(s.date + 'T00:00:00');
      return d >= ws && d < we;
    }).length;
    buckets.push({ label: `${ws.getMonth() + 1}/${ws.getDate()}`, count });
  }

  const max = Math.max(1, ...buckets.map((b) => b.count));
  const padding = 24;
  const chartWidth = cssWidth - padding * 2;
  const chartHeight = cssHeight - 30;
  const barWidth = chartWidth / weeks - 8;

  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue('--primary').trim() || '#4f46e5';
  const textMuted = styles.getPropertyValue('--text-muted').trim() || '#64748b';

  buckets.forEach((b, i) => {
    const x = padding + i * (chartWidth / weeks) + 4;
    const barHeight = (b.count / max) * (chartHeight - 10);
    const y = chartHeight - barHeight + 10;
    ctx.fillStyle = primary;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = textMuted;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(b.count), x + barWidth / 2, y - 4 < 10 ? 10 : y - 4);
    ctx.fillText(b.label, x + barWidth / 2, chartHeight + 22);
  });
}

window.addEventListener('resize', renderChart);

// ---- Heatmap (last 18 weeks, Mon-Sun columns) ----
function renderHeatmap() {
  els.heatmap.innerHTML = '';
  const counts = {};
  sessions.forEach((s) => {
    counts[s.date] = (counts[s.date] || 0) + 1;
  });

  const weeks = 18;
  const end = startOfWeek(new Date());
  end.setDate(end.getDate() + 7); // exclusive end of current week
  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7);

  const cellsByWeek = [];
  for (let w = 0; w < weeks; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + w * 7);
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + d);
      const key = toKey(day);
      col.push({ key, count: counts[key] || 0, future: day > new Date() });
    }
    cellsByWeek.push(col);
  }

  cellsByWeek.forEach((col) => {
    col.forEach((cell) => {
      const div = document.createElement('div');
      const level = cell.future ? -1 : Math.min(3, cell.count);
      div.className = `hm-cell hm-${level >= 0 ? level : 0}`;
      div.style.opacity = cell.future ? '0.3' : '1';
      div.title = `${cell.key}: ${cell.count} session${cell.count === 1 ? '' : 's'}`;
      els.heatmap.appendChild(div);
    });
  });
}

function toKey(d) {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 10);
}

// ---- Export / Import ----
els.exportBtn.addEventListener('click', () => {
  const data = { sessions, weeklyGoal, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fittrack-export-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

els.importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data.sessions)) {
        sessions = data.sessions;
        saveSessions(sessions);
        if (data.weeklyGoal) {
          weeklyGoal = data.weeklyGoal;
          localStorage.setItem(GOAL_KEY, weeklyGoal);
          els.goalSlider.value = weeklyGoal;
        }
        renderAll();
        alert('Import successful.');
      } else {
        alert('Invalid file format.');
      }
    } catch {
      alert('Could not parse file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ---- Render all ----
function renderAll() {
  renderStats();
  renderHistory();
  renderChart();
  renderHeatmap();
}

renderAll();
