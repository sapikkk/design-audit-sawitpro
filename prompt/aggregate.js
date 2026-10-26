#!/usr/bin/env node
// aggregate.js — menggabungkan hasil audit per file menjadi laporan tim.
// Tanpa LLM, tanpa dependensi luar. Idempoten: input sama -> output sama.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXPORTS = path.join(ROOT, 'exports');
const REPORTS = path.join(ROOT, 'reports');
const SCHEMA = '1.0';
const CATS = ['AUTO_LAYOUT', 'TYPOGRAPHY', 'COLOR', 'SPACING', 'COMPONENT', 'NAMING'];

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function writeCSV(file, header, rows) {
  const lines = [header.join(',')].concat(rows.map((r) => r.map(csvCell).join(',')));
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function loadAudits() {
  if (!fs.existsSync(EXPORTS)) return [];
  const files = fs.readdirSync(EXPORTS).filter((f) => /^audit-.*\.json$/.test(f)).sort();
  const audits = [];
  for (const f of files) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(EXPORTS, f), 'utf8'));
      if (d.schemaVersion !== SCHEMA) {
        console.warn(`Lewati ${f}: schemaVersion "${d.schemaVersion}" tidak dikenal.`);
        continue;
      }
      d.sprint = d.sprint || '(tidak diisi)';
      d.owner = d.owner || '(tidak diisi)';
      audits.push(d);
    } catch (e) {
      console.warn(`Lewati ${f}: ${e.message}`);
    }
  }
  return audits;
}

function ratio(cat, c) {
  const x = c && c[cat];
  if (!x || x.total === 0) return '';
  return (x.passed / x.total).toFixed(3);
}

function main() {
  const audits = loadAudits();
  fs.mkdirSync(REPORTS, { recursive: true });

  if (audits.length === 0) {
    console.log('Tidak ada exports/audit-*.json yang valid. Tidak ada laporan dibuat.');
    return;
  }

  // 1. Pelanggaran per baris
  const teamRows = [];
  for (const a of audits) {
    for (const v of a.violations || []) {
      teamRows.push([
        a.sprint, a.owner, a.fileName, v.page, v.topLevelScreen, v.layerName,
        v.category, v.severity, v.matchType, v.currentValue, v.suggestion, v.status
      ]);
    }
  }
  teamRows.sort((x, y) => (x[0] + x[2] + x[5]).localeCompare(y[0] + y[2] + y[5]));
  writeCSV(path.join(REPORTS, 'team-report.csv'),
    ['sprint', 'owner', 'fileName', 'page', 'topLevelScreen', 'layerName', 'category', 'severity', 'matchType', 'currentValue', 'suggestion', 'status'],
    teamRows);

  // 2. Skor per file
  const perFile = audits.slice().sort((a, b) => (a.sprint + a.fileName).localeCompare(b.sprint + b.fileName));
  writeCSV(path.join(REPORTS, 'score-per-file.csv'),
    ['sprint', 'owner', 'fileName', 'score', 'status', 'nodeCount', ...CATS.map((c) => 'ratio_' + c)],
    perFile.map((a) => [
      a.sprint, a.owner, a.fileName, a.score.toFixed(1), a.status, a.nodeCount,
      ...CATS.map((c) => ratio(c, a.categories))
    ]));

  // 3. Skor per sprint, dibobot nodeCount agar file besar punya pengaruh lebih
  const bySprint = {};
  for (const a of audits) {
    const s = bySprint[a.sprint] || (bySprint[a.sprint] = { num: 0, den: 0, files: 0 });
    const w = a.nodeCount || 1;
    s.num += a.score * w;
    s.den += w;
    s.files++;
  }
  const sprintRows = Object.keys(bySprint).sort().map((k) => {
    const s = bySprint[k];
    const avg = s.num / s.den;
    const status = avg >= 90 ? 'EXCELLENT' : avg >= 75 ? 'PASS_WITH_WARNING' : 'REJECTED';
    return [k, s.files, avg.toFixed(1), status];
  });
  writeCSV(path.join(REPORTS, 'score-per-sprint.csv'),
    ['sprint', 'fileCount', 'weightedScore', 'status'], sprintRows);

  // 4. Ringkasan markdown
  const sevCount = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const catCount = {};
  for (const a of audits) {
    for (const v of a.violations || []) {
      sevCount[v.severity] = (sevCount[v.severity] || 0) + 1;
      catCount[v.category] = (catCount[v.category] || 0) + 1;
    }
  }
  const worstOwners = Object.values(audits.reduce((acc, a) => {
    const o = acc[a.owner] || (acc[a.owner] = { owner: a.owner, num: 0, den: 0 });
    const w = a.nodeCount || 1;
    o.num += a.score * w;
    o.den += w;
    return acc;
  }, {})).map((o) => ({ owner: o.owner, score: o.num / o.den }))
    .sort((x, y) => x.score - y.score)
    .slice(0, 3);
  const topCats = Object.entries(catCount).sort((x, y) => y[1] - x[1]).slice(0, 3);

  const md = [
    '# Ringkasan Audit Design System',
    '',
    `Jumlah file: ${audits.length}`,
    `Total pelanggaran: ${teamRows.length}`,
    `Skor rata-rata berbobot (semua file): ${(audits.reduce((s, a) => s + a.score * (a.nodeCount || 1), 0) / audits.reduce((s, a) => s + (a.nodeCount || 1), 0)).toFixed(1)}%`,
    '',
    '## Pelanggaran per severity',
    '',
    `- HIGH: ${sevCount.HIGH}`,
    `- MEDIUM: ${sevCount.MEDIUM}`,
    `- LOW: ${sevCount.LOW}`,
    '',
    '## Tiga kategori terbanyak',
    '',
    ...(topCats.length ? topCats.map(([c, n]) => `- ${c}: ${n}`) : ['- (tidak ada)']),
    '',
    '## Tiga penanggung jawab dengan skor terendah',
    '',
    ...worstOwners.map((o) => `- ${o.owner}: ${o.score.toFixed(1)}%`),
    ''
  ].join('\n');
  fs.writeFileSync(path.join(REPORTS, 'summary.md'), md);

  console.log(`Selesai: ${audits.length} file, ${teamRows.length} pelanggaran. Laporan di reports/.`);
}

main();
