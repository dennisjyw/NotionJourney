import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ItineraryItem } from './notion';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMapUrl(url: string): string {
  if (!url) return '';
  return url;
}

export function parseNotionDateTime(isoString: string): { date: string, time: string, dateTimeStr: string } {
  if (!isoString) return { date: '', time: '', dateTimeStr: '' };

  // Notion Date string format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sss+ZZ:ZZ
  // We want to extract YYYY-MM-DD and HH:mm regardless of the timezone offset
  const [datePart, timePart] = isoString.split('T');

  const date = datePart;
  let time = '';

  if (timePart) {
    // Extract HH:mm from HH:mm:ss.sss+ZZ:ZZ
    // Usually it's starts with HH:mm
    time = timePart.substring(0, 5);
  }

  return { date, time, dateTimeStr: time ? `${date} ${time}` : date };
}

export function formatTripDate(startDateStr: string, endDateStr: string): string {
  if (!startDateStr) return '';

  // Uses parseNotionDateTime to avoid UTC shifts
  const startObj = parseNotionDateTime(startDateStr);
  const endObj = endDateStr ? parseNotionDateTime(endDateStr) : null;

  const startYear = parseInt(startObj.date.split('-')[0]);
  const startMonth = parseInt(startObj.date.split('-')[1]);
  const startDay = parseInt(startObj.date.split('-')[2]);

  if (!endObj) {
    return `${startYear}/${startMonth}/${startDay}`;
  }

  const endYear = parseInt(endObj.date.split('-')[0]);
  const endMonth = parseInt(endObj.date.split('-')[1]);
  const endDay = parseInt(endObj.date.split('-')[2]);

  const isSameYear = startYear === endYear;

  const sStr = isSameYear
    ? `${startMonth}/${startDay}`
    : `${startYear}/${startMonth}/${startDay}`;

  const eStr = isSameYear
    ? `${endMonth}/${endDay}`
    : `${endYear}/${endMonth}/${endDay}`;

  return `${sStr} - ${eStr}`;
}


export interface GroupedItinerary {
  day: number;
  date: string;
  items: ItineraryItem[];
}

export function groupItineraryByDay(items: ItineraryItem[], tripStartDate: string): GroupedItinerary[] {
  const groups: { [key: string]: ItineraryItem[] } = {};

  // Use parseNotionDateTime for trip start to ensure we lock on the correct "Day 1" anchor
  const tripStartDateOnly = parseNotionDateTime(tripStartDate).date;
  const tripStart = new Date(tripStartDateOnly);
  // Treat this date as "Local Midnight" of Day 1
  // We want to calculate "Day X" based on date difference

  items.forEach(item => {
    // Correctly get the local date string "YYYY-MM-DD" ignoring timezone offset
    const dateKey = parseNotionDateTime(item.date).date;

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  const sortedDates = Object.keys(groups).sort();

  return sortedDates.map(dateStr => {
    // Calculate difference in Days between item date and trip start date
    // Convert both to timestamps (treating them as UTC midnights effectively to count days)
    const itemTime = new Date(dateStr).getTime();
    const tripStartTime = new Date(tripStartDateOnly).getTime();

    // One day in ms
    const oneDay = 1000 * 60 * 60 * 24;

    const diffTime = itemTime - tripStartTime;
    const dayNum = Math.round(diffTime / oneDay) + 1;

    return {
      day: dayNum > 0 ? dayNum : 1, // Fallback
      date: dateStr,
      items: groups[dateStr]
    };
  });
}
