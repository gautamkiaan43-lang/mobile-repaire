const fs = require('fs');
const path = require('path');

const brandHierarchy = {
  Apple: 1.0,
  Microsoft: 1.0,
  Samsung: 0.8,
  Google: 0.8,
  Huawei: 0.8,
  OnePlus: 0.5,
  Oppo: 0.5,
  Motorola: 0.5,
  Dell: 0.3,
  HP: 0.3,
  Lenovo: 0.3,
  Asus: 0.4,
  Acer: 0.3
};

const brandDeviceMapping = {
  Apple: ['iPhone', 'iPad', 'MacBook', 'Apple Watch', 'AirPods'],
  Samsung: ['Galaxy S Series', 'Galaxy A Series'],
  Microsoft: ['Surface Tablet', 'Surface Laptop'],
  Google: ['Pixel'],
  Oppo: ['Find', 'Reno'],
  OnePlus: ['OnePlus'],
  Motorola: ['Moto'],
  Huawei: ['P Series', 'Mate Series'],
  Dell: ['Laptop'],
  HP: ['Laptop'],
  Lenovo: ['ThinkPad', 'IdeaPad', 'Lenovo Tablet'],
  Asus: ['Asus'],
  Acer: ['Acer']
};

const getGenericType = (deviceType) => {
  if (deviceType.includes('Phone') || deviceType.includes('Galaxy') || deviceType === 'iPhone' || deviceType === 'Find' || deviceType === 'Reno' || deviceType.includes('Moto') || deviceType.includes('Pixel') || deviceType.includes('P Series') || deviceType.includes('Mate Series') || deviceType === 'OnePlus' || deviceType === 'Asus') return 'Phone';
  const t = deviceType.toLowerCase();
  if (t.includes('thinkpad') || t.includes('ideapad') || t.includes('macbook') || t.includes('laptop') || t.includes('chromebook') || t.includes('acer')) return 'Laptop';
  if (t.includes('pad') || t.includes('tablet') || t.includes('surface pro') || t.includes('surface go')) return 'Tablet';
  if (t.includes('watch') || t.includes('band')) return 'Watch';
  if (t.includes('buds') || t.includes('airpods') || t.includes('earbuds')) return 'Earbuds';
  if (t.includes('desktop') || t.includes('studio') || t.includes('xbox')) return 'Desktop';
  if (t.includes('monitor') || t.includes('display')) return 'Monitor';
  return 'Phone'; // fallback
};

const repairsList = {
  iPhone: [
    { name: 'Screen Repair', dur: '1 hour', pop: true, war: '12 mo warranty' },
    { name: 'Back Glass Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Battery Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Charging Port Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Front Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Rear Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Camera Glass Broken', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Power / Volume Button', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Microphone Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Speaker Repair', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Water / Liquid Damage Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Motherboard / Logicboard Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Not Turning On', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Free Diagnostic', dur: '1 hour', pop: false, war: '12 mo warranty' }
  ],
  iPad: [
    { name: 'Front Glass Repair', dur: '2 hours', pop: true, war: '12 mo warranty' },
    { name: 'Main Lcd Repair', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Battery Replacement', dur: '2 hours', pop: false, war: '12 mo warranty' },
    { name: 'Charging Port Replacement', dur: '2 hours', pop: false, war: '12 mo warranty' },
    { name: 'Front Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Rear Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Speaker Repair', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Water / Liquid Damage Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Motherboard / Logicboard Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Not Turning On', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Free Diagnostic', dur: '1 hour', pop: false, war: '12 mo warranty' }
  ],
  MacBook: [
    { name: 'Screen Repair & Replacement', dur: '3 hours', pop: true, war: '12 mo warranty' },
    { name: 'Battery Replacement', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Charging Port Replacement', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Keyboard Replacement', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Trackpad Not Working', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Microphone Replacement', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Speaker Repair', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Water / Liquid Damage Repair', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Motherboard / Logicboard Repair', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Not Turning On', dur: '2 days', pop: false, war: '12 mo warranty' },
    { name: 'Software Update / Restore', dur: '3 hours', pop: false, war: '12 mo warranty' },
    { name: 'Free Diagnostic', dur: '3 hours', pop: false, war: '12 mo warranty' }
  ],
  'Apple Watch': [
    { name: 'Screen Repair', dur: '1 day', pop: true, war: '12 mo warranty' }
  ],
  Phone: [
    { name: 'Screen Repair', dur: '1 hour', pop: true, war: '12 mo warranty' },
    { name: 'Back Glass Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Battery Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Charging Port Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Front Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Rear Camera Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Camera Glass Broken', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Power / Volume Button', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Microphone Replacement', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Speaker Repair', dur: '1 hour', pop: false, war: '12 mo warranty' },
    { name: 'Water / Liquid Damage Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Motherboard / Logicboard Repair', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Not Turning On', dur: '1 day', pop: false, war: '12 mo warranty' },
    { name: 'Free Diagnostic', dur: '1 hour', pop: false, war: '12 mo warranty' }
  ],
  Tablet: [
    { name: 'Screen Repair', dur: '2 hours', pop: true },
    { name: 'Battery Replacement', dur: '1 hour', pop: false },
    { name: 'Charging Port Repair', dur: '1 hour', pop: false },
    { name: 'Software Update / Restore', dur: '1 hour', pop: false },
    { name: 'Motherboard Repair', dur: '3-5 days', pop: false },
    { name: 'Water Damage Repair', dur: '2-4 days', pop: false },
    { name: 'Stylus Repair', dur: '1 hour', pop: false },
    { name: 'Digitizer Replacement', dur: '2 hours', pop: true },
    { name: 'Diagnostic Service', dur: '1 hour', pop: false },
  ],
  Laptop: [
    { name: 'Motherboard Repair', dur: '3-5 days', pop: false },
    { name: 'Screen Replacement', dur: '2 hours', pop: true },
    { name: 'Keyboard Replacement', dur: '2 hours', pop: false },
    { name: 'SSD Upgrade', dur: '1 hour', pop: true },
    { name: 'RAM Upgrade', dur: '1 hour', pop: false },
    { name: 'Battery Replacement', dur: '1 hour', pop: false },
    { name: 'Software Update / Restore', dur: '1-2 hours', pop: false },
    { name: 'Virus Removal', dur: '2 hours', pop: false },
    { name: 'Liquid Damage Repair', dur: '3-5 days', pop: false },
    { name: 'Data Recovery', dur: '2-4 days', pop: false },
    { name: 'Charging Port Repair', dur: '1-2 hours', pop: false },
    { name: 'Touchpad Repair', dur: '1 hour', pop: false },
    { name: 'Fan Replacement', dur: '1 hour', pop: false },
    { name: 'Overheating Fix', dur: '2 hours', pop: false },
    { name: 'Hinge Repair', dur: '2 hours', pop: false },
    { name: 'Speaker Repair', dur: '1 hour', pop: false },
    { name: 'Camera Repair', dur: '1 hour', pop: false },
    { name: 'Diagnostic Service', dur: '1 hour', pop: false },
  ],
  Watch: [
    { name: 'Screen Repair', dur: '1-2 hours', pop: true },
    { name: 'Battery Replacement', dur: '1 hour', pop: false },
    { name: 'Water Damage Repair', dur: '2-4 days', pop: false },
    { name: 'Software Update / Restore', dur: '1 hour', pop: false },
  ],
  Earbuds: [
    { name: 'Battery Replacement', dur: '1-2 hours', pop: true },
    { name: 'Charging Case Repair', dur: '2 hours', pop: false },
    { name: 'Water Damage Repair', dur: '2-3 days', pop: false },
  ],
  Desktop: [
    { name: 'Motherboard Repair', dur: '2-4 days', pop: false },
    { name: 'Power Supply Replacement', dur: '1 hour', pop: true },
    { name: 'SSD Upgrade', dur: '1 hour', pop: false },
    { name: 'RAM Upgrade', dur: '1 hour', pop: false },
  ],
  Monitor: [
    { name: 'Screen Panel Replacement', dur: '1-2 days', pop: false },
    { name: 'Power Board Repair', dur: '2 days', pop: true },
  ]
};

const generateModels = (prefix, suffixArray, tiers, type) => {
  let list = [];
  suffixArray.forEach((suffix, i) => {
    let year = 2024 - Math.floor(i / 2);
    let name = prefix ? `${prefix} ${suffix}` : suffix;
    let tier = tiers[i];
    list.push({ name, year: year.toString(), tier: tier });
  });
  return list;
};

const generateCustomModels = (modelsArray) => {
  return modelsArray.map(m => ({
    name: m.name,
    year: m.year.toString(),
    tier: m.tier
  }));
};

const modelsDB = {
  Apple: {
    Phone: generateCustomModels([
      { name: 'iPhone 17e', year: 2026, tier: 0.95 },
      { name: 'iPhone 17 Pro Max', year: 2025, tier: 1.0 },
      { name: 'iPhone 17 Pro', year: 2025, tier: 0.95 },
      { name: 'iPhone 17 Air', year: 2025, tier: 0.9 },
      { name: 'iPhone 17', year: 2025, tier: 0.85 },
      { name: 'iPhone 16e', year: 2025, tier: 0.8 },
      { name: 'iPhone 16 Pro Max', year: 2024, tier: 0.9 },
      { name: 'iPhone 16 Pro', year: 2024, tier: 0.85 },
      { name: 'iPhone 16 Plus', year: 2024, tier: 0.8 },
      { name: 'iPhone 16', year: 2024, tier: 0.75 },
      { name: 'iPhone 15 Pro Max', year: 2023, tier: 0.85 },
      { name: 'iPhone 15 Pro', year: 2023, tier: 0.8 },
      { name: 'iPhone 15 Plus', year: 2023, tier: 0.75 },
      { name: 'iPhone 15', year: 2023, tier: 0.7 },
      { name: 'iPhone 14 Pro Max', year: 2022, tier: 0.8 },
      { name: 'iPhone 14 Pro', year: 2022, tier: 0.75 },
      { name: 'iPhone 14 Plus', year: 2022, tier: 0.7 },
      { name: 'iPhone 14', year: 2022, tier: 0.65 },
      { name: 'iPhone 13 Pro Max', year: 2021, tier: 0.75 },
      { name: 'iPhone 13 Pro', year: 2021, tier: 0.7 },
      { name: 'iPhone 13', year: 2021, tier: 0.6 },
      { name: 'iPhone 13 mini', year: 2021, tier: 0.55 },
      { name: 'iPhone 12 Pro Max', year: 2020, tier: 0.7 },
      { name: 'iPhone 12 Pro', year: 2020, tier: 0.65 },
      { name: 'iPhone 12', year: 2020, tier: 0.55 },
      { name: 'iPhone 12 mini', year: 2020, tier: 0.5 },
      { name: 'iPhone 11 Pro Max', year: 2019, tier: 0.6 },
      { name: 'iPhone 11 Pro', year: 2019, tier: 0.55 },
      { name: 'iPhone 11', year: 2019, tier: 0.45 },
      { name: 'iPhone XS Max', year: 2018, tier: 0.4 },
      { name: 'iPhone XS', year: 2018, tier: 0.35 },
      { name: 'iPhone X', year: 2017, tier: 0.3 },
      { name: 'iPhone 8 Plus', year: 2026, tier: 0.25 },
      { name: 'iPhone 8', year: 2017, tier: 0.2 }
    ]),
    Tablet: generateCustomModels([
      { name: 'iPad 11th Gen (A16)', year: 2025, tier: 0.9 },
      { name: 'iPad Pro 11-inch (M5)', year: 2025, tier: 1.0 },
      { name: 'iPad Pro 11-inch (M4)', year: 2024, tier: 0.95 },
      { name: 'iPad Pro 13-inch (M4)', year: 2024, tier: 1.0 },
      { name: 'iPad Air 13-inch (M2)', year: 2024, tier: 0.9 },
      { name: 'iPad Air 11-inch (M2)', year: 2024, tier: 0.85 },
      { name: 'iPad Pro 11-inch (4th gen)', year: 2022, tier: 0.8 },
      { name: 'iPad 10th Generation', year: 2022, tier: 0.75 },
      { name: 'iPad Pro 12.9-inch (6th gen)', year: 2022, tier: 0.85 },
      { name: 'iPad Air (5th generation)', year: 2022, tier: 0.75 },
      { name: 'iPad mini 6', year: 2021, tier: 0.7 },
      { name: 'iPad Pro 12.9-inch (5th gen)', year: 2021, tier: 0.8 },
      { name: 'iPad Pro 11-inch (3rd gen)', year: 2021, tier: 0.75 },
      { name: 'iPad (9th generation)', year: 2021, tier: 0.65 },
      { name: 'iPad Pro 12.9-inch (4th gen)', year: 2020, tier: 0.7 },
      { name: 'iPad (8th generation)', year: 2020, tier: 0.6 },
      { name: 'iPad Air (4th generation)', year: 2020, tier: 0.65 },
      { name: 'iPad Pro 11-inch (2nd gen)', year: 2020, tier: 0.65 },
      { name: 'iPad (7th generation)', year: 2019, tier: 0.55 },
      { name: 'iPad Air (3rd generation)', year: 2019, tier: 0.55 },
      { name: 'iPad Mini (5th generation)', year: 2019, tier: 0.5 },
      { name: 'iPad (6th generation)', year: 2018, tier: 0.45 },
      { name: 'iPad Pro 12.9-inch (3rd gen)', year: 2018, tier: 0.55 },
      { name: 'iPad Pro 11-inch (1st gen)', year: 2018, tier: 0.5 },
      { name: 'iPad Pro 10.5-inch (1st gen)', year: 2017, tier: 0.45 },
      { name: 'iPad (5th generation)', year: 2017, tier: 0.35 },
      { name: 'iPad Pro 9.7-inch (1st gen)', year: 2016, tier: 0.4 },
      { name: 'iPad Pro 12.9-inch (1st gen)', year: 2015, tier: 0.35 },
      { name: 'iPad Mini 4', year: 2015, tier: 0.3 },
      { name: 'iPad Mini 3', year: 2014, tier: 0.25 }
    ]),
    Laptop: generateCustomModels([
      { name: 'MacBook Air 15.3" (M3)', year: 2024, tier: 0.95 },
      { name: 'MacBook Air 13" (M3)', year: 2024, tier: 0.9 },
      { name: 'MacBook Pro 14" (M3)', year: 2023, tier: 0.9 },
      { name: 'MacBook Pro 14" (M3 Pro/Max)', year: 2023, tier: 1.0 },
      { name: 'MacBook Pro 16" (M3 Pro/Max)', year: 2023, tier: 1.0 },
      { name: 'Macbook Air 15.3" (M2)', year: 2023, tier: 0.85 },
      { name: 'MacBook Pro 16" (M2 Pro/Max)', year: 2023, tier: 0.95 },
      { name: 'MacBook Pro 14" (M2 Pro)', year: 2022, tier: 0.9 },
      { name: 'MacBook Air 13" (M2)', year: 2022, tier: 0.8 },
      { name: 'MacBook Pro 14" (M1 Pro)', year: 2021, tier: 0.85 },
      { name: 'MacBook Pro 16" (M1 Pro)', year: 2021, tier: 0.9 },
      { name: 'MacBook Pro 13" (M1)', year: 2020, tier: 0.75 },
      { name: 'MacBook Air 13" (M1)', year: 2020, tier: 0.7 },
      { name: 'MacBook Pro 13" (2020)', year: 2020, tier: 0.65 },
      { name: 'MacBook Air 13"', year: 2020, tier: 0.6 },
      { name: 'MacBook Pro 13" (A2289)', year: 2020, tier: 0.65 },
      { name: 'MacBook Air 13"', year: 2019, tier: 0.55 },
      { name: 'MacBook Pro 13"', year: 2019, tier: 0.6 },
      { name: 'MacBook Pro 13"', year: 2018, tier: 0.55 },
      { name: 'MacBook Pro 13"', year: 2017, tier: 0.5 },
      { name: 'MacBook Pro 13"', year: 2016, tier: 0.45 },
      { name: 'MacBook Pro 15"', year: 2016, tier: 0.5 },
      { name: 'Macbook Air 13" (2015)', year: 2015, tier: 0.4 },
      { name: 'MacBook Pro 15" (2012)', year: 2012, tier: 0.3 },
      { name: 'MacBook Air 11"', year: 2012, tier: 0.2 },
      { name: 'Macbook Pro 13"', year: 2012, tier: 0.25 }
    ]),
    'Apple Watch': generateCustomModels([
      { name: 'Apple Watch Series 10', year: 2024, tier: 1.0 },
      { name: 'Watch Ultra 1', year: 2024, tier: 0.95 },
      { name: 'Apple Watch Series 9', year: 2023, tier: 0.9 },
      { name: 'Apple Watch Ultra 2', year: 2023, tier: 1.0 },
      { name: 'Apple Watch SE (2nd Gen)', year: 2022, tier: 0.6 },
      { name: 'Apple Watch Series 8', year: 2022, tier: 0.8 }
    ])
  },
  Samsung: {
    'Galaxy S Series': generateCustomModels([
      { name: 'Samsung Galaxy S25 Ultra', year: 2025, tier: 1.0 },
      { name: 'Samsung Galaxy S25 Plus', year: 2025, tier: 0.95 },
      { name: 'Samsung Galaxy S25', year: 2025, tier: 0.9 },
      { name: 'Samsung Galaxy S24 Ultra', year: 2024, tier: 0.9 },
      { name: 'Samsung Galaxy S24 Plus', year: 2024, tier: 0.85 },
      { name: 'Samsung Galaxy S24', year: 2024, tier: 0.8 },
      { name: 'Samsung Galaxy S23 Ultra', year: 2023, tier: 0.8 },
      { name: 'Samsung Galaxy S23 Plus', year: 2023, tier: 0.75 },
      { name: 'Samsung Galaxy S23', year: 2023, tier: 0.7 },
      { name: 'Samsung Galaxy S22 Ultra', year: 2022, tier: 0.7 },
      { name: 'Samsung Galaxy S22 Plus', year: 2022, tier: 0.65 },
      { name: 'Samsung Galaxy S22', year: 2022, tier: 0.6 },
      { name: 'Samsung Galaxy S21 Ultra', year: 2021, tier: 0.6 },
      { name: 'Samsung Galaxy S21 Plus', year: 2021, tier: 0.55 },
      { name: 'Samsung Galaxy S21 FE', year: 2021, tier: 0.5 },
      { name: 'Samsung Galaxy S21', year: 2021, tier: 0.5 },
      { name: 'Samsung Galaxy S20 Ultra', year: 2020, tier: 0.5 },
      { name: 'Samsung Galaxy S20 Plus', year: 2020, tier: 0.45 },
      { name: 'Samsung Galaxy S20', year: 2020, tier: 0.4 },
      { name: 'Samsung Galaxy S20 FE', year: 2020, tier: 0.35 }
    ]),
    'Galaxy A Series': generateCustomModels([
      { name: 'Samsung Galaxy A25 5G', year: 2024, tier: 0.4 }
    ]),
    Tablet: generateModels('Galaxy Tab', ['S9 Ultra', 'S9+', 'S9', 'S8 Ultra', 'S8+', 'S8', 'S7 FE', 'A9+'], [1.0, 0.9, 0.8, 0.8, 0.7, 0.6, 0.4, 0.3]),
    Laptop: generateModels('Galaxy Book', ['4 Ultra', '4 Pro', '4 360', '3 Ultra', '3 Pro', '2 Pro'], [1.0, 0.8, 0.7, 0.8, 0.7, 0.5]),
    Watch: generateModels('Galaxy Watch', ['6 Classic', '6', '5 Pro', '5'], [1.0, 0.8, 0.8, 0.6]),
    Earbuds: generateModels('Galaxy Buds', ['2 Pro', 'FE', '2', 'Pro'], [0.9, 0.5, 0.6, 0.7])
  },
  Google: {
    'Pixel': generateCustomModels([
      { name: 'Pixel 10 Pro XL', year: 2025, tier: 1.0 },
      { name: 'Pixel 10 Pro', year: 2025, tier: 0.95 },
      { name: 'Pixel 10', year: 2025, tier: 0.9 },
      { name: 'Pixel 10a', year: 2025, tier: 0.8 },
      { name: 'Pixel 9 Pro XL', year: 2024, tier: 0.95 },
      { name: 'Pixel 9 Pro', year: 2024, tier: 0.9 },
      { name: 'Pixel 9', year: 2024, tier: 0.85 },
      { name: 'Pixel 9a', year: 2024, tier: 0.75 },
      { name: 'Pixel 8 Pro', year: 2023, tier: 0.85 },
      { name: 'Pixel 8', year: 2023, tier: 0.8 },
      { name: 'Pixel 8a', year: 2023, tier: 0.7 },
      { name: 'Pixel 7 Pro', year: 2022, tier: 0.75 },
      { name: 'Pixel 7', year: 2022, tier: 0.7 },
      { name: 'Pixel 7a', year: 2022, tier: 0.6 },
      { name: 'Pixel 6 Pro', year: 2021, tier: 0.65 },
      { name: 'Pixel 6', year: 2021, tier: 0.6 },
      { name: 'Pixel 6a', year: 2021, tier: 0.5 }
    ]),
    Tablet: generateModels('Pixel', ['Tablet', 'Slate'], [0.8, 0.5]),
    Laptop: generateModels('Google', ['Pixelbook Go', 'Pixelbook'], [0.8, 0.6]),
    Watch: generateModels('Pixel Watch', ['2', '1'], [0.9, 0.7]),
    Earbuds: generateModels('Pixel Buds', ['Pro', 'A-Series'], [0.9, 0.5])
  },
  Microsoft: {
    'Surface Tablet': generateCustomModels([
      { name: 'Surface Pro 9', year: 2024, tier: 1.0 },
      { name: 'Surface Pro 8', year: 2024, tier: 0.8 },
      { name: 'Surface Go 3', year: 2024, tier: 0.5 }
    ]),
    'Surface Laptop': generateCustomModels([
      { name: 'Surface Laptop 5', year: 2024, tier: 0.8 },
      { name: 'Surface Laptop Studio 2', year: 2024, tier: 1.0 },
      { name: 'Surface Laptop Go 3', year: 2024, tier: 0.6 }
    ])
  },
  Oppo: {
    'Find': generateCustomModels([
      { name: 'Oppo Find X7 Pro', year: 2024, tier: 1.0 },
      { name: 'Oppo Find X6 Pro', year: 2024, tier: 0.9 },
      { name: 'Oppo Find X5 Pro', year: 2024, tier: 0.8 }
    ]),
    'Reno': generateCustomModels([
      { name: 'Oppo Reno 11', year: 2024, tier: 0.7 },
      { name: 'Oppo Reno 10', year: 2024, tier: 0.6 },
      { name: 'Oppo Reno 9', year: 2024, tier: 0.5 },
      { name: 'Oppo Reno 8', year: 2024, tier: 0.4 }
    ])
  },
  OnePlus: {
    OnePlus: generateCustomModels([
      { name: 'OnePlus 12', year: 2024, tier: 0.9 },
      { name: 'OnePlus 11', year: 2024, tier: 0.8 },
      { name: 'OnePlus 11R', year: 2024, tier: 0.7 },
      { name: 'OnePlus Nord 3', year: 2024, tier: 0.6 },
      { name: 'OnePlus Nord CE 3', year: 2024, tier: 0.5 }
    ])
  },
  Asus: {
    Asus: generateModels('ROG Phone', ['8 Pro', '8', '7 Ultimate', '7', '6 Pro', '6'], [1.0, 0.9, 0.8, 0.7, 0.6, 0.5])
  },
  Motorola: {
    'Moto': generateCustomModels([
      { name: 'Edge 40 Pro', year: 2024, tier: 0.9 },
      { name: 'Edge 40', year: 2024, tier: 0.8 },
      { name: 'G84', year: 2024, tier: 0.6 },
      { name: 'G73', year: 2024, tier: 0.5 },
      { name: 'G54', year: 2024, tier: 0.4 }
    ])
  },
  Huawei: {
    'P Series': generateCustomModels([
      { name: 'P60 Pro', year: 2024, tier: 0.9 },
      { name: 'P60', year: 2024, tier: 0.8 },
      { name: 'P50 Pro', year: 2024, tier: 0.7 }
    ]),
    'Mate Series': generateCustomModels([
      { name: 'Mate 60 Pro', year: 2024, tier: 1.0 },
      { name: 'Mate 50 Pro', year: 2024, tier: 0.8 }
    ])
  },
  Dell: {
    Laptop: generateCustomModels([
      { name: 'XPS 13', year: 2024, tier: 0.9 },
      { name: 'Inspiron 15', year: 2024, tier: 0.6 },
      { name: 'Inspiron 14', year: 2024, tier: 0.5 },
      { name: 'XPS 15', year: 2024, tier: 1.0 }
    ]),
    Desktop: generateModels('Dell', ['Alienware Aurora R16', 'XPS Desktop', 'Inspiron Desktop'], [1.0, 0.7, 0.4]),
    Monitor: generateModels('Dell', ['Alienware 34 Curved OLED', 'UltraSharp 32 4K', 'S Series 27'], [1.0, 0.8, 0.4])
  },
  HP: {
    Laptop: generateCustomModels([
      { name: 'Spectre x360', year: 2024, tier: 1.0 },
      { name: 'Envy 15', year: 2024, tier: 0.8 },
      { name: 'Pavilion 15', year: 2024, tier: 0.6 },
      { name: 'Pavilion 14', year: 2024, tier: 0.5 }
    ])
  },
  Lenovo: {
    'ThinkPad': generateCustomModels([
      { name: 'X1 Carbon Gen 11', year: 2024, tier: 1.0 },
      { name: 'X1 Yoga', year: 2024, tier: 0.9 },
      { name: 'T14', year: 2024, tier: 0.8 },
      { name: 'T16', year: 2024, tier: 0.8 }
    ]),
    'IdeaPad': generateCustomModels([
      { name: 'IdeaPad Slim 5', year: 2024, tier: 0.7 },
      { name: 'IdeaPad 3', year: 2024, tier: 0.5 },
      { name: 'IdeaPad Gaming 3', year: 2024, tier: 0.7 }
    ]),
    'Lenovo Tablet': generateCustomModels([
      { name: 'Tab P12', year: 2024, tier: 0.8 },
      { name: 'Tab P11', year: 2024, tier: 0.6 },
      { name: 'Tab M10', year: 2024, tier: 0.4 }
    ])
  },
  Asus: {
    Phone: generateCustomModels([
      { name: 'ZenBook 14', year: 2024, tier: 0.8 },
      { name: 'VivoBook 15', year: 2024, tier: 0.5 },
      { name: 'ROG Zephyrus', year: 2024, tier: 1.0 },
      { name: 'TUF Gaming', year: 2024, tier: 0.7 }
    ])
  },
  Acer: {
    Acer: generateCustomModels([
      { name: 'Swift 3', year: 2024, tier: 0.8 },
      { name: 'Acer Swift Go 14 AI', year: 2024, tier: 0.9 },
      { name: 'Acer Aspire Go 15', year: 2024, tier: 0.7 },
      { name: 'Acer Swift Go 14', year: 2024, tier: 0.8 },
      { name: 'Acer Swift Go 16', year: 2024, tier: 0.85 },
      { name: 'Aspire 5', year: 2024, tier: 0.6 },
      { name: 'Nitro 5', year: 2024, tier: 0.75 },
      { name: 'Predator Helios', year: 2024, tier: 1.0 }
    ])
  }
};

let seed = 42;
function randomFloat() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function getBounds(deviceType, repairName, brandName) {
  let min = 150;
  let max = 300;
  
  if (deviceType === 'Phone') {
    if (repairName === 'Screen Repair' || repairName === 'OLED Replacement' || repairName === 'LCD Replacement') { min = 250; max = 700; }
    else if (repairName === 'Battery Replacement') { min = 120; max = 300; }
    else if (repairName === 'Charging Port Repair' || repairName === 'Charging Port Replacement') { min = 150; max = 350; }
    else if (repairName === 'Camera Repair' || repairName === 'Front Camera Repair' || repairName === 'Rear Camera Replacement' || repairName === 'Front Camera Replacement') { min = 180; max = 450; }
    else if (repairName === 'Camera Glass Broken') { min = 100; max = 150; }
    else if (repairName === 'Back Glass Repair' || repairName === 'Back Glass Replacement') { min = 180; max = 500; }
    else if (repairName === 'Water Damage Repair' || repairName === 'Water / Liquid Damage Repair') { min = 250; max = 700; }
    else if (repairName === 'Motherboard Repair' || repairName === 'Motherboard / Logicboard Repair') { min = 400; max = 1000; }
    else if (repairName === 'Not Turning On') { min = 150; max = 300; }
    else if (repairName === 'Power / Volume Button') { min = 100; max = 200; }
    else if (repairName === 'Microphone Replacement' || repairName === 'Speaker Repair') { min = 100; max = 200; }
    else if (repairName.includes('Software')) { min = 120; max = 150; }
    else { min = 100; max = 250; }
  } else if (deviceType === 'Tablet') {
    if (repairName === 'Screen Repair' || repairName === 'Digitizer Replacement' || repairName === 'Front Glass Repair' || repairName === 'Main Lcd Repair') { min = 250; max = 650; }
    else if (repairName === 'Battery Replacement') { min = 150; max = 300; }
    else if (repairName === 'Charging Port Repair' || repairName === 'Charging Port Replacement') { min = 150; max = 300; }
    else if (repairName === 'Motherboard Repair' || repairName === 'Motherboard / Logicboard Repair') { min = 350; max = 900; }
    else if (repairName === 'Not Turning On') { min = 150; max = 400; }
    else if (repairName === 'Water Damage Repair' || repairName === 'Water / Liquid Damage Repair') { min = 250; max = 600; }
    else if (repairName.includes('Camera')) { min = 150; max = 300; }
    else if (repairName === 'Speaker Repair') { min = 120; max = 250; }
    else if (repairName.includes('Software')) { min = 120; max = 150; }
    else { min = 150; max = 300; }
  } else if (deviceType === 'Laptop') {
    if (repairName === 'Battery Replacement') {
      if (['HP', 'Dell', 'Lenovo'].includes(brandName)) { min = 140; max = 200; }
      else if (brandName === 'Apple') { min = 180; max = 350; }
      else { min = 150; max = 300; }
    }
    else if (repairName === 'Screen Replacement' || repairName === 'Screen Repair & Replacement') { min = 250; max = 900; }
    else if (repairName === 'Keyboard Replacement') { min = 150; max = 350; }
    else if (repairName === 'SSD Upgrade') { min = 180; max = 350; }
    else if (repairName === 'RAM Upgrade') { min = 150; max = 300; }
    else if (repairName.includes('Software') || repairName.includes('Windows') || repairName.includes('macOS') || repairName.includes('OS Installation')) { min = 120; max = 150; }
    else if (repairName === 'Virus Removal') { min = 120; max = 180; }
    else if (repairName === 'Motherboard Repair' || repairName === 'Motherboard / Logicboard Repair') { min = 450; max = 1200; }
    else if (repairName === 'Water / Liquid Damage Repair' || repairName === 'Liquid Damage Repair') { min = 350; max = 900; }
    else if (repairName === 'Trackpad Not Working') { min = 150; max = 300; }
    else if (repairName === 'Microphone Replacement' || repairName === 'Speaker Repair') { min = 120; max = 250; }
    else if (repairName === 'Not Turning On') { min = 200; max = 500; }
    else if (repairName === 'Charging Port Replacement' || repairName === 'Charging Port Repair') { min = 150; max = 350; }
    else { min = 150; max = 400; }
  } else {
    if (repairName.includes('Motherboard') || repairName.includes('Panel')) { min = 250; max = 700; }
    else if (repairName.includes('Battery')) { min = 100; max = 200; }
    else if (repairName.includes('Software')) { min = 120; max = 150; }
    else { min = 150; max = 350; }
  }
  
  return { min, max };
}

function calculatePrice(deviceType, repairName, brandName, modelTier) {
  if (repairName === 'Free Diagnostic') return 'Free';
  const { min, max } = getBounds(deviceType, repairName, brandName);
  
  const bScore = brandHierarchy[brandName] || 0.5;
  const combinedScore = (bScore * 0.4) + (modelTier * 0.6);
  
  let price = min + (combinedScore * (max - min));
  
  let jitter = (randomFloat() * 10) - 5; 
  price += jitter;
  
  price = Math.max(min, Math.min(max, price));
  price = Math.round(price);
  
  let snapped = Math.round((price + 1) / 10) * 10 - 1;
  if (snapped >= min && snapped <= max) {
    price = snapped;
  }
  
  return `A$${price}`;
}

const database = {};

const brandFileMapping = {
  Apple: {
    iPhone: 'iPhone_Master_Updated_Plus20_With_Spacing.txt',
    iPad: 'iPad_Repairs_Prices_Plus20_With_Spacing.txt',
    MacBook: 'MackBook_Plus20_With_Spacing.txt',
    'Apple Watch': 'Apple_Watch_Repairs_Plus20_With_Spacing.txt'
  },
  Samsung: {
    'Galaxy S Series': 'Samsung_Galaxy_S_Series_Plus20_With_Spacing.txt',
    'Galaxy A Series': 'samsung galaxy a series.txt'
  },
  Google: {
    Pixel: 'goglePixel_Plus20_With_Spacing.txt'
  },
  Microsoft: {
    'Surface Tablet': 'Microsoft_Repairs_Plus20_With_Spacing.txt',
    'Surface Laptop': 'Microsoft_Repairs_Plus20_With_Spacing.txt'
  },
  Oppo: {
    Find: 'Oppo_Find_Repair_Plus20_With_Spacing.txt',
    Reno: 'Oppo_Find_Repair_Plus20_With_Spacing.txt'
  },
  OnePlus: {
    OnePlus: 'OnePlus_repairs_Plus20_With_Spacing.txt'
  },
  Motorola: {
    Moto: 'Motorola_repairs_Plus20_With_Spacing.txt'
  },
  Huawei: {
    'P Series': 'Huawei_repairs_Plus20_With_Spacing.txt',
    'Mate Series': 'Huawei_repairs_Plus20_With_Spacing.txt'
  },
  Dell: {
    Laptop: 'Dell_Repairs_Plus20_With_Spacing.txt'
  },
  HP: {
    Laptop: 'HP_Laptop_Repair_Plus20_With_Spacing.txt'
  },
  Lenovo: {
    ThinkPad: 'Lenovo__Repair_Plus20_With_Spacing.txt',
    IdeaPad: 'Lenovo__Repair_Plus20_With_Spacing.txt',
    'Lenovo Tablet': 'Lenovo__Repair_Plus20_With_Spacing.txt'
  },
  Asus: {
    Asus: 'Asus_Repair_Plus20_With_Spacing.txt'
  },
  Acer: {
    Acer: 'Acer_Repairs_Plus20_With_Spacing.txt'
  }
};

const getCleanName = (name, brand) => {
  let clean = name.toLowerCase().replace(/[.\"-]/g, '').replace(/\s+/g, ' ').trim();
  if (brand) {
    const brandLower = brand.toLowerCase();
    clean = clean.replace(new RegExp('^' + brandLower), '').trim();
  }
  clean = clean.replace(/^repairs for/i, '').trim();
  clean = clean.replace(/laptop repair/i, '').trim();
  clean = clean.replace(/repairs/i, '').trim();
  clean = clean.replace(/repair/i, '').trim();
  return clean;
};

const normalizeLineForMatching = (cleanLine) => {
  if (cleanLine === 'piel 6') return 'pixel 6';
  if (cleanLine === 'macbook air 13 (m1)') return 'macbook air 13" (m1)';
  if (cleanLine === 'macbook air 13') return 'macbook air 13"';
  return cleanLine;
};

const isDurationLine = (line) => {
  const l = line.toLowerCase();
  if (l.includes('gaming')) return false;
  return l.includes('hour') || (l.includes('min') && !l.includes('mini')) || l.includes('day');
};

const parseGenericFile = (filePath, brand, dbModels) => {
  const repairsByModel = {};
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return repairsByModel;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let currentModelName = null;
  let dbModelIdx = 0;
  
  const knownRepairs = [
    'screen repair', 'screen repair & replacement', 'screen repair / replacement', 'battery replacement',
    'back glass replacement', 'charging port replacement', 'charging port repair', 'keyboard replacement',
    'trackpad not working', 'water / liquid damage repair', 'motherboard / logicboard repair',
    'not turning on', 'free diagnostic', 'microphone replacement', 'speaker repair',
    'software update / restore', 'no repair services available yet', 'diagnostic service',
    'ssd upgrade', 'ram upgrade', 'virus removal', 'liquid damage repair', 'data recovery',
    'touchpad repair', 'fan replacement', 'overheating fix', 'hinge repair', 'camera repair',
    'power supply replacement', 'screen panel replacement', 'power board repair',
    'front glass repair', 'main lcd repair', 'front camera replacement', 'rear camera replacement',
    'camera glass broken', 'power / volume button'
  ];
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const normLine = line.toLowerCase().replace(/[.\']/g, '').trim();
    
    const isHeader = !knownRepairs.includes(normLine) && 
                     !line.startsWith('$') && 
                     !isDurationLine(line) &&
                     line !== 'View details' &&
                     line !== 'From' &&
                     normLine !== 'common issues' &&
                     !normLine.includes('repairs.') &&
                     !normLine.includes('laptop repairs');
                     
    if (isHeader) {
      const cleanLine = getCleanName(line, brand);
      const cleanLineNorm = normalizeLineForMatching(cleanLine);
      
      let foundMatchIdx = -1;
      for (let k = dbModelIdx; k < dbModels.length; k++) {
        const cleanDb = getCleanName(dbModels[k].name, brand);
        const cleanDbNorm = cleanDb.replace(/\"/g, '');
        if (cleanDbNorm === cleanLineNorm || cleanDb === cleanLineNorm || cleanDbNorm === cleanLine || cleanDb.replace(/\"/g, '') === cleanLine) {
          if (cleanLineNorm === 'macbook pro 13') {
            const lineHasLowercaseB = line.includes('Macbook');
            const dbHasLowercaseB = dbModels[k].name.includes('Macbook');
            if (lineHasLowercaseB !== dbHasLowercaseB) {
              continue;
            }
          }
          foundMatchIdx = k;
          break;
        }
      }
      
      if (foundMatchIdx !== -1) {
        currentModelName = dbModels[foundMatchIdx].name;
        dbModelIdx = foundMatchIdx + 1;
        repairsByModel[currentModelName] = [];
      } else {
        for (let k = 0; k < dbModels.length; k++) {
          const cleanDb = getCleanName(dbModels[k].name, brand);
          const cleanDbNorm = cleanDb.replace(/\"/g, '');
          if (cleanDbNorm === cleanLineNorm || cleanDb === cleanLineNorm || cleanDbNorm === cleanLine || cleanDb.replace(/\"/g, '') === cleanLine) {
            if (cleanLineNorm === 'macbook pro 13') {
              const lineHasLowercaseB = line.includes('Macbook');
              const dbHasLowercaseB = dbModels[k].name.includes('Macbook');
              if (lineHasLowercaseB !== dbHasLowercaseB) {
                continue;
              }
            }
            foundMatchIdx = k;
            break;
          }
        }
        if (foundMatchIdx !== -1) {
          currentModelName = dbModels[foundMatchIdx].name;
          repairsByModel[currentModelName] = [];
        } else {
          currentModelName = null;
        }
      }
      continue;
    }
    
    if (!currentModelName) continue;
    
    if (normLine.includes('no repair services available yet') || normLine.includes('no repair service available')) {
      continue;
    }
    
    if (line && !line.startsWith('$') && !isDurationLine(line) && line !== 'View details' && line !== 'From') {
      let price = null;
      let duration = '1 hour';
      let priceIdx = -1;
      
      for (let k = 1; k <= 5; k++) {
        if (idx + k >= lines.length) break;
        const nextLine = lines[idx + k];
        const nextNorm = nextLine.toLowerCase().replace(/[.\']/g, '').trim();
        
        const isNextHeader = !knownRepairs.includes(nextNorm) && 
                             !nextLine.startsWith('$') && 
                             !isDurationLine(nextLine) &&
                             nextLine !== 'View details' &&
                             nextLine !== 'From' &&
                             nextNorm !== 'common issues' &&
                             !nextNorm.includes('repairs.') &&
                             !nextNorm.includes('laptop repairs');
        if (isNextHeader) break;
        
        if (nextLine.startsWith('$')) {
          price = nextLine;
          priceIdx = idx + k;
          break;
        }
        if (isDurationLine(nextLine)) {
          duration = nextLine.replace('12mo', '').trim();
        }
      }
      
      if (price) {
        const priceVal = parseFloat(price.replace('$', ''));
        const priceStr = priceVal === 0 ? 'Free' : `A$${Math.floor(priceVal)}`;
        const isScreen = line.toLowerCase().includes('screen') || line.toLowerCase().includes('display') || line.toLowerCase().includes('lcd') || line.toLowerCase().includes('oled');
        
        repairsByModel[currentModelName].push({
          name: line,
          price: priceStr,
          duration: duration,
          warranty: '12 mo warranty',
          popular: isScreen
        });
        
        idx = priceIdx;
      }
    }
  }
  
  return repairsByModel;
};

const iphoneRepairsParsed = {};
const matchedIPhones = new Set();

const parseIPhoneFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  const dbModels = modelsDB.Apple.Phone;
  dbModels.forEach(modelObj => {
    iphoneRepairsParsed[modelObj.name] = [];
  });
  
  let currentModel = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    const normLine = line.replace(/^Repairs for\s+/i, '').trim();
    const matchedModel = dbModels.find(mObj => mObj.name.toLowerCase() === normLine.toLowerCase());
    
    if (matchedModel) {
      currentModel = matchedModel.name;
      matchedIPhones.add(currentModel);
      i++;
      continue;
    }
    
    if (currentModel) {
      if (line === 'No repair services available yet.') {
        i++;
        continue;
      }
      
      if (line === 'Select Part Quality') {
        let repairName = 'Screen Repair';
        let prevLines = [];
        let backIdx = i - 1;
        
        while (backIdx >= 0) {
          const prevLine = lines[backIdx];
          if (dbModels.some(mObj => prevLine.replace(/^Repairs for\s+/i, '').trim().toLowerCase() === mObj.name.toLowerCase())) {
            break;
          }
          if (prevLine === 'Select This Quality') {
            break;
          }
          prevLines.unshift(prevLine);
          backIdx--;
        }
        
        const possibleRepairHeaders = ['Back Glass Replacement', 'Back Glass resh planed', 'Back Glass reshpland', 'Back glass reshplament', 'Back glass', 'Screen Repair', 'Screen repairs'];
        const foundHeader = prevLines.find(pl => possibleRepairHeaders.some(h => pl.toLowerCase().includes(h.toLowerCase())));
        if (foundHeader) {
          if (foundHeader.toLowerCase().includes('back glass') || foundHeader.toLowerCase().includes('back grall') || foundHeader.toLowerCase().includes('back cover') || foundHeader.toLowerCase().includes('backglas') || foundHeader.toLowerCase().includes('back cover')) {
            repairName = 'Back Glass Replacement';
          } else {
            repairName = 'Screen Repair';
          }
        }
        
        i++;
        
        while (i < lines.length && (lines[i].includes('Affects fit') || lines[i] === 'Warranty')) {
          i++;
        }
        
        let options = [];
        let currentOptionLines = [];
        
        const parseAndAddOption = () => {
          let name = '';
          let price = '';
          let description = '';
          let recommended = false;
          
          const cleanOLines = currentOptionLines.filter(l => l !== 'Select This Quality' && l !== 'Warranty' && !l.includes('Affects fit'));
          
          cleanOLines.forEach(l => {
            if (l.startsWith('$')) {
              price = l;
            } else if (l.length > 55) {
              description = l;
            } else if (l.toUpperCase() === 'RECOMMENDED') {
              recommended = true;
            } else if (l.length > 0) {
              name = l;
            }
          });
          
          if (name.toUpperCase().includes('RECOMMENDED')) {
            recommended = true;
            name = name.replace(/RECOMMENDED/i, '').trim();
          }
          
          if (name) {
            let id = 'incell';
            if (name.toLowerCase().includes('genuine')) {
              id = 'genuine';
            } else if (name.toLowerCase().includes('soft oled') || name.toLowerCase().includes('oled')) {
              id = 'soft_oled';
            } else if (name.toLowerCase().includes('premium')) {
              id = 'premium_glass';
            } else if (name.toLowerCase().includes('standard')) {
              id = 'standard_glass';
            }
            
            options.push({
              id,
              name,
              price: price ? `A$${Math.floor(parseFloat(price.replace('$', '')))}` : 'A$0',
              description,
              recommended
            });
          }
          currentOptionLines = [];
        };

        while (i < lines.length) {
          const oLine = lines[i];
          const normOLine = oLine.replace(/^Repairs for\s+/i, '').trim();
          if (dbModels.some(mObj => mObj.name.toLowerCase() === normOLine.toLowerCase())) {
            break;
          }
          if (oLine === 'Select Part Quality') {
            break;
          }
          
          const possibleHeaders = ['Back Glass Replacement', 'Back Glass resh planed', 'Back Glass reshpland', 'Back glass reshplament', 'Back glass', 'Screen Repair', 'Screen repairs', 'Battery Replacement', 'Charging Port Replacement', 'Front Camera Replacement', 'Rear Camera Replacement', 'Camera Glass Broken', 'Power / Volume Button', 'Microphone Replacement', 'Speaker Repair', 'Water / Liquid Damage Repair', 'Motherboard / Logicboard Repair', 'Not Turning On', 'Software Update / Restore', 'Free Diagnostic'];
          if (possibleHeaders.some(h => oLine.toLowerCase() === h.toLowerCase())) {
            break;
          }
          
          currentOptionLines.push(oLine);
          
          if (oLine === 'Select This Quality') {
            parseAndAddOption();
          }
          i++;
        }
        
        if (currentOptionLines.length > 0) {
          parseAndAddOption();
        }
        
        let existingRepair = iphoneRepairsParsed[currentModel].find(r => r.name === repairName);
        if (!existingRepair) {
          existingRepair = {
            name: repairName,
            price: options[0] ? options[0].price : 'A$0',
            duration: repairName === 'Screen Repair' ? '1 hour' : '2 hours',
            warranty: '12 mo warranty',
            popular: repairName === 'Screen Repair',
            partOption: true,
            options: options
          };
          iphoneRepairsParsed[currentModel].push(existingRepair);
        } else {
          existingRepair.options = options;
          existingRepair.partOption = true;
          if (options[0]) {
            existingRepair.price = options[0].price;
          }
        }
        continue;
      }
      
      const durationLine = lines[i + 1];
      if (durationLine && (durationLine.includes('hour') || durationLine.includes('min') || durationLine.includes('day'))) {
        const duration = durationLine.replace('12mo', '').trim();
        let priceLine = null;
        let nextIdx = i + 2;
        if (lines[nextIdx] === 'View details') {
          nextIdx++;
        }
        if (lines[nextIdx] === 'From') {
          nextIdx++;
        }
        priceLine = lines[nextIdx];
        if (priceLine && priceLine.startsWith('$')) {
          const priceVal = parseFloat(priceLine.replace('$', ''));
          const priceStr = priceVal === 0 ? 'Free' : `A$${Math.floor(priceVal)}`;
          
          const repairName = line;
          const normName = repairName.toLowerCase();
          let canonicalName = repairName;
          if (normName.includes('screen') || normName.includes('display')) {
            canonicalName = 'Screen Repair';
          } else if (normName.includes('back glass') || normName.includes('rear glass') || normName.includes('back cover')) {
            canonicalName = 'Back Glass Replacement';
          }
          
          let existingRepair = iphoneRepairsParsed[currentModel].find(r => r.name === canonicalName);
          if (!existingRepair) {
            iphoneRepairsParsed[currentModel].push({
              name: canonicalName,
              price: priceStr,
              duration: duration,
              warranty: '12 mo warranty',
              popular: canonicalName === 'Screen Repair'
            });
          }
          
          i = nextIdx + 1;
          continue;
        }
      }
    }
    i++;
  }
};

// Pre-parse iPhone file
const iphoneTxtPath = path.join(__dirname, '../../iPhone_Master_Updated_Plus20_With_Spacing.txt');
parseIPhoneFile(iphoneTxtPath);

for (const [brandName, brandData] of Object.entries(brandDeviceMapping)) {
  for (const displayDeviceType of brandData) {
    const genericType = getGenericType(displayDeviceType);
    const fileName = brandFileMapping[brandName]?.[displayDeviceType];
    
    if (!fileName) {
      continue;
    }
    
    if (!database[brandName]) {
      database[brandName] = {};
    }
    
    database[brandName][displayDeviceType] = {
      models: [],
      repairs: {}
    };
    
    const dbModels = modelsDB[brandName][displayDeviceType] || modelsDB[brandName][genericType];
    if (!dbModels) continue;
    
    let parsedRepairsForType = {};
    
    if (brandName === 'Apple' && displayDeviceType === 'iPhone') {
      parsedRepairsForType = iphoneRepairsParsed;
    } else {
      const filePath = path.join(__dirname, `../../${fileName}`);
      parsedRepairsForType = parseGenericFile(filePath, brandName, dbModels);
    }
    
    const matchedModelsList = dbModels.filter(m => {
      if (brandName === 'Apple' && displayDeviceType === 'iPhone') {
        return matchedIPhones.has(m.name);
      }
      return parsedRepairsForType[m.name] !== undefined;
    });
    
    for (const model of matchedModelsList) {
      database[brandName][displayDeviceType].models.push({
        name: model.name,
        year: model.year
      });
      
      const repairsForModel = parsedRepairsForType[model.name] || [];
      
      repairsForModel.sort((a, b) => {
        const aIsScreen = a.name.toLowerCase().includes('screen') || a.name.toLowerCase().includes('display');
        const bIsScreen = b.name.toLowerCase().includes('screen') || b.name.toLowerCase().includes('display');
        if (aIsScreen && !bIsScreen) return -1;
        if (!aIsScreen && bIsScreen) return 1;
        
        const aPrice = parseInt(a.price.replace('A$', '')) || 0;
        const bPrice = parseInt(b.price.replace('A$', '')) || 0;
        return bPrice - aPrice;
      });
      
      database[brandName][displayDeviceType].repairs[model.name] = repairsForModel;
    }
  }
}

const outPath = path.join(__dirname, 'catalog.json');
fs.writeFileSync(outPath, JSON.stringify(database, null, 2));

console.log(`Successfully generated dynamic catalog at: ${outPath}`);
