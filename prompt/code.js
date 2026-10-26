// DS Audit Pro — code.js (v2)
// Berjalan di sandbox Figma. Tidak ada LLM, tidak ada network, tidak ada token di config.
// Semua token dan komponen ditemukan dari file aktif dan library yang di-enable.
// Mode: audit, apply, undo (in-memory), annotate, clear-annotations, select.

figma.showUI(__html__, { width: 420, height: 760, themeColors: true });

const ANNOTATION_PAGE = '🔍 DS Audit';
const MAX_ANNOTATIONS = 500;
const CATEGORIES = ['AUTO_LAYOUT', 'TYPOGRAPHY', 'COLOR', 'SPACING', 'COMPONENT', 'NAMING', 'VARIABLE'];
const NO_TOKENS_TAG = /\[no-tokens\]/i;
const DEFAULT_NAME = /^(Frame|Rectangle|Group|Vector|Text|Ellipse) \d+$/;
const SPACING_FIELDS = ['itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const RADIUS_CORNERS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const SPACING_NAME = /^(spacing|space|gap|padding)/i;
const RADIUS_NAME = /^radius/i;
const ANNOTATION_STYLE = {
  SPACING: { color: '#FF9800', prefix: 'SPACE' },
  RADIUS: { color: '#07A05E', prefix: 'RADIUS' },
  TYPOGRAPHY: { color: '#7B61FF', prefix: 'TYPO' },
  COLOR: { color: '#E53935', prefix: 'COLOR' },
  COMPONENT: { color: '#0D99FF', prefix: 'COMP' },
  AUTO_LAYOUT: { color: '#795548', prefix: 'LAYOUT' },
  NAMING: { color: '#9E9E9E', prefix: 'NAME' },
  VARIABLE: { color: '#6A1B9A', prefix: 'VAR' },
  ORPHAN: { color: '#6A1B9A', prefix: 'ORPHAN' },
  MODE: { color: '#4527A0', prefix: 'MODE' }
};

const sleep = () => new Promise((r) => setTimeout(r, 0));
const clone = (x) => JSON.parse(JSON.stringify(x));
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Klasifikasi file Figma SawitPro (bukan hanya sprint). */
function inferFileCategory(fileName) {
  const n = (fileName || '').toLowerCase();
  if (/species/.test(n) && /master/.test(n)) return 'SPECIES_MASTER';
  if (/design.system|design-system|\bds\b|foundation|token|component.library|lime/.test(n)) {
    return 'DESIGN_SYSTEM';
  }
  if (/sprint/.test(n)) return 'SPRINT';
  if (/tenera|timpro|agenpro|supirpro|sapik|plantation|affiliate|species/.test(n)) {
    return 'PRODUCT';
  }
  if (/platform|intern|hub|dashboard/.test(n)) return 'PLATFORM';
  return 'OTHER';
}

const FILE_CATEGORY_LABEL = {
  SPECIES_MASTER: 'Species Master',
  DESIGN_SYSTEM: 'Design System',
  SPRINT: 'File sprint',
  PRODUCT: 'Produk / tim',
  PLATFORM: 'Platform internal',
  OTHER: 'Lainnya'
};

/** Aturan audit (sumber: rules.json di repo — disematkan, tanpa upload file). */
const AUDIT_RULES = {
  weights: {
    AUTO_LAYOUT: 18,
    TYPOGRAPHY: 18,
    COLOR: 18,
    SPACING: 14,
    COMPONENT: 18,
    NAMING: 4,
    VARIABLE: 10
  },
  thresholds: { excellent: 90, warning: 75 },
  nearMatchDeltaE: 2.0,
  namingPatterns: {
    screen: '^Screen\\/[A-Za-z0-9-]+$',
    component: '^(Card|Button|Navbar|Input|Modal)\\/[A-Za-z0-9-]+$',
    text: '^Text\\/(Header|Body|Caption|Label)$',
    icon: '^Icon\\/[A-Za-z0-9-]+$',
    surface: '^Surface\\/[A-Za-z0-9-]+$'
  }
};

// ---------- Warna ----------

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function toHex(c) {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return ('#' + h(c.r) + h(c.g) + h(c.b)).toUpperCase();
}

function rgbToLab(c) {
  const f = (v) => (v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92);
  const r = f(c.r), g = f(c.g), b = f(c.b);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const h = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = h(X), fy = h(Y), fz = h(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// CIEDE2000 dengan kL = kC = kH = 1
function deltaE2000(lab1, lab2) {
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const avgL = (L1 + L2) / 2;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), avgC = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const avgCp = (C1p + C2p) / 2;
  const hp = (b, a) => (a === 0 && b === 0 ? 0 : (deg(Math.atan2(b, a)) + 360) % 360);
  const h1p = hp(b1, a1p), h2p = hp(b2, a2p);
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);
  let avgHp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) avgHp = (h1p + h2p) / 2;
    else avgHp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos(rad(avgHp - 30)) + 0.24 * Math.cos(rad(2 * avgHp))
    + 0.32 * Math.cos(rad(3 * avgHp + 6)) - 0.2 * Math.cos(rad(4 * avgHp - 63));
  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const SC = 1 + 0.045 * avgCp;
  const SH = 1 + 0.015 * avgCp * T;
  const RT = -Math.sin(rad(2 * dTheta)) * RC;
  return Math.sqrt(
    Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2)
    + RT * (dCp / SC) * (dHp / SH)
  );
}

// ---------- Registry otomatis ----------
// Sumber: variabel lokal, variabel dari library yang di-enable, text style lokal,
// dan komponen lokal. Style dan komponen dari library tidak bisa didaftar lewat API
// (lihat catatan di README), jadi hanya yang terlihat di file ini.

async function resolveValue(v, depth) {
  const d = depth || 0;
  const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
  const modeId = col ? col.defaultModeId : Object.keys(v.valuesByMode)[0];
  const val = v.valuesByMode[modeId];
  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
    if (d > 5) return null;
    const target = await figma.variables.getVariableByIdAsync(val.id);
    return target ? resolveValue(target, d + 1) : null;
  }
  return val;
}

let registryCache = null;
let registryCacheKey = '';
let registryTokenCache = null;
let registryTokenCacheKey = '';
let registryWarmupPromise = null;

