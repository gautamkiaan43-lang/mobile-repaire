const fs = require('fs');

function findInFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let inModel = false;
  let braces = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"iPhone 13 Pro"')) {
      inModel = true;
      console.log(`${filePath}: Found "iPhone 13 Pro" on line ${i + 1}`);
    }
    if (inModel) {
      if (line.includes('{')) braces += (line.match(/{/g) || []).length;
      if (line.includes('}')) braces -= (line.match(/}/g) || []).length;
      if (line.includes('"Screen Repair"')) {
        console.log(`${filePath}: Found "Screen Repair" under iPhone 13 Pro on line ${i + 1}`);
      }
      if (line.includes('"options"')) {
        console.log(`${filePath}: Found "options" on line ${i + 1}`);
      }
      if (line.includes(']') && braces === 0) {
        console.log(`${filePath}: End of iPhone 13 Pro repairs on line ${i + 1}`);
        inModel = false;
      }
    }
  }
}

findInFile('catalog/catalog.json');
findInFile('../frontend/src/data/repairDatabase.json');
findInFile('../iPhone_Master_Updated_Plus20_With_Spacing.txt');
