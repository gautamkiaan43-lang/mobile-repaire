const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog', 'catalog.json'), 'utf8'));
const modelRepairs = catalog.Apple.iPhone.repairs['iPhone 13 Pro'];
console.log('iPhone 13 Pro repairs in catalog.json:', JSON.stringify(modelRepairs?.[0], null, 2));

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/src/data/repairDatabase.json'), 'utf8'));
const dbRepairs = db.Apple.iPhone.repairs['iPhone 13 Pro'];
console.log('iPhone 13 Pro repairs in repairDatabase.json:', JSON.stringify(dbRepairs?.[0], null, 2));
