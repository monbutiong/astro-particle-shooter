import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing emojis by hex replacement...\n');

// Fix 1: Shield emoji - remove extra variation selector
// f09f9ba1 c28f → f09f9ba1
content = content.replace(/\u{1F6A1}\u{008F}/gu, '\u{1F6A1}');

// Fix 2: Star emoji - remove extra control character
// e2ad90 c290 → e2ad90
content = content.replace(/\u{2B50}\u{0090}/gu, '\u{2B50}');

// Fix 3: Heart emoji - replace double-encoded UTF-8
// c3a2c29dc2a4c3afc2b8c28f (â¤ï¸) → e29da4 (❤)
content = content.replace(/â¤ï¸/g, '❤');

fs.writeFileSync(filePath, content, 'utf8');

// Verify
const newContent = fs.readFileSync(filePath, 'utf8');
const lines = newContent.split('\n');

console.log('✓ Fixed! Verifying:\n');
console.log('Line 1506:', lines[1505].trim());
console.log('Line 1518:', lines[1517].trim());
console.log('Line 1521:', lines[1520].trim());
console.log('Line 1474:', lines[1473].trim());

// Also check bytes to be sure
console.log('\nByte verification:');
console.log('Line 1506 hex:', Buffer.from(lines[1505]).toString('hex').substring(100, 120));
console.log('Line 1518 hex:', Buffer.from(lines[1517]).toString('hex').substring(100, 120));
console.log('Line 1521 hex:', Buffer.from(lines[1520]).toString('hex').substring(100, 120));
console.log('Line 1474 hex:', Buffer.from(lines[1473]).toString('hex').substring(100, 120));
