const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FILES_TO_CHECK = [
  'index.html',
  'privacy-policy.html',
  path.join('js', 'modules', 'game.js'),
  path.join('js', 'modules', 'lousa.js'),
];

function hasEncodingIssue(text) {
  const mojibake = /Ã|Â|ï¿½|�/;
  const questionInsideWord = /[A-Za-zÀ-ÿ]\?[A-Za-zÀ-ÿ]/;
  return mojibake.test(text) || questionInsideWord.test(text);
}

let failed = false;
for (const relPath of FILES_TO_CHECK) {
  const file = path.join(ROOT, relPath);
  const content = fs.readFileSync(file, 'utf8');
  if (hasEncodingIssue(content)) {
    failed = true;
    console.error(`Encoding issue: ${relPath}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log('Encoding check OK');
