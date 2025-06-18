export const BADGE_VARIANTS = {
  // Status variants
  active: {
    bg: 'bg-emerald-100 dark:bg-emerald-900',
    text: 'text-emerald-800 dark:text-emerald-100',
    border: 'border-emerald-200 dark:border-emerald-700',
    hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-800',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-800 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-700',
    hover: 'hover:bg-amber-200 dark:hover:bg-amber-800',
  },
  blocked: {
    bg: 'bg-rose-100 dark:bg-rose-900',
    text: 'text-rose-800 dark:text-rose-100',
    border: 'border-rose-200 dark:border-rose-700',
    hover: 'hover:bg-rose-200 dark:hover:bg-rose-800',
  },
  // Item type variants
  shop: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-700',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
  },
  used: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  },
  job: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border-purple-200 dark:border-purple-700',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-800',
  },
  // Item for variants
  sale: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-100',
    border: 'border-green-200 dark:border-green-700',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800',
  },
  rent: {
    bg: 'bg-indigo-100 dark:bg-indigo-900',
    text: 'text-indigo-800 dark:text-indigo-100',
    border: 'border-indigo-200 dark:border-indigo-700',
    hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800',
  },
  trade: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-100',
    border: 'border-yellow-200 dark:border-yellow-700',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800',
  },
  service: {
    bg: 'bg-pink-100 dark:bg-pink-900',
    text: 'text-pink-800 dark:text-pink-100',
    border: 'border-pink-200 dark:border-pink-700',
    hover: 'hover:bg-pink-200 dark:hover:bg-pink-800',
  },
  // Default/unknown variant
  unknown: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  },
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANTS;