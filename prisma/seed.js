const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');

const makeTime = (hour, minute) => {
  return new Date(`1970-01-01T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`);
};

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        active: true
      }
    });
    console.log('Created default admin: admin@gmail.com / admin123');
  } else {
    console.log('Admin already exists.');
  }

  // 2. Create Store Hours
  const days = [
    { name: 'Monday', open: [9, 0], close: [18, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Tuesday', open: [9, 0], close: [18, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Wednesday', open: [9, 0], close: [18, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Thursday', open: [9, 0], close: [18, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Friday', open: [9, 0], close: [18, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Saturday', open: [9, 0], close: [17, 0], bStart: [13, 0], bEnd: [14, 0], closed: false },
    { name: 'Sunday', open: [9, 0], close: [17, 0], bStart: [13, 0], bEnd: [14, 0], closed: true }
  ];

  for (const d of days) {
    const existingHour = await prisma.storeHour.findUnique({
      where: {
        dayName: d.name
      }
    });

    if (!existingHour) {
      await prisma.storeHour.create({
        data: {
          dayName: d.name,
          openTime: makeTime(d.open[0], d.open[1]),
          closeTime: makeTime(d.close[0], d.close[1]),
          breakStart: makeTime(d.bStart[0], d.bStart[1]),
          breakEnd: makeTime(d.bEnd[0], d.bEnd[1]),
          isClosed: d.closed
        }
      });
    }
  }
  console.log('Seeded weekly store hours');

  // 3. Create General Settings
  const settingsId = 1;
  const existingSettings = await prisma.settings.findUnique({
    where: { id: settingsId }
  });

  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        id: settingsId,
        storeName: 'MPC Repairs',
        storeEmail: 'support@irepairexperts.com.au',
        storePhone: '+61 1300 473 724',
        storeAddress: '168 Cavendish Road, Coorparoo QLD 4151',
        currency: 'AUD ($)',
        timezone: 'Australia/Brisbane',
        bookingSlotDuration: 90
      }
    });
    console.log('Seeded general settings');
  } else {
    console.log('Settings already exist.');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
