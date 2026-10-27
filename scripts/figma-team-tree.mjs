#!/usr/bin/env node
/**
 * Tree folder & file Figma Team (REST API v2 folders).
 * Token butuh scope folders:read (bukan projects:read).
 *
 *   FIGMA_ACCESS_TOKEN=figd_... node scripts/figma-team-tree.mjs [team_id]
 */
const teamId = process.argv[2] || '1179663437584859414';
const token = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
if (!token) {
  console.error('Set FIGMA_ACCESS_TOKEN (Settings → Security → Personal access tokens, centang folders:read).');
  process.exit(1);
}

async function apiV2(path) {
  const res = await fetch(`https://api.figma.com/v2${path}`, {
    headers: { 'X-Figma-Token': token }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || body.err || res.statusText;
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return body;
}

function branch(isLast) {
  return isLast ? '└── ' : '├── ';
}
function cont(isLast) {
  return isLast ? '    ' : '│   ';
}

async function listSubfolders(folderId) {
  const data = await apiV2(`/folders/${folderId}/folders`);
  return data.folders || data.items || [];
}

async function listFiles(folderId) {
  const data = await apiV2(`/folders/${folderId}/files`);
  return data.files || [];
}

async function printFolder(folder, prefix, isLast) {
  const name = folder.name || '(tanpa nama)';
  const id = folder.id || folder.folder_id || '';
  console.log(`${prefix}${branch(isLast)}📁 ${name}${id ? ` [${id}]` : ''}`);
  const inner = prefix + cont(isLast);
  let subs = [];
  let files = [];
  try {
    subs = await listSubfolders(id);
  } catch (e) {
    console.log(`${inner}└── (subfolder: ${e.message})`);
    return;
  }
  try {
    files = await listFiles(id);
  } catch (e) {
    console.log(`${inner}└── (file: ${e.message})`);
    return;
  }
  const items = [
    ...subs.map((s) => ({ type: 'folder', data: s })),
    ...files.map((f) => ({ type: 'file', data: f }))
  ];
  for (let i = 0; i < items.length; i++) {
    const last = i === items.length - 1;
    const item = items[i];
    if (item.type === 'folder') {
      await printFolder(item.data, inner, last);
    } else {
      const f = item.data;
      console.log(`${inner}${branch(last)}📄 ${f.name} [${f.key || f.file_key}]`);
    }
  }
}

(async () => {
  console.log(`SawitPro Team (${teamId})`);
  console.log('(API v2 folders — docs: https://developers.figma.com/docs/rest-api/folders-endpoints/)');
  console.log('');
  const data = await apiV2(`/teams/${teamId}/folders`);
  const roots = data.folders || [];
  if (!roots.length) {
    console.log('└── (tidak ada folder top-level atau token tidak punya akses)');
    return;
  }
  for (let i = 0; i < roots.length; i++) {
    await printFolder(roots[i], '', i === roots.length - 1);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
