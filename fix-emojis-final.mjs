import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing all remaining emoji issues...\n');

// Fix 1: Shield emoji with extra variation selector (line 1506)
content = content.replace(/🛡\uFE0F/g, '🛡');
content = content.replace(/🛡️/g, '🛡');

// Fix 2: Star emoji with extra variation selector (line 1518)  
content = content.replace(/⭐\uFE0F/g, '⭐');
content = content.replace(/⭐️/g, '⭐');

// Fix 3: Heart emoji - double-encoded UTF-8 (lines 1521, 1474)
// These appear as â¤ï¸ which is UTF-8 interpreted as Latin-1
content = content.replace(/â¤ï¸/g, '❤');

// Additional comprehensive fixes
content = content.replace(/â¤/g, '❤');
content = content.replace(/ðŸ›¡/g, '🛡');

// Verify the fixes
const lines = content.split('\n');
console.log('Verifying fixes:');
console.log('Line 1506:', lines[1505].trim());
console.log('Line 1518:', lines[1517].trim());
console.log('Line 1521:', lines[1520].trim());
console.log('Line 1474:', lines[1473].trim());

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✓ File saved successfully!');