function registryFileKey() {
  return `${figma.fileKey || ''}|${figma.root.name}`;
}

/** Koleksi variabel DS — prioritas import (Spacing/Radius sering di file terpisah). */
function libraryCollectionPriority(lc) {
  const label = `${lc.libraryName} ${lc.name}`.toLowerCase();
  if (/ds\s*3\.0|design.system|3\.0.*color|color.*3\.0/.test(label)) return 0;
  if (/color|semantic|brand|token/.test(label)) return 1;
  if (/spacing|radius|size|dimension/.test(label)) return 2;
  return 3;
}

async function buildComponentIndex(scope) {
  let comps;
  if (scope === 'all') {
    await figma.loadAllPagesAsync();
    comps = figma.root.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
  } else {
    comps = figma.currentPage.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
  }
  return {
    componentKeys: [...new Set(comps.filter((c) => c.type === 'COMPONENT').map((c) => c.key))],
    componentNames: [...new Set(comps.map((c) => c.name))]
  };
}

/** Lewati import library yang tidak dipakai audit (percepat load). */
function shouldImportLibraryMeta(lv) {
  const t = lv.resolvedType;
  if (t === 'COLOR') return true;
  if (t === 'FLOAT') return SPACING_NAME.test(lv.name) || RADIUS_NAME.test(lv.name);
  return false;
}

async function registryProgress(loaded, total, label, silent) {
  if (!silent) {
    figma.ui.postMessage({
      type: 'progress',
      done: 0,
      phase: 'registry',
      registryLoaded: loaded,
      registryTotal: total,
      registryLabel: label || ''
    });
  }
  await sleep();
}

function cloneRegistryTokens(src) {
  return JSON.parse(JSON.stringify(src));
}

