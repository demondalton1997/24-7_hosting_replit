const STORAGE_KEY = 'optc-parallel-seas-v1';
const THEME_KEY = 'optc-parallel-seas-theme';

const els = {
  captain: document.getElementById('captain'),
  friendCaptain: document.getElementById('friendCaptain'),
  units: document.getElementById('units'),
  atkBoost: document.getElementById('atkBoost'),
  orbBoost: document.getElementById('orbBoost'),
  chainBoost: document.getElementById('chainBoost'),
  enemyHp: document.getElementById('enemyHp'),
  questType: document.getElementById('questType'),
  progress: document.getElementById('progress'),
  progressText: document.getElementById('progress-text'),
  estimatedDamage: document.getElementById('estimatedDamage'),
  statusEnemyHp: document.getElementById('statusEnemyHp'),
  resultBadge: document.getElementById('resultBadge'),
  lastRun: document.getElementById('lastRun'),
  simulateBtn: document.getElementById('simulate-btn'),
  saveBtn: document.getElementById('save-btn'),
  exportBtn: document.getElementById('export-btn'),
  resetBtn: document.getElementById('reset-btn'),
  themeToggle: document.getElementById('theme-toggle'),
  checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"][data-step]'))
};

function getData() {
  return {
    captain: els.captain.value.trim(),
    friendCaptain: els.friendCaptain.value.trim(),
    units: els.units.value.trim(),
    atkBoost: Number(els.atkBoost.value || 0),
    orbBoost: Number(els.orbBoost.value || 0),
    chainBoost: Number(els.chainBoost.value || 1),
    enemyHp: Number(els.enemyHp.value || 1),
    questType: els.questType.value,
    completedSteps: els.checkboxes.filter((b) => b.checked).map((b) => b.dataset.step)
  };
}

function setData(data = {}) {
  els.captain.value = data.captain || '';
  els.friendCaptain.value = data.friendCaptain || '';
  els.units.value = data.units || '';
  els.atkBoost.value = data.atkBoost ?? 100;
  els.orbBoost.value = data.orbBoost ?? 100;
  els.chainBoost.value = data.chainBoost ?? 1.1;
  els.enemyHp.value = data.enemyHp ?? 5000000;
  els.questType.value = data.questType || 'raid';
  els.checkboxes.forEach((b) => {
    b.checked = (data.completedSteps || []).includes(b.dataset.step);
  });
  updateProgress();
  renderStatus();
}

function updateProgress() {
  const complete = els.checkboxes.filter((b) => b.checked).length;
  els.progress.value = complete;
  els.progressText.textContent = `${complete}/4 complete`;
}

function simulate() {
  const d = getData();
  const unitCount = d.units ? d.units.split(',').map((x) => x.trim()).filter(Boolean).length : 0;
  const base = 150000 * (2 + unitCount);
  const typeFactorMap = { raid: 1, coliseum: 1.1, kizuna: 1.25, tm: 1.2 };
  const typeFactor = typeFactorMap[d.questType] || 1;
  const total = Math.round(base * (1 + d.atkBoost / 100) * (1 + d.orbBoost / 100) * d.chainBoost * typeFactor);

  els.estimatedDamage.textContent = total.toLocaleString();
  els.statusEnemyHp.textContent = d.enemyHp.toLocaleString();
  els.lastRun.textContent = new Date().toLocaleTimeString();

  const win = total >= d.enemyHp;
  els.resultBadge.className = `badge ${win ? 'up' : 'down'}`;
  els.resultBadge.textContent = win ? 'CLEAR ESTIMATE' : 'RETRY NEEDED';
}

function renderStatus() {
  els.statusEnemyHp.textContent = Number(els.enemyHp.value || 0).toLocaleString();
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
}

function loadPlan() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    setData(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetPlan() {
  localStorage.removeItem(STORAGE_KEY);
  setData({});
  els.estimatedDamage.textContent = '—';
  els.resultBadge.className = 'badge warn';
  els.resultBadge.textContent = 'NOT RUN';
  els.lastRun.textContent = 'Never';
}

function exportJson() {
  const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optc-simulation-plan.json';
  a.click();
  URL.revokeObjectURL(url);
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  els.themeToggle.textContent = `Theme: ${theme}`;
}

els.simulateBtn.addEventListener('click', simulate);
els.saveBtn.addEventListener('click', savePlan);
els.exportBtn.addEventListener('click', exportJson);
els.resetBtn.addEventListener('click', resetPlan);
els.themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.contains('dark');
  setTheme(dark ? 'light' : 'dark');
});
els.checkboxes.forEach((b) => b.addEventListener('change', updateProgress));
els.enemyHp.addEventListener('input', renderStatus);

const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
setTheme(savedTheme);
loadPlan();
renderStatus();
