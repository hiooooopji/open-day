const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Script } = require('node:vm');
const { spawnSync } = require('node:child_process');

const pages = [
  'index.html',
  ...['agentic', 'generative', 'cyber', 'quantum', 'robotics'].map(name => `simulations/${name}.html`),
];

for (const page of pages) {
  const html = readFileSync(resolve(__dirname, '../docs', page), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) throw new Error(`No inline scripts found in ${page}`);
  scripts.forEach((match, index) => new Script(match[1], { filename: `${page}:script-${index + 1}` }));
  console.log(`Syntax OK: ${page}`);
}

new Script(readFileSync(resolve(__dirname, '../docs/app.js'), 'utf8'), { filename: 'app.js' });
console.log('Syntax OK: app.js');
const moduleCheck = spawnSync(process.execPath, ['--input-type=module', '--check'], {
  input: readFileSync(resolve(__dirname, '../docs/incident-3d.js'), 'utf8'),
  encoding: 'utf8',
});
if (moduleCheck.error) throw moduleCheck.error;
if (moduleCheck.status !== 0) throw new Error(moduleCheck.stderr);
console.log('Syntax OK: incident-3d.js');
