const { prisma } = require('../config/db');
const logger = require('../utils/logger');

// Maximum concurrent bookings allowed per time slot
const MAX_BOOKINGS_PER_SLOT = 1;

/**
 * Parses time string (HH:MM:SS or HH:MM) into minutes since midnight
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  if (timeStr instanceof Date) {
    const hours = timeStr.getUTCHours();
    const minutes = timeStr.getUTCMinutes();
    return hours * 60 + minutes;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Format minutes since midnight into 'hh:mm A' string
 */
const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${modifier}`;
};

/**
 * Retrieves available time slots on a specific date for the single store
 * @param {string} dateStr (format YYYY-MM-DD)
 */
const getAvailableSlots = async (dateStr) => {
  try {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }

    // 1. Fetch dynamic slot duration from general settings (default: 90)
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
      select: { bookingSlotDuration: true }
    });
    const slotDuration = settings?.bookingSlotDuration || 90;

    // 2. Check for Active Exceptions first
    const exception = await prisma.scheduleException.findFirst({
      where: {
        date: targetDate,
        active: true
      }
    });

    let openMin = 0;
    let closeMin = 0;
    let breakStartMin = 0;
    let breakEndMin = 0;
    let isClosed = false;

    if (exception) {
      logger.info(`Found schedule exception on ${dateStr}: ${exception.title} (${exception.type})`);
      if (exception.type === 'Closed') {
        isClosed = true;
      } else {
        openMin = parseTimeToMinutes(exception.customOpen);
        closeMin = parseTimeToMinutes(exception.customClose);
      }
    } else {
      // 3. Fetch standard store hours
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysOfWeek[targetDate.getDay()];

      const storeHour = await prisma.storeHour.findUnique({
        where: {
          dayName
        }
      });

      if (!storeHour || storeHour.isClosed) {
        isClosed = true;
      } else {
        openMin = parseTimeToMinutes(storeHour.openTime);
        closeMin = parseTimeToMinutes(storeHour.closeTime);
        breakStartMin = parseTimeToMinutes(storeHour.breakStart);
        breakEndMin = parseTimeToMinutes(storeHour.breakEnd);
      }
    }

    if (isClosed) {
      return [];
    }

    // 4. Generate candidate slots based on dynamic slotDuration
    const slots = [];
    let current = openMin;
    while (current + slotDuration <= closeMin) {
      const isDuringBreak = breakStartMin && breakEndMin && 
                            (current >= breakStartMin && current < breakEndMin);
      
      if (!isDuringBreak) {
        slots.push(formatMinutesToTime(current));
      }
      current += slotDuration;
    }

    // 5. Query existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        dateStr: targetDate,
        status: {
          notIn: ['Cancelled', 'Rejected']
        }
      },
      select: {
        timeSlot: true
      }
    });

    // Count bookings per slot
    const slotCounts = {};
    bookings.forEach(b => {
      slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
    });

    // 6. Filter out slots exceeding MAX_BOOKINGS_PER_SLOT
    const availableSlots = slots.filter(slot => {
      const count = slotCounts[slot] || 0;
      return count < MAX_BOOKINGS_PER_SLOT;
    });

    // 7. If target date is today, filter out past slots
    const now = new Date();
    const isToday = targetDate.toDateString() === now.toDateString();

    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return availableSlots.filter(slot => {
        const slotMinutes = parseTimeToMinutes(slot);
        return slotMinutes > currentMinutes;
      });
    }

    return availableSlots;

  } catch (err) {
    logger.error(`Error in getAvailableSlots for date=${dateStr}:`, err);
    throw err;
  }
};

module.exports = {
  getAvailableSlots,
  MAX_BOOKINGS_PER_SLOT
};
