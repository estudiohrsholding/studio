import { Timestamp } from 'firebase/firestore';

/**
 * Calculates a new expiration date by parsing a duration string (e.g., "30 days", "1 year").
 * @param durationString The string representing the duration to add.
 * @returns A Firestore Timestamp object representing the future expiration date.
 * @throws Error if the duration string is invalid.
 */
export function calculateNewExpiration(durationString: string): Timestamp {
  const parts = durationString.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Invalid duration string format: "${durationString}"`);
  }

  const value = parseInt(parts[0], 10);
  const unit = parts[1].toLowerCase();

  if (isNaN(value)) {
    throw new Error(`Invalid number in duration string: "${durationString}"`);
  }

  const now = new Date();
  let futureDate = new Date(now);

  switch (unit) {
    case 'day':
    case 'days':
      futureDate.setDate(now.getDate() + value);
      break;
    case 'week':
    case 'weeks':
      futureDate.setDate(now.getDate() + value * 7);
      break;
    case 'month':
    case 'months':
      futureDate.setMonth(now.getMonth() + value);
      break;
    case 'year':
    case 'years':
      futureDate.setFullYear(now.getFullYear() + value);
      break;
    default:
      throw new Error(`Unsupported time unit in duration string: "${unit}"`);
  }

  return Timestamp.fromDate(futureDate);
}
