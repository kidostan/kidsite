const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, 'prisma/seed.ts');
let seed = fs.readFileSync(seedPath, 'utf8');

function replaceStory(slug, newText) {
  const escaped = newText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n');
  const slugMarker = 'slug: "' + slug + '"';
  const slugIdx = seed.indexOf(slugMarker);
  if (slugIdx === -1) { console.log('NOT FOUND: ' + slug); return false; }
  const afterSlug = seed.substring(slugIdx);
  const storyTextIdx = afterSlug.indexOf('storyText: "');
  if (storyTextIdx === -1) { console.log('NO TEXT: ' + slug); return false; }
  const quoteStart = slugIdx + storyTextIdx + 12;
  let endPattern = '",\r\n    category:';
  let quoteEnd = seed.indexOf(endPattern, quoteStart);
  if (quoteEnd === -1) { endPattern = '",\n    category:'; quoteEnd = seed.indexOf(endPattern, quoteStart); }
  if (quoteEnd === -1) { console.log('NO END: ' + slug); return false; }
  seed = seed.substring(0, quoteStart) + escaped + seed.substring(quoteEnd);
  console.log('OK: ' + slug);
  return true;
}

// The tales are loaded from JSON files in tales/ directory
const talesDir = path.join(__dirname, 'tales');
if (!fs.existsSync(talesDir)) { fs.mkdirSync(talesDir); }

const files = fs.readdirSync(talesDir).filter(f => f.endsWith('.json'));
let count = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(talesDir, file), 'utf8'));
  if (replaceStory(data.slug, data.text)) count++;
}

fs.writeFileSync(seedPath, seed, 'utf8');
console.log('\nTotal replaced: ' + count);
