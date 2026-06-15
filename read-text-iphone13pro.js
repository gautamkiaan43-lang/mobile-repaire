const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync('../iPhone_Master_Updated_Plus20_With_Spacing.txt', 'utf8').split('\n');

let found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('iPhone 13 Pro') && !lines[i].includes('Max')) {
    found = true;
    console.log(`Line ${i + 1}: ${lines[i]}`);
    for (let j = i; j < i + 30; j++) {
      console.log(`[${j + 1}] ${lines[j]}`);
    }
    break;
  }
}
