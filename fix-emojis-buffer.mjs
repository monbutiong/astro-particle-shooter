import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';

// Read as buffer to preserve exact bytes
let buffer = fs.readFileSync(filePath);

console.log('Fixing emojis with buffer replacement...\n');

// The problematic byte sequences (as hex strings):
const replacements = [
  {
    search: Buffer.from([0xf0, 0x9f, 0x9b, 0xa1, 0xc2, 0x8f]), // 🛡
    replace: Buffer.from([0xf0, 0x9f, 0x9b, 0xa1]) // 🛡
  },
  {
    search: Buffer.from([0xc3, 0xa2, 0xc2, 0x9d, 0xc2, 0xa4, 0xc3, 0xaf, 0xc2, 0xb8, 0xc2, 0x8f]), // â¤ï¸
    replace: Buffer.from([0xe2, 0x9d, 0xa4]) // ❤
  }
];

let content = buffer.toString('utf8');
let count = 0;

// Apply each replacement
replacements.forEach(({ search, replace }) => {
  const searchStr = search.toString('utf8');
  const replaceStr = replace.toString('utf8');
  const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    console.log(`Replacing "${searchStr}" with "${replaceStr}" (${matches.length} times)`);
    content = content.replace(regex, replaceStr);
    count += matches.length;
  }
});

fs.writeFileSync(filePath, content, 'utf8');

// Verify
const newContent = fs.readFileSync(filePath, 'utf8');
const lines = newContent.split('\n');

console.log(`\n✓ Fixed ${count} emoji(s)! Verifying:\n`);
console.log('Line 1506:', lines[1505].trim());
console.log('Line 1518:', lines[1517].trim());
console.log('Line 1521:', lines[1520].trim());
console.log('Line 1474:', lines[1473].trim());
