const STORAGE_KEY = 'optc-parallel-seas-v1';
const THEME_KEY = 'optc-parallel-seas-theme';
const CONTENT_KEY = 'optc-parallel-seas-content-v1';
const HISTORY_KEY = 'optc-parallel-seas-history-v1';

const defaultContent = {
  version: 'builtin',
  updatedAt: null,
  captainPresets: ['Gear 5 Luffy', 'Hybrid Kaido'],
  questMultipliers: {
    raid: 1,
    coliseum: 1.1,
    kizuna: 1.25,
    tm: 1.2
  }
};

const els = {
  captainPreset: document.getElementById('captainPreset'),
  captain: document.getElementById('captain'),
  friendCaptain: document.getElementById('friendCaptain'),
  units: document.getElementById('units'),
  atkBoost: document.getElementById('atkBoost'),
  orbBoost: document.getElementById('orbBoost'),
  chainBoost: document.getElementById('chainBoost'),
  enemyHp: document.getElementById('enemyHp'),
  questType: document.getElementById('questType'),
  luckyCrit: document.getElementById('luckyCrit'),
  defDown: document.getElementById('defDown'),
  stageHazard: document.getElementById('stageHazard'),
  weatherBonus: document.getElementById('weatherBonus'),
  manifestUrl: document.getElementById('manifestUrl'),
  autoUpdate: document.getElementById('auto-update'),
  progress: document.getElementById('progress'),
  progressText: document.getElementById('progress-text'),
  estimatedDamage: document.getElementById('estimatedDamage'),
  statusEnemyHp: document.getElementById('statusEnemyHp'),
  statusContent: document.getElementById('statusContent'),
  modifierImpact: document.getElementById('modifierImpact'),
  contentVersion: document.getElementById('contentVersion'),
  updateMessage: document.getElementById('updateMessage'),
  historyList: document.getElementById('historyList'),
  resultBadge: document.getElementById('resultBadge'),
  lastRun: document.getElementById('lastRun'),
  checkUpdatesBtn: document.getElementById('check-updates-btn'),
  applyUpdatesBtn: document.getElementById('apply-updates-btn'),
  simulateBtn: document.getElementById('simulate-btn'),
  saveBtn: document.getElementById('save-btn'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFile: document.getElementById('import-file'),
  resetBtn: document.getElementById('reset-btn'),
  themeToggle: document.getElementById('theme-toggle'),
  checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"][data-step]'))
};

let contentPack = loadContentPack();
let autoCheckTimer = null;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    els.historyList.innerHTML = '<li class="small-muted">No simulations yet.</li>';
    return;
  }

  els.historyList.innerHTML = history
    .map((item) => `<li><strong>${item.result}</strong> · Dmg ${item.damage.toLocaleString()} / HP ${item.enemyHp.toLocaleString()} · Impact ${item.modifier} · ${item.time}</li>`)
    .join('');
}

function addHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry);
  saveHistory(history);
  renderHistory();
}

function loadContentPack() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    return raw ? { ...defaultContent, ...JSON.parse(raw) } : defaultContent;
  } catch {
    return defaultContent;
  }
}

function saveContentPack(pack) {
  contentPack = { ...defaultContent, ...pack };
  localStorage.setItem(CONTENT_KEY, JSON.stringify(contentPack));
  applyContentPackToUI();
}

function applyContentPackToUI() {
  els.contentVersion.textContent = contentPack.version || 'builtin';
  els.statusContent.textContent = contentPack.version || 'builtin';

  const options = ['<option value="">Choose preset...</option>'].concat(
    (contentPack.captainPresets || []).map((name) => `<option value="${name}">${name}</option>`)
  );
  els.captainPreset.innerHTML = options.join('');
}

function getModifierFactor() {
  const luckyCrit = Number(els.luckyCrit.value || 0);
  const defDown = Number(els.defDown.value || 0);

  const hazardMap = {
    none: 1,
    fog: 0.92,
    storm: 0.85,
    blessing: 1.1
  };

  const weatherMap = {
    neutral: 1,
    sunny: 1.07,
    rainy: 1.04,
    eclipse: 1.12
  };

  const critFactor = 1 + (luckyCrit / 100) * 0.5;
  const defDownFactor = 1 + defDown / 100;
  const hazardFactor = hazardMap[els.stageHazard.value] || 1;
  const weatherFactor = weatherMap[els.weatherBonus.value] || 1;

  const totalFactor = critFactor * defDownFactor * hazardFactor * weatherFactor;
  els.modifierImpact.textContent = `x${totalFactor.toFixed(2)}`;
  return totalFactor;
}

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
    luckyCrit: Number(els.luckyCrit.value || 0),
    defDown: Number(els.defDown.value || 0),
    stageHazard: els.stageHazard.value,
    weatherBonus: els.weatherBonus.value,
    manifestUrl: els.manifestUrl.value.trim(),
    autoUpdate: els.autoUpdate.checked,
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
  els.luckyCrit.value = data.luckyCrit ?? 15;
  els.defDown.value = data.defDown ?? 20;
  els.stageHazard.value = data.stageHazard || 'none';
  els.weatherBonus.value = data.weatherBonus || 'neutral';
  els.manifestUrl.value = data.manifestUrl || './data.json';
  els.autoUpdate.checked = Boolean(data.autoUpdate);
  els.checkboxes.forEach((b) => {
    b.checked = (data.completedSteps || []).includes(b.dataset.step);
  });
  updateProgress();
  renderStatus();
  syncAutoUpdateTimer();
}

