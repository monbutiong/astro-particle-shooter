import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Lines with setScore or setLives:');
lines.forEach((line, i) => {
  if (line.includes('setScore') || line.includes('setLives')) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
});
