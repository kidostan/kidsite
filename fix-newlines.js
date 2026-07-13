const fs = require('fs');
const seedPath = __dirname + '/prisma/seed.ts';
let seed = fs.readFileSync(seedPath, 'utf8');

// Find all storyText: "..." and fix literal newlines inside them
let fixed = 0;
let pos = 0;
while (true) {
  const marker = 'storyText: "';
  const idx = seed.indexOf(marker, pos);
  if (idx === -1) break;
  
  const strStart = idx + marker.length;
  
  // Find the closing pattern: ",\r\n    category: or ",\n    category:
  let endIdx = -1;
  for (const endPattern of ['",\r\n    category:', '",\n    category:']) {
    const found = seed.indexOf(endPattern, strStart);
    if (found !== -1) {
      endIdx = found;
      break;
    }
  }
  if (endIdx === -1) { pos = strStart; continue; }
  
  const content = seed.substring(strStart, endIdx);
  // Check for literal newlines (not \n escape sequences)
  if (content.includes('\n') || content.includes('\r')) {
    const escaped = content.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
    seed = seed.substring(0, strStart) + escaped + seed.substring(endIdx);
    fixed++;
    // Recalculate endIdx for next search
    pos = strStart + escaped.length;
  } else {
    pos = endIdx;
  }
}

if (fixed > 0) {
  fs.writeFileSync(seedPath, seed, 'utf8');
  console.log('Fixed ' + fixed + ' stories with literal newlines');
} else {
  console.log('No stories to fix');
}