async function buildRegistry(opts) {
  const options = opts || {};
  const scope = options.scope || 'page';
  const force = options.force === true;
  const silent = options.silent === true;
  const fileKey = registryFileKey();
  const cacheKey = `${fileKey}|${scope}`;
  if (force) {
    registryTokenCache = null;
    registryTokenCacheKey = '';
    registryCache = null;
    registryCacheKey = '';
  }
  if (!force && registryCache && registryCacheKey === cacheKey) {
    await registryProgress(1, 1, 'cache', silent);
    return registryCache;
  }
  if (!force && registryTokenCache && registryTokenCacheKey === fileKey) {
    const comps = await buildComponentIndex(scope);
    const reg = {
      ...cloneRegistryTokens(registryTokenCache),
      ...comps,
      builtAt: new Date().toISOString()
    };
    registryCache = reg;
    registryCacheKey = cacheKey;
    await registryProgress(1, 1, 'cache', silent);
    return reg;
  }

  const reg = {
    schemaVersion: '1.1',
    builtAt: new Date().toISOString(),
    colorVariables: [],
    spacingVariables: [],
    radiusVariables: [],
    textStyles: [],
    componentKeys: [],
    componentNames: [],
    libraryCollections: [],
    notes: [],
    fromCache: false
  };
  const seen = new Set();

  async function addVar(v, origin) {
    if (seen.has(v.key)) return;
    seen.add(v.key);
    const val = await resolveValue(v);
    const base = { name: v.name, key: v.key, id: v.id, origin };
    if (v.resolvedType === 'COLOR' && val && typeof val === 'object' && 'r' in val) {
      reg.colorVariables.push({ ...base, hex: toHex(val) });
    } else if (v.resolvedType === 'FLOAT' && typeof val === 'number') {
      if (RADIUS_NAME.test(v.name)) reg.radiusVariables.push({ ...base, px: val });
      else if (SPACING_NAME.test(v.name)) reg.spacingVariables.push({ ...base, px: val });
    }
  }

  await registryProgress(0, 0, 'local', silent);
  for (const v of await figma.variables.getLocalVariablesAsync()) await addVar(v, 'local');

  let libCols = [];
  try {
    libCols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  } catch (e) {
    reg.notes.push('teamLibrary tidak tersedia: cek permission "teamlibrary" di manifest.');
  }
  libCols = libCols.slice().sort((a, b) => libraryCollectionPriority(a) - libraryCollectionPriority(b));
  reg.libraryCollections = libCols.map((c) => c.libraryName + ' / ' + c.name);

  const importQueue = [];
  for (const lc of libCols) {
    let items = [];
    try {
      items = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key);
    } catch (e) {
      reg.notes.push(`Gagal membaca koleksi "${lc.name}".`);
      continue;
    }
    for (const lv of items) {
      if (shouldImportLibraryMeta(lv)) importQueue.push(lv);
    }
  }

  const totalLib = importQueue.length;
  let loadedLib = 0;
  for (const lv of importQueue) {
    loadedLib++;
    if (loadedLib === 1 || loadedLib % 60 === 0 || loadedLib === totalLib) {
      await registryProgress(loadedLib, totalLib, 'library', silent);
    }
    try {
      const v = await figma.variables.importVariableByKeyAsync(lv.key);
      await addVar(v, 'library');
    } catch (e) { /* lewati */ }
  }

  for (const s of await figma.getLocalTextStylesAsync()) {
    reg.textStyles.push({
      name: s.name,
      key: s.key,
      id: s.id,
      fontFamily: s.fontName.family,
      fontStyle: s.fontName.style,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight && s.lineHeight.unit !== 'AUTO' ? s.lineHeight.value : null
    });
  }

  const comps = await buildComponentIndex(scope);
  reg.componentKeys = comps.componentKeys;
  reg.componentNames = comps.componentNames;

  reg.notes.push('Style dan komponen dari library tidak bisa didaftar lewat API; yang dipakai akan terdeteksi saat audit.');
  if (totalLib > 0) {
    reg.notes.push(`Library: ${loadedLib} variabel audit-relevant di-import (warna + spacing/radius).`);
  }
  reg.variableCatalog = [
    ...reg.colorVariables,
    ...reg.spacingVariables,
    ...reg.radiusVariables
  ].map((v) => ({ name: v.name, key: v.key, id: v.id, kind: v.hex ? 'COLOR' : 'FLOAT' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { componentKeys, componentNames, ...tokenPart } = reg;
  registryTokenCache = cloneRegistryTokens(tokenPart);
  registryTokenCacheKey = fileKey;
  registryCache = reg;
  registryCacheKey = cacheKey;
  return reg;
}

function warmRegistryInBackground() {
  if (registryWarmupPromise) return registryWarmupPromise;
  registryWarmupPromise = (async () => {
    try {
      figma.ui.postMessage({ type: 'registry-warmup', status: 'started' });
      const reg = await buildRegistry({ scope: 'page', silent: true });
      const n = reg.colorVariables.length + reg.spacingVariables.length + reg.radiusVariables.length;
      figma.ui.postMessage({ type: 'registry-warmup', status: 'ready', tokenCount: n });
    } catch (e) {
      figma.ui.postMessage({ type: 'registry-warmup', status: 'error' });
    } finally {
      registryWarmupPromise = null;
    }
  })();
  return registryWarmupPromise;
}

/** Tema UI dari library **1. DS 3.0: Color** (Semantic + Global Token). */
const UI_THEME_FALLBACK = {
  brand: '#079455',
  brandSecondary: '#F5B301',
  bg: '#F3FAF6',
  surface: '#FFFFFF',
  border: '#B9E6CE',
  text: '#1A1A1A',
  textMuted: '#5C5C5C',
  textSubtle: '#8C8C8C',
  textInverse: '#FFFFFF',
  btn: '#079455',
  btnHover: '#067647',
  danger: '#D92D20',
  warning: '#F79009',
  header: '#05603A',
  source: 'fallback'
};

const UI_THEME_VAR_MAP = {
  brand: 'Brand/primary',
  brandSecondary: 'Brand/Secondary',
  bg: 'Primary/greenBright-50',
  surface: 'Neutral/Neutral-0',
  border: 'Primary/greenBright-200',
  text: 'TextIcon/Black/primary',
  textMuted: 'TextIcon/Black/secondary',
  textSubtle: 'TextIcon/Black/tertiary',
  textInverse: 'TextIcon/Black/white',
  btn: 'Primary/greenBright-500',
  btnHover: 'Primary/greenBright-600',
  danger: 'Utility/Danger',
  warning: 'Utility/Warning',
  header: 'Primary/greenBright-800'
};

async function hexForVar(v) {
  const val = await resolveValue(v);
  if (val && typeof val === 'object' && 'r' in val) return toHex(val);
  return null;
}

async function buildUiTheme() {
  const needed = new Set(Object.values(UI_THEME_VAR_MAP));
  const hexByVarName = {};
  const libKeyByName = {};

  for (const v of await figma.variables.getLocalVariablesAsync()) {
    if (v.resolvedType !== 'COLOR' || !needed.has(v.name)) continue;
    const hex = await hexForVar(v);
    if (hex) hexByVarName[v.name] = hex;
  }

  try {
    const libCols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    for (const lc of libCols) {
      let items = [];
      try {
        items = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key);
      } catch (e) { continue; }
      for (const lv of items) {
        if (!needed.has(lv.name) || hexByVarName[lv.name] || libKeyByName[lv.name]) continue;
        libKeyByName[lv.name] = lv.key;
      }
    }
  } catch (e) { /* teamLibrary unavailable */ }

  for (const name of needed) {
    if (hexByVarName[name] || !libKeyByName[name]) continue;
    try {
      const v = await figma.variables.importVariableByKeyAsync(libKeyByName[name]);
      if (v.resolvedType === 'COLOR') {
        const hex = await hexForVar(v);
        if (hex) hexByVarName[name] = hex;
      }
    } catch (e) { /* lewati */ }
  }

  const theme = {};
  let resolved = 0;
  for (const [key, varName] of Object.entries(UI_THEME_VAR_MAP)) {
    const hex = hexByVarName[varName];
    theme[key] = hex || UI_THEME_FALLBACK[key];
    if (hex) resolved++;
  }
  const total = Object.keys(UI_THEME_VAR_MAP).length;
  theme.source = resolved === 0 ? 'fallback'
    : resolved === total ? 'ds-3.0-color'
      : 'ds-3.0-color-partial';
  return theme;
}

async function bootUi() {
  const cat = inferFileCategory(figma.root.name);
  figma.ui.postMessage({
    type: 'file-context',
    fileName: figma.root.name,
    fileKey: figma.fileKey || '',
    fileCategory: cat,
    fileCategoryLabel: FILE_CATEGORY_LABEL[cat] || cat
  });
  try {
    figma.ui.postMessage({ type: 'theme', theme: await buildUiTheme() });
  } catch (e) {
    figma.ui.postMessage({ type: 'theme', theme: UI_THEME_FALLBACK });
  }
  let libraryCollectionCount = 0;
  try {
    const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    libraryCollectionCount = cols.length;
  } catch (e) { /* teamlibrary */ }
  figma.ui.postMessage({
    type: 'boot-hints',
    libraryCollectionCount,
    selectionCount: figma.currentPage.selection.length
  });
  warmRegistryInBackground();
}
bootUi();

// ---------- Pencocokan nilai ----------

function toMatch(type, v, suggestion) {
  return {
    matchType: type,
    targetVariableId: v.id,
    targetVariableKey: v.key,
    targetVariableName: v.name,
    suggestion
  };
}

function matchColor(hex, reg, threshold) {
  const list = reg.colorVariables;
  const exact = list.find((v) => v.hex.toUpperCase() === hex);
  if (exact) return toMatch('EXACT', exact, `Ikat ke ${exact.name}`);
  const lab = rgbToLab(hexToRgb(hex));
  let best = null, bestD = Infinity;
  for (const v of list) {
    const d = deltaE2000(lab, rgbToLab(hexToRgb(v.hex)));
    if (d < bestD) { bestD = d; best = v; }
  }
  if (best && bestD <= threshold) {
    return toMatch('NEAR', best, `Mirip ${best.name} (ΔE ${bestD.toFixed(2)}), perlu review manual`);
  }
  return {
    matchType: 'NONE',
    suggestion: best ? `Token terdekat ${best.name} (ΔE ${bestD.toFixed(2)}), tidak otomatis` : 'Tidak ada token warna'
  };
}

function nearest(list, value) {
  let best = null, d = Infinity;
  for (const v of list) {
    const x = Math.abs(v.px - value);
    if (x < d) { d = x; best = v; }
  }
  return best;
}

function matchPx(value, list) {
  const exact = list.find((v) => v.px === value);
  if (exact) return toMatch('EXACT', exact, `Ikat ke ${exact.name}`);
  const near = nearest(list, value);
  return {
    matchType: 'NONE',
    suggestion: near ? `Token terdekat ${near.name} (${near.px}px)` : 'Tidak ada token di file'
  };
}

function matchTextStyle(node, reg) {
  if (node.fontName === figma.mixed || node.fontSize === figma.mixed) return null;
  const f = node.fontName;
  return reg.textStyles.find(
    (s) => s.fontFamily === f.family && s.fontStyle === f.style && s.fontSize === node.fontSize
  ) || null;
}

// ---------- Helper audit ----------

function count(ctx, cat, ok) {
  ctx.cats[cat].total++;
  if (ok) ctx.cats[cat].passed++;
}

function addViolation(ctx, base, category, severity, issue, extra) {
  ctx.violations.push({
    ...base,
    category,
    subCategory: category,
    severity,
    issue,
    matchType: 'NONE',
    status: 'OPEN',
    ...(extra || {})
  });
}

// ---------- Pengecekan per node ----------

function checkNaming(node, ctx, base, isScreen) {
  if (!['FRAME', 'COMPONENT', 'INSTANCE', 'TEXT', 'GROUP'].includes(node.type)) return;
  const p = ctx.rules.namingPatterns;
  let ok = true, issue = '', pattern = null;
  if (DEFAULT_NAME.test(node.name)) {
    ok = false;
    issue = 'Nama layer bawaan Figma';
  } else if (isScreen) pattern = p.screen;
  else if (node.type === 'COMPONENT' || node.type === 'INSTANCE') pattern = p.component;
  else if (node.type === 'TEXT') pattern = p.text;
  if (ok && pattern && !new RegExp(pattern).test(node.name)) {
    ok = false;
    issue = 'Nama tidak sesuai semantic-layer';
  }
  count(ctx, 'NAMING', ok);
  if (!ok) addViolation(ctx, base, 'NAMING', 'MEDIUM', issue);
}

function checkDetached(node, ctx, base) {
  const names = ctx.reg.componentNames;
  const match = names.some((n) => node.name === n || node.name.startsWith(n + ' ') || node.name.startsWith(n + '/'));
  count(ctx, 'COMPONENT', !match);
  if (match) addViolation(ctx, base, 'COMPONENT', 'HIGH', 'Dugaan detached, verifikasi manual');
}

// Instance sah = main component berasal dari library (remote).
// Komponen lokal di file sprint dianggap di luar library tim.
async function checkInstance(node, ctx, base) {
  let main;
  try {
    main = await node.getMainComponentAsync();
  } catch (e) {
    ctx.unresolved++;
    return;
  }
  if (!main) {
    count(ctx, 'COMPONENT', false);
    addViolation(ctx, base, 'COMPONENT', 'HIGH', 'Instance yatim (main component hilang)');
    return;
  }
  const ok = main.remote === true;
  count(ctx, 'COMPONENT', ok);
  if (!ok) addViolation(ctx, base, 'COMPONENT', 'HIGH', `Komponen lokal "${main.name}", bukan dari library tim`);
}

function checkAutoLayout(node, ctx, base, isScreen) {
  if (!(node.type === 'FRAME' || node.type === 'COMPONENT')) return;
  if (!node.children || node.children.length === 0) return;
  const ok = node.layoutMode !== 'NONE';
  count(ctx, 'AUTO_LAYOUT', ok);
  if (!ok) addViolation(ctx, base, 'AUTO_LAYOUT', isScreen ? 'HIGH' : 'MEDIUM', 'Frame tanpa Auto Layout');
}

function checkTypography(node, ctx, base) {
  if (node.type !== 'TEXT' || node.characters.length === 0) return;
  const ts = node.textStyleId;
  const ok = typeof ts === 'string' && ts !== '';
  count(ctx, 'TYPOGRAPHY', ok);
  if (ok) return;
  const style = matchTextStyle(node, ctx.reg);
  const fontStr = (node.fontName === figma.mixed || node.fontSize === figma.mixed)
    ? 'campuran'
    : `${node.fontName.family} ${node.fontName.style} ${node.fontSize}`;
  const extra = style
    ? { matchType: 'EXACT', targetStyleId: style.id, targetStyleKey: style.key, targetVariableName: style.name, suggestion: `Ikat ke ${style.name}` }
    : { suggestion: 'Tidak ada text style di file yang cocok' };
  addViolation(ctx, base, 'TYPOGRAPHY', 'MEDIUM', 'Teks tidak menggunakan Text Style', {
    field: 'textStyleId',
    currentValue: fontStr,
    ...extra
  });
}

function trackBoundVariables(node, ctx) {
  const bv = node.boundVariables;
  if (!bv) return;
  for (const entries of Object.values(bv)) {
    const list = Array.isArray(entries) ? entries : [entries];
    for (const entry of list) {
      if (entry && entry.id) ctx.usedVariableIds.add(entry.id);
    }
  }
}

async function componentHasNoTokens(node) {
  if (!node || (node.type !== 'INSTANCE' && node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) {
    return false;
  }
  let target = node;
  if (node.type === 'INSTANCE') {
    try {
      target = await node.getMainComponentAsync();
    } catch (e) {
      return false;
    }
  }
  if (!target) return false;
  const desc = target.description || '';
  return NO_TOKENS_TAG.test(desc);
}

async function checkVariableBindings(node, ctx, base) {
  const bv = node.boundVariables;
  if (!bv) return;
  for (const [field, entries] of Object.entries(bv)) {
    const list = Array.isArray(entries) ? entries.filter(Boolean) : entries ? [entries] : [];
    for (const entry of list) {
      if (!entry || !entry.id) continue;
      let v = null;
      try {
        v = await figma.variables.getVariableByIdAsync(entry.id);
      } catch (e) { /* orphan */ }
      if (!v) {
        count(ctx, 'VARIABLE', false);
        addViolation(ctx, base, 'VARIABLE', 'HIGH', `Bind variabel orphan (${field})`, {
          field,
          subCategory: 'ORPHAN',
          targetVariableId: entry.id
        });
        continue;
      }
      const resolved = await resolveValue(v);
      if (resolved === null) {
        count(ctx, 'VARIABLE', false);
        addViolation(ctx, base, 'VARIABLE', 'MEDIUM', `Alias variabel putus (${v.name})`, {
          field,
          subCategory: 'ORPHAN',
          targetVariableName: v.name,
          targetVariableKey: v.key
        });
        continue;
      }
      count(ctx, 'VARIABLE', true);
    }
  }
}

async function auditLocalVariableModes() {
  const issues = [];
  const locals = await figma.variables.getLocalVariablesAsync();
  for (const v of locals) {
    let col;
    try {
      col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    } catch (e) { continue; }
    if (!col || col.modes.length <= 1) continue;
    for (const mode of col.modes) {
      if (v.valuesByMode[mode.modeId] === undefined) {
        issues.push({
          variableName: v.name,
          variableKey: v.key,
          collectionName: col.name,
          modeName: mode.name
        });
      }
    }
  }
  return issues;
}

function buildVariableCatalog(reg) {
  return reg.variableCatalog || [];
}

function auditPaint(node, ctx, base, kind) {
  const paints = kind === 'fills' ? node.fills : node.strokes;
  const field = kind;
  const label = kind === 'fills' ? 'fill' : 'stroke';
  if (!('fills' in node) && kind === 'fills') return;
  if (!('strokes' in node) && kind === 'strokes') return;
  if (paints === figma.mixed) {
    count(ctx, 'COLOR', false);
    addViolation(ctx, base, 'COLOR', 'LOW', `${label} campuran, cek manual`, { field });
    return;
  }
  if (!Array.isArray(paints)) return;
  const solids = paints.filter((p) => p.visible !== false && p.type === 'SOLID');
  if (solids.length === 0) return;
  const boundKey = kind === 'fills' ? 'fills' : 'strokes';
  const bound = node.boundVariables && node.boundVariables[boundKey]
    ? node.boundVariables[boundKey].filter(Boolean).length
    : 0;
  const styled = kind === 'fills'
    && typeof node.fillStyleId === 'string' && node.fillStyleId !== '';
  const ok = styled || bound >= solids.length;
  count(ctx, 'COLOR', ok);
  if (ok) return;
  const hex = toHex(solids[0].color);
  const m = matchColor(hex, ctx.reg, ctx.rules.nearMatchDeltaE);
  addViolation(ctx, base, 'COLOR', 'LOW', `Warna ${label} tidak terikat variabel atau style`, {
    field,
    currentValue: hex,
    ...m
  });
}

function checkColor(node, ctx, base) {
  auditPaint(node, ctx, base, 'fills');
  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.some((p) => p.visible !== false)) {
    auditPaint(node, ctx, base, 'strokes');
  }
}

function checkSize(node, ctx, base) {
  if (!('width' in node) || !('height' in node)) return;
  if (node.type === 'PAGE' || node.type === 'DOCUMENT') return;
  const bound = node.boundVariables || {};
  const spacingPx = ctx.reg.spacingVariables.map((v) => v.px);
  const fields = [
    { key: 'width', val: node.width },
    { key: 'height', val: node.height }
  ];
  for (const { key, val } of fields) {
    if (typeof val !== 'number' || val <= 0) continue;
    if (bound[key] || spacingPx.includes(val)) {
      count(ctx, 'SPACING', true);
      continue;
    }
    count(ctx, 'SPACING', false);
    const m = matchPx(val, ctx.reg.spacingVariables);
    addViolation(ctx, base, 'SPACING', 'LOW', `${key} raw (${Math.round(val)}px)`, {
      field: key,
      currentValue: String(Math.round(val)),
      subCategory: 'SIZE',
      ...m
    });
  }
}

function checkSpacing(node, ctx, base) {
  const isAL = (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE')
    && 'layoutMode' in node && node.layoutMode !== 'NONE';
  const hasRadius = 'cornerRadius' in node
    && ['FRAME', 'RECTANGLE', 'COMPONENT', 'INSTANCE'].includes(node.type);
  if (!isAL && !hasRadius) return;

  // Token diambil dari variabel yang ditemukan di file, bukan dari config.
  const spacingPx = ctx.reg.spacingVariables.map((v) => v.px);
  const radiusPx = ctx.reg.radiusVariables.map((v) => v.px);
  const bound = node.boundVariables || {};
  const bad = [];

  if (isAL) {
    for (const f of SPACING_FIELDS) {
      const v = node[f];
      if (typeof v !== 'number') continue;
      if (v === 0 || spacingPx.includes(v) || bound[f]) continue;
      bad.push({ field: f, value: v, radius: false });
    }
  }
  if (hasRadius) {
    const mixed = node.cornerRadius === figma.mixed;
    const values = mixed ? RADIUS_CORNERS.map((c) => node[c]) : [node.cornerRadius];
    const isBound = bound.topLeftRadius || bound.cornerRadius;
    for (const v of values) {
      if (typeof v !== 'number') continue;
      if (v === 0 || radiusPx.includes(v) || isBound) continue;
      bad.push({ field: 'topLeftRadius', value: v, radius: true });
      break;
    }
  }

  count(ctx, 'SPACING', bad.length === 0);
  if (bad.length === 0) return;

  const first = bad[0];
  const list = first.radius ? ctx.reg.radiusVariables : ctx.reg.spacingVariables;
  const m = matchPx(first.value, list);
  addViolation(ctx, base, 'SPACING', 'MEDIUM',
    `Nilai tidak standar: ${bad.map((b) => `${b.field}=${b.value}`).join(', ')}`, {
      field: first.field,
      currentValue: String(first.value),
      subCategory: first.radius ? 'RADIUS' : 'SPACING',
      ...m
    });
}

// ---------- Traversal ----------

async function checkNode(node, ctx, screen, isScreen) {
  const base = {
    id: node.id,
    page: ctx.page,
    topLevelScreen: screen || '',
    layerName: node.name,
    nodeType: node.type
  };
  checkNaming(node, ctx, base, isScreen);
  if (node.type === 'FRAME' || node.type === 'GROUP') checkDetached(node, ctx, base);
  if (node.type === 'INSTANCE') await checkInstance(node, ctx, base);
  checkAutoLayout(node, ctx, base, isScreen);
  checkTypography(node, ctx, base);
  checkColor(node, ctx, base);
  checkSpacing(node, ctx, base);
  checkSize(node, ctx, base);
  trackBoundVariables(node, ctx);
  await checkVariableBindings(node, ctx, base);
}

async function walk(node, ctx, screen) {
  if (node.visible === false) {
    ctx.hidden++;
    return;
  }
  if (await componentHasNoTokens(node)) {
    ctx.noTokensSkipped++;
    return;
  }
  ctx.count++;
  if (ctx.count % 500 === 0) {
    figma.ui.postMessage({ type: 'progress', done: ctx.count });
    await sleep();
  }
  const isTop = node.parent && node.parent.type === 'PAGE';
  const isScreen = isTop && node.type === 'FRAME';
  const scr = isScreen ? node.name : screen;
  await checkNode(node, ctx, scr, isScreen);
  // Isi instance tidak diperiksa: itu tanggung jawab library.
  if ('children' in node && node.type !== 'INSTANCE') {
    for (const child of node.children) await walk(child, ctx, scr);
  }
}

// ---------- Skor ----------

function computeScore(cats, weights) {
  let num = 0, den = 0;
  for (const c of CATEGORIES) {
    const x = cats[c];
    const w = weights[c] || 0;
    if (x.total > 0) {
      num += w * (x.passed / x.total);
      den += w;
    }
  }
  return den > 0 ? (num / den) * 100 : 100;
}

function statusOf(score, th) {
  if (score >= th.excellent) return 'EXCELLENT';
  if (score >= th.warning) return 'PASS_WITH_WARNING';
  return 'REJECTED';
}

// ---------- Mode: audit ----------

function tokenCoveragePercent(cats) {
  const keys = ['COLOR', 'TYPOGRAPHY', 'SPACING'];
  let passed = 0, total = 0;
  for (const k of keys) {
    passed += cats[k].passed;
    total += cats[k].total;
  }
  return total > 0 ? (passed / total) * 100 : 100;
}

function variableUsageSummary(reg, usedVariableIds) {
  const all = [
    ...reg.colorVariables,
    ...reg.spacingVariables,
    ...reg.radiusVariables
  ];
  const defined = all.length;
  let usedCount = 0;
  const unusedNames = [];
  for (const v of all) {
    if (usedVariableIds.has(v.id)) usedCount++;
    else if (unusedNames.length < 40) unusedNames.push(v.name);
  }
  return { defined, usedOnLayers: usedCount, unusedSample: unusedNames };
}

async function runAudit(msg) {
  figma.ui.postMessage({ type: 'progress', done: 0, phase: 'registry' });
  const rules = AUDIT_RULES;
  const reg = await buildRegistry({ scope: msg.scope || 'page', force: msg.refreshRegistry === true });
  figma.ui.postMessage({ type: 'progress', done: 0, phase: 'scan' });

  const cats = {};
  for (const c of CATEGORIES) cats[c] = { total: 0, passed: 0 };
  const ctx = {
    rules, reg, cats, violations: [], hidden: 0, count: 0, unresolved: 0,
    page: '', pageNames: [], usedVariableIds: new Set(), noTokensSkipped: 0
  };

  if (msg.scope === 'selection') {
    const roots = figma.currentPage.selection.slice();
    if (roots.length === 0) {
      figma.ui.postMessage({ type: 'notice', text: 'Pilih minimal satu layer di kanvas.' });
      return;
    }
    ctx.page = figma.currentPage.name;
    ctx.pageNames.push(ctx.page);
    for (const node of roots) await walk(node, ctx, null);
  } else {
    let pages;
    if (msg.scope === 'all') {
      await figma.loadAllPagesAsync();
      pages = figma.root.children;
    } else {
      pages = [figma.currentPage];
    }
    for (const page of pages) {
      ctx.page = page.name;
      ctx.pageNames.push(page.name);
      for (const child of page.children) await walk(child, ctx, null);
    }
  }

  const score = computeScore(cats, rules.weights);
  const tokenCoverage = tokenCoveragePercent(cats);
  const variableUsage = variableUsageSummary(reg, ctx.usedVariableIds);
  const modeLintIssues = await auditLocalVariableModes();
  const variableCatalog = buildVariableCatalog(reg);
  const fileName = figma.root.name;
  const fileCategory = inferFileCategory(fileName);
  const data = {
    schemaVersion: '1.1',
    fileName,
    fileKey: figma.fileKey || null,
    fileCategory,
    fileCategoryLabel: FILE_CATEGORY_LABEL[fileCategory] || fileCategory,
    owner: msg.owner || '',
    auditedAt: new Date().toISOString(),
    pagesScanned: ctx.pageNames,
    nodeCount: ctx.count,
    hiddenSkipped: ctx.hidden,
    noTokensSkipped: ctx.noTokensSkipped,
    unresolvedInstances: ctx.unresolved,
    modeLintIssues,
    variableCatalog,
    registrySummary: {
      colorVariables: reg.colorVariables.length,
      spacingVariables: reg.spacingVariables.length,
      radiusVariables: reg.radiusVariables.length,
      textStyles: reg.textStyles.length,
      libraryCollections: reg.libraryCollections
    },
    notes: reg.notes,
    categories: cats,
    score,
    tokenCoverage,
    variableUsage,
    status: statusOf(score, rules.thresholds),
    violations: ctx.violations
  };
  figma.ui.postMessage({ type: 'audit-result', data });
}

// ---------- Mode: apply (hanya EXACT) ----------

async function resolveVariable(it) {
  // Kunci dulu (aman untuk library lintas file), lalu ID untuk variabel lokal.
  if (it.targetVariableKey) {
    try {
      return await figma.variables.importVariableByKeyAsync(it.targetVariableKey);
    } catch (e) { /* lanjut ke ID */ }
  }
  if (it.targetVariableId) return await figma.variables.getVariableByIdAsync(it.targetVariableId);
  return null;
}

async function resolveStyle(it) {
  if (it.targetStyleId) {
    const s = await figma.getStyleByIdAsync(it.targetStyleId);
    if (s && s.type === 'TEXT') return s;
  }
  if (it.targetStyleKey) return await figma.importStyleByKeyAsync(it.targetStyleKey);
  return null;
}

async function applyChanges(items) {
  const changes = [];
  let applied = 0, skipped = 0;

  for (const it of items) {
    if (it.matchType !== 'EXACT') { skipped++; continue; }
    try {
      const node = await figma.getNodeByIdAsync(it.id);
      if (!node) { skipped++; continue; }

      if (it.category === 'COLOR' && it.field === 'strokes' && Array.isArray(node.strokes)) {
        const v = await resolveVariable(it);
        if (!v) { skipped++; continue; }
        changes.push({ nodeId: node.id, kind: 'strokes', prev: clone(node.strokes) });
        node.strokes = node.strokes.map((p) => (
          p.type === 'SOLID' && p.visible !== false && toHex(p.color) === it.currentValue
            ? figma.variables.setBoundVariableForPaint(p, 'color', v)
            : p
        ));
        applied++;
      } else if (it.category === 'COLOR' && (!it.field || it.field === 'fills') && Array.isArray(node.fills)) {
        const v = await resolveVariable(it);
        if (!v) { skipped++; continue; }
        changes.push({ nodeId: node.id, kind: 'fills', prev: clone(node.fills) });
        node.fills = node.fills.map((p) => (
          p.type === 'SOLID' && p.visible !== false && toHex(p.color) === it.currentValue
            ? figma.variables.setBoundVariableForPaint(p, 'color', v)
            : p
        ));
        applied++;
      } else if (it.category === 'SPACING' && it.field && it.field in node) {
        const v = await resolveVariable(it);
        if (!v) { skipped++; continue; }
        changes.push({ nodeId: node.id, kind: 'field', field: it.field, prev: node[it.field] });
        node.setBoundVariable(it.field, v);
        applied++;
      } else if (it.category === 'TYPOGRAPHY' && node.type === 'TEXT') {
        const style = await resolveStyle(it);
        if (!style) { skipped++; continue; }
        if (node.fontName !== figma.mixed) await figma.loadFontAsync(node.fontName);
        changes.push({ nodeId: node.id, kind: 'textStyle', prev: node.textStyleId });
        await node.setTextStyleIdAsync(style.id);
        applied++;
      } else {
        skipped++;
      }
    } catch (e) {
      skipped++;
    }
  }

  figma.ui.postMessage({
    type: 'apply-result',
    applied,
    skipped,
    undo: { schemaVersion: '1.0', createdAt: new Date().toISOString(), changes }
  });
}

async function undoChanges(log) {
  let restored = 0;
  for (const c of log.changes || []) {
    try {
      const node = await figma.getNodeByIdAsync(c.nodeId);
      if (!node) continue;
      if (c.kind === 'fills') {
        node.fills = c.prev;
      } else if (c.kind === 'strokes') {
        node.strokes = c.prev;
      } else if (c.kind === 'field') {
        node[c.field] = c.prev;
      } else if (c.kind === 'textStyle') {
        if (node.fontName !== figma.mixed) await figma.loadFontAsync(node.fontName);
        await node.setTextStyleIdAsync(c.prev || '');
      }
      restored++;
    } catch (e) { /* lewati node yang gagal */ }
  }
  figma.ui.postMessage({ type: 'notice', text: `Dipulihkan ${restored} perubahan.` });
}

// ---------- Mode: anotasi ----------

function getAnnotationPage() {
  let page = figma.root.children.find((p) => p.name === ANNOTATION_PAGE);
  if (!page) {
    page = figma.createPage();
    page.name = ANNOTATION_PAGE;
  }
  return page;
}

async function clearAnnotations() {
  const page = figma.root.children.find((p) => p.name === ANNOTATION_PAGE);
  if (!page) {
    figma.ui.postMessage({ type: 'notice', text: 'Tidak ada halaman anotasi.' });
    return;
  }
  page.children.slice().forEach((n) => n.remove());
  figma.ui.postMessage({ type: 'notice', text: 'Anotasi dihapus.' });
}

async function annotate(violations) {
  const page = getAnnotationPage();
  page.children.slice().forEach((n) => n.remove());
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  // Setiap halaman sumber diberi kolom horizontal sendiri supaya tidak tumpang tindih.
  const offsets = {};
  let idx = 0;
  for (const v of violations) {
    if (!(v.page in offsets)) offsets[v.page] = (idx++) * 20000;
  }

  let n = 0;
  for (const v of violations.slice(0, MAX_ANNOTATIONS)) {
    const node = await figma.getNodeByIdAsync(v.id);
    if (!node || !node.absoluteBoundingBox) continue;
    const bb = node.absoluteBoundingBox;
    const st = ANNOTATION_STYLE[v.subCategory] || ANNOTATION_STYLE[v.category] || ANNOTATION_STYLE.NAMING;
    const label = trunc(`[${st.prefix}] ${v.suggestion || v.issue}`, 60);

    const frame = figma.createFrame();
    frame.name = `ann ${v.id}`;
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.paddingLeft = 6;
    frame.paddingRight = 6;
    frame.paddingTop = 3;
    frame.paddingBottom = 3;
    frame.cornerRadius = 4;
    frame.fills = [{ type: 'SOLID', color: hexToRgb(st.color) }];

    const t = figma.createText();
    t.fontName = { family: 'Inter', style: 'Regular' };
    t.fontSize = 11;
    t.characters = label;
    t.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    frame.appendChild(t);
    page.appendChild(frame);
    frame.x = bb.x + bb.width + 8 + (offsets[v.page] || 0);
    frame.y = bb.y;
    n++;
  }
  figma.ui.postMessage({ type: 'notice', text: `Anotasi dibuat: ${n} di halaman "${ANNOTATION_PAGE}".` });
}

// ---------- Seleksi ----------

async function selectNode(id) {
  await selectNodes([id]);
}

function unbindPaintArray(paints) {
  if (!Array.isArray(paints)) return paints;
  return paints.map((p) => {
    if (p && p.type === 'SOLID') {
      try {
        return figma.variables.setBoundVariableForPaint(p, 'color', null);
      } catch (e) { return p; }
    }
    return p;
  });
}

async function detachVariablesOnNode(node) {
  let detached = 0;
  const bv = node.boundVariables;
  if (!bv) return 0;
  for (const field of Object.keys(bv)) {
    try {
      if (field === 'fills' && 'fills' in node && Array.isArray(node.fills)) {
        node.fills = unbindPaintArray(node.fills);
        detached++;
      } else if (field === 'strokes' && 'strokes' in node && Array.isArray(node.strokes)) {
        node.strokes = unbindPaintArray(node.strokes);
        detached++;
      } else if (field in node && typeof node.setBoundVariable === 'function') {
        node.setBoundVariable(field, null);
        detached++;
      }
    } catch (e) { /* lewati field */ }
  }
  return detached;
}

async function walkDetach(node, tally) {
  if (await componentHasNoTokens(node)) return;
  tally.fields += await detachVariablesOnNode(node);
  tally.nodes++;
  if ('children' in node && node.type !== 'INSTANCE') {
    for (const child of node.children) await walkDetach(child, tally);
  }
}

async function detachVariables(scope) {
  let roots = [];
  if (scope === 'selection') {
    roots = figma.currentPage.selection.slice();
    if (roots.length === 0) {
      figma.ui.postMessage({ type: 'notice', text: 'Pilih layer untuk detach variabel.' });
      return;
    }
  } else if (scope === 'page') {
    roots = figma.currentPage.children.slice();
  } else {
    await figma.loadAllPagesAsync();
    for (const page of figma.root.children) {
      for (const child of page.children) roots.push(child);
    }
  }
  const tally = { nodes: 0, fields: 0 };
  for (const root of roots) await walkDetach(root, tally);
  figma.ui.postMessage({
    type: 'notice',
    text: `Detach selesai: ${tally.fields} bind pada ${tally.nodes} node.`
  });
}

async function resolveVarByKey(key) {
  if (!key) return null;
  try {
    return await figma.variables.importVariableByKeyAsync(key);
  } catch (e) {
    return null;
  }
}

async function rebindNodeVariables(node, fromId, toVar) {
  let n = 0;
  try {
    if (Array.isArray(node.fills)) {
      let touched = false;
      node.fills = node.fills.map((p) => {
        if (p.type !== 'SOLID') return p;
        const bound = figma.variables.getBoundVariable(p, 'color');
        if (bound && bound.id === fromId) {
          touched = true;
          return figma.variables.setBoundVariableForPaint(p, 'color', toVar);
        }
        return p;
      });
      if (touched) n++;
    }
    if (Array.isArray(node.strokes)) {
      let touched = false;
      node.strokes = node.strokes.map((p) => {
        if (p.type !== 'SOLID') return p;
        const bound = figma.variables.getBoundVariable(p, 'color');
        if (bound && bound.id === fromId) {
          touched = true;
          return figma.variables.setBoundVariableForPaint(p, 'color', toVar);
        }
        return p;
      });
      if (touched) n++;
    }
  } catch (e) { /* lewati paint */ }
  const bv = node.boundVariables;
  if (!bv) return n;
  for (const field of Object.keys(bv)) {
    if (field === 'fills' || field === 'strokes') continue;
    const entries = bv[field];
    const list = Array.isArray(entries) ? entries : [entries];
    if (!list.some((e) => e && e.id === fromId)) continue;
    try {
      if (field in node) {
        node.setBoundVariable(field, toVar);
        n++;
      }
    } catch (e) { /* lewati */ }
  }
  return n;
}

async function walkRemap(node, fromId, toVar, tally) {
  if (await componentHasNoTokens(node)) return;
  tally.fields += await rebindNodeVariables(node, fromId, toVar);
  if ('children' in node && node.type !== 'INSTANCE') {
    for (const child of node.children) await walkRemap(child, fromId, toVar, tally);
  }
}

async function remapVariable(scope, fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) {
    figma.ui.postMessage({ type: 'notice', text: 'Pilih variabel asal dan tujuan yang berbeda.' });
    return;
  }
  const fromVar = await resolveVarByKey(fromKey);
  const toVar = await resolveVarByKey(toKey);
  if (!fromVar || !toVar) {
    figma.ui.postMessage({ type: 'notice', text: 'Variabel tidak ditemukan. Muat ulang daftar variabel.' });
    return;
  }
  if (fromVar.resolvedType !== toVar.resolvedType) {
    figma.ui.postMessage({ type: 'notice', text: 'Tipe variabel asal dan tujuan harus sama.' });
    return;
  }
  let roots = [];
  if (scope === 'selection') {
    roots = figma.currentPage.selection.slice();
    if (roots.length === 0) {
      figma.ui.postMessage({ type: 'notice', text: 'Pilih layer untuk remap.' });
      return;
    }
  } else {
    roots = figma.currentPage.children.slice();
  }
  const tally = { fields: 0 };
  for (const root of roots) await walkRemap(root, fromVar.id, toVar, tally);
  figma.ui.postMessage({
    type: 'notice',
    text: `Remap ${fromVar.name} → ${toVar.name}: ${tally.fields} bind diperbarui.`
  });
}

async function loadVariableCatalog() {
  const reg = await buildRegistry({ scope: 'page', force: true });
  figma.ui.postMessage({
    type: 'variable-catalog',
    catalog: buildVariableCatalog(reg)
  });
}

async function selectNodes(ids) {
  const nodes = [];
  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  if (nodes.length === 0) return;
  let p = nodes[0];
  while (p && p.type !== 'PAGE') p = p.parent;
  if (p && p.id !== figma.currentPage.id) await figma.setCurrentPageAsync(p);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

// ---------- Router ----------

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'audit') await runAudit(msg);
    else if (msg.type === 'apply') await applyChanges(msg.items || []);
    else if (msg.type === 'undo') await undoChanges(msg.log || {});
    else if (msg.type === 'annotate') await annotate(msg.violations || []);
    else if (msg.type === 'clear-annotations') await clearAnnotations();
    else if (msg.type === 'select') await selectNode(msg.nodeId);
    else if (msg.type === 'select-many') await selectNodes(msg.nodeIds || []);
    else if (msg.type === 'resize-ui') figma.ui.resize(msg.width || 420, msg.height || 760);
    else if (msg.type === 'detach-variables') await detachVariables(msg.scope || 'selection');
    else if (msg.type === 'remap-variable') await remapVariable(msg.scope || 'selection', msg.fromKey, msg.toKey);
    else if (msg.type === 'load-variable-catalog') await loadVariableCatalog();
    else if (msg.type === 'close') figma.closePlugin();
  } catch (e) {
    figma.ui.postMessage({ type: 'notice', text: 'Gagal: ' + (e && e.message ? e.message : String(e)) });
  }
};