function updateProgress() {
  const complete = els.checkboxes.filter((b) => b.checked).length;
  els.progress.value = complete;
  els.progressText.textContent = `${complete}/6 complete`;
}

function simulate() {
  const d = getData();
  const unitCount = d.units ? d.units.split(',').map((x) => x.trim()).filter(Boolean).length : 0;
  const base = 150000 * (2 + unitCount);
  const typeFactor = contentPack.questMultipliers[d.questType] || 1;
  const modifierFactor = getModifierFactor();
  const total = Math.round(base * (1 + d.atkBoost / 100) * (1 + d.orbBoost / 100) * d.chainBoost * typeFactor * modifierFactor);

  els.estimatedDamage.textContent = total.toLocaleString();
  els.statusEnemyHp.textContent = d.enemyHp.toLocaleString();
  const now = new Date().toLocaleTimeString();
  els.lastRun.textContent = now;

  const win = total >= d.enemyHp;
  const result = win ? 'CLEAR ESTIMATE' : 'RETRY NEEDED';
  els.resultBadge.className = `badge ${win ? 'up' : 'down'}`;
  els.resultBadge.textContent = result;

  addHistoryEntry({
    result,
    damage: total,
    enemyHp: d.enemyHp,
    modifier: `x${modifierFactor.toFixed(2)}`,
    time: now
  });
}

function renderStatus() {
  els.statusEnemyHp.textContent = Number(els.enemyHp.value || 0).toLocaleString();
  getModifierFactor();
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
  els.updateMessage.textContent = 'Plan saved locally.';
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
  els.updateMessage.textContent = '';
}

function exportJson() {
  const payload = { ...getData(), contentPackVersion: contentPack.version };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optc-simulation-plan.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    setData(data);
    savePlan();
    els.updateMessage.textContent = 'Plan imported successfully.';
  } catch {
    els.updateMessage.textContent = 'Import failed: invalid JSON file.';
  }
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  els.themeToggle.textContent = `Theme: ${theme}`;
}

async function fetchManifest() {
  const source = els.manifestUrl.value.trim() || './data.json';
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data.version || !data.questMultipliers) {
    throw new Error('Invalid manifest schema');
  }
  return data;
}

async function checkUpdates(silent = false) {
  try {
    const incoming = await fetchManifest();
    if (incoming.version === contentPack.version) {
      if (!silent) {
        els.updateMessage.textContent = `No update found. Current version is ${contentPack.version}.`;
      }
    } else {
      els.updateMessage.textContent = `Update available: ${contentPack.version} → ${incoming.version}. Click Apply content update.`;
    }
  } catch (error) {
    if (!silent) {
      els.updateMessage.textContent = `Update check failed: ${error.message}`;
    }
  }
}

async function applyUpdates() {
  try {
    const incoming = await fetchManifest();
    saveContentPack(incoming);
    els.updateMessage.textContent = `Applied content pack ${incoming.version}${incoming.updatedAt ? ` (${incoming.updatedAt})` : ''}.`;
  } catch (error) {
    els.updateMessage.textContent = `Apply update failed: ${error.message}`;
  }
}

function syncAutoUpdateTimer() {
  if (autoCheckTimer) {
    clearInterval(autoCheckTimer);
    autoCheckTimer = null;
  }

  if (els.autoUpdate.checked) {
    autoCheckTimer = setInterval(() => {
      checkUpdates(true);
    }, 60000);
  }
}

els.captainPreset.addEventListener('change', () => {
  if (els.captainPreset.value) {
    els.captain.value = els.captainPreset.value;
  }
});
els.simulateBtn.addEventListener('click', simulate);
els.saveBtn.addEventListener('click', savePlan);
els.exportBtn.addEventListener('click', exportJson);
els.importBtn.addEventListener('click', () => els.importFile.click());
els.importFile.addEventListener('change', () => {
  const file = els.importFile.files?.[0];
  if (file) {
    importJson(file);
  }
  els.importFile.value = '';
});
els.resetBtn.addEventListener('click', resetPlan);
els.checkUpdatesBtn.addEventListener('click', () => checkUpdates(false));
els.applyUpdatesBtn.addEventListener('click', applyUpdates);
els.autoUpdate.addEventListener('change', syncAutoUpdateTimer);
els.themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.contains('dark');
  setTheme(dark ? 'light' : 'dark');
});
els.checkboxes.forEach((b) => b.addEventListener('change', updateProgress));
els.enemyHp.addEventListener('input', renderStatus);
[els.luckyCrit, els.defDown, els.stageHazard, els.weatherBonus].forEach((el) => {
  el.addEventListener('input', renderStatus);
  el.addEventListener('change', renderStatus);
});

const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
setTheme(savedTheme);
loadPlan();
applyContentPackToUI();
renderHistory();
renderStatus();
syncAutoUpdateTimer();
