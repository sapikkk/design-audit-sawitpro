#!/usr/bin/env node
/** Sisipkan logo SawitPRO ke ui.html (data URI) — path relatif sering gagal di iframe Figma. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const token = '@@PLUGIN_LOGO_DATA_URI@@';
const iconPath = path.join(root, 'prompt', 'icon.png');
const uiPath = path.join(root, 'prompt', 'ui.html');

if (!fs.existsSync(iconPath)) {
  console.error('ERROR: prompt/icon.png tidak ada. Jalankan npm run figma:bundle dulu.');
  process.exit(1);
}
const b64 = fs.readFileSync(iconPath).toString('base64');
const uri = `data:image/png;base64,${b64}`;

let html = fs.readFileSync(uiPath, 'utf8');
if (!html.includes(token)) {
  if (html.includes('src="icon.png"') || html.includes('href="icon.png"')) {
    html = html.replace(/href="icon\.png"/g, `href="${token}"`);
    html = html.replace(/src="icon\.png"/g, `src="${token}"`);
  } else if (!html.includes('data:image/png;base64,')) {
    console.error('ERROR: ui.html tidak punya placeholder logo (@@PLUGIN_LOGO_DATA_URI@@ atau icon.png).');
    process.exit(1);
  } else {
    html = html.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, token);
  }
}
html = html.split(token).join(uri);
fs.writeFileSync(uiPath, html);
console.log('OK embed logo → prompt/ui.html (' + Math.round(uri.length / 1024) + ' KB data URI)');
