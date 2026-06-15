const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync('../iPhone_Master_Updated_Plus20_With_Spacing.txt', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('15 plus')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    // Print 30 lines before and after
    const start = Math.max(0, i - 15);
    const end = Math.min(lines.length, i + 35);
    for (let j = start; j < end; j++) {
      console.log(`[${j + 1}] ${lines[j]}`);
    }
    break;
  }
}
