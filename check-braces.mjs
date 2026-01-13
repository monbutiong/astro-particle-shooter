import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Analyzing brace matching in update function (lines 506-1043):\n');

let braceCount = 0;
let inUpdateFunc = false;
let updateStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Check if we're at the update function start
  if (line.includes('const update = (deltaTime, canvas) => {')) {
    inUpdateFunc = true;
    updateStartLine = lineNum;
    braceCount = 1; // Count the opening brace
    console.log(`Line ${lineNum}: START - const update = (deltaTime, canvas) => {`);
    continue;
  }
  
  if (!inUpdateFunc) continue;
  
  // Stop at the end of update function
  if (lineNum > 1043) {
    console.log(`\nLine ${lineNum}: END (line 1043)`);
    break;
  }
  
  // Count braces
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  
  if (openBraces > 0 || closeBraces > 0) {
    const oldCount = braceCount;
    braceCount += openBraces - closeBraces;
    const status = braceCount < oldCount ? 'CLOSED' : 'OPENED';
    console.log(`Line ${lineNum}: ${status} ${braceCount > oldCount ? '+' : ''}${braceCount - oldCount} = ${braceCount} | ${line.trim().substring(0, 60)}`);
  }
}

console.log(`\nFinal brace count: ${braceCount}`);
if (braceCount !== 0) {
  console.log(`ERROR: Mismatch! Expected 0 braces, got ${braceCount}`);
} else {
  console.log('OK: Braces are balanced');
}
