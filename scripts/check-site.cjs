const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Script } = require('node:vm');

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
