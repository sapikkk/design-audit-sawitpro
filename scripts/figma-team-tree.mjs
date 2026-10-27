#!/usr/bin/env node
/**
 * Tree file & project di Figma Team (REST API).
 * Usage:
 *   FIGMA_ACCESS_TOKEN=figd_... node scripts/figma-team-tree.mjs [team_id]
 * Default team_id: SawitPro dari URL tim (1179663437584859414).
 */
const teamId = process.argv[2] || '1179663437584859414';
const token = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
if (!token) {
  console.error('Set FIGMA_ACCESS_TOKEN (Figma → Settings → Security → Personal access tokens).');
  process.exit(1);
}

async function api(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': token }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.err || body.message || res.statusText;
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return body;
}

function padBranch(isLast) {
  return isLast ? '└── ' : '├── ';
}
function padPrefix(isLast) {
  return isLast ? '    ' : '│   ';
}

(async () => {
  const { name: teamName, projects } = await api(`/teams/${teamId}/projects`);
  console.log(`${teamName || 'Team'} (${teamId})`);
  if (!projects?.length) {
    console.log('└── (tidak ada project atau token tidak punya akses baca tim)');
    return;
  }
  for (let pi = 0; pi < projects.length; pi++) {
    const p = projects[pi];
    const lastP = pi === projects.length - 1;
    console.log(`${padBranch(lastP)}${p.name} [project ${p.id}]`);
    let files = [];
    try {
      const data = await api(`/projects/${p.id}/files`);
      files = data.files || [];
    } catch (e) {
      console.log(`${padPrefix(lastP)}└── (gagal baca file: ${e.message})`);
      continue;
    }
    const prefix = padPrefix(lastP);
    if (!files.length) {
      console.log(`${prefix}└── (kosong)`);
      continue;
    }
    for (let fi = 0; fi < files.length; fi++) {
      const f = files[fi];
      const lastF = fi === files.length - 1;
      console.log(`${prefix}${padBranch(lastF)}${f.name} [${f.key}]`);
    }
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
