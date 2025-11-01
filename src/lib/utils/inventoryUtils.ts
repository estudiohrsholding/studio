// src/lib/utils/inventoryUtils.ts

/**
 * Maps an item category string to a corresponding Tailwind CSS background color class.
 * This provides a consistent color-coding system for categories across the UI.
 *
 * @param category - The category string of the inventory item (case-insensitive).
 * @returns A string representing the Tailwind CSS background color class.
 */
export function getCategoryColorClass(category: string): string {
  if (!category) {
    return 'bg-gray-500'; // Default color for uncategorized items
  }

  const lowerCaseCategory = category.toLowerCase();

  switch (lowerCaseCategory) {
    case 'sativa':
      return 'bg-purple-600';
    case 'indica':
      return 'bg-red-600';
    case 'híbrido':
      return 'bg-blue-600';
    case 'live resin':
      return 'bg-orange-600';
    case 'hash':
        return 'bg-zinc-600';
    default:
      return 'bg-gray-500'; // A neutral default color
  }
}
