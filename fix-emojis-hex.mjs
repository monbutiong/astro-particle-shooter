import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Debugging emoji bytes...\n');

// Get specific lines
const lines = content.split('\n');

console.log('Line 1506 bytes:');
console.log(Buffer.from(lines[1505]).toString('hex'));

console.log('\nLine 1518 bytes:');
console.log(Buffer.from(lines[1517]).toString('hex'));

console.log('\nLine 1521 bytes:');
console.log(Buffer.from(lines[1520]).toString('hex'));

console.log('\nLine 1474 bytes:');
console.log(Buffer.from(lines[1473]).toString('hex'));

// Now try to fix by hex patterns
// 1. Shield emoji (should be F0 9F 9B A1)
content = content.replace(/\u{1F6A1}\uFE0F/gu, '\u{1F6A1}');

// 2. Star emoji (should be E2 AD 90)
content = content.replace(/\u{2B50}\uFE0F/gu, '\u{2B50}');

// 3. Heart emoji - the double-encoded version
// â = C3 A2, ¤ = C2 A4, ï = C3 AF, ¸ = C2 B8
// We need to replace C3 A2 C2 A4 C3 AF C2 B8 with E2 9D A4
content = content.replace(/â¤ï¸/g, '❤');

// Save and verify
fs.writeFileSync(filePath, content, 'utf8');

// Read back and check
const newContent = fs.readFileSync(filePath, 'utf8');
const newLines = newContent.split('\n');

console.log('\n--- After Fix ---\n');
console.log('Line 1506:', newLines[1505]);
console.log('Line 1518:', newLines[1517]);
console.log('Line 1521:', newLines[1520]);
console.log('Line 1474:', newLines[1473]);
