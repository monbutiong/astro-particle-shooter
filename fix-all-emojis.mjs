import fs from 'fs';

const filePath = './src/SpaceSnakeGame.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix corrupted emojis in JSX Start Screen
const replacements = [
  // Line 1506 - Shield icon
  { search: "ðŸ›¡ï¸", replace: "🛡" },
  { search: "ðŸ›¡ï¸\u200d", replace: "🛡" },
  
  // Line 1518 - Super star icon
  { search: "â­", replace: "⭐" },
  { search: "â­\u200d", replace: "⭐" },
  
  // Line 1521 - Heart icon
  { search: "â¤ï¸", replace: "❤" },
  { search: "â¤ï¸\u200d", replace: "❤" },
  
  // Line 1474 - Lives display
  { search: "Lives: {'â¤ï¸'.repeat(lives)}", replace: "Lives: {'❤'.repeat(lives)}" },
];

// Apply all replacements
replacements.forEach(({ search, replace }) => {
  content = content.replaceAll(search, replace);
});

// Additional direct string replacements for known corrupted patterns
content = content.replace(/ðŸ›¡ï¸/g, '🛡');
content = content.replace(/â­\u200d/g, '⭐');
content = content.replace(/â­/g, '⭐');
content = content.replace(/â¤ï¸/g, '❤');

console.log('Fixed emojis in Start Screen and HUD');
console.log('Replacements made:');

// Count what was fixed
let count = 0;
replacements.forEach(({ search }) => {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    console.log(`- ${search}: ${matches.length} occurrences`);
    count += matches.length;
  }
});

console.log(`Total replacements: ${count}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved successfully!');
