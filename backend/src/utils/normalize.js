/**
 * Normalize company name:
 * - lowercase
 * - trim whitespace
 * - remove punctuation artifacts
 */
function normalizeCompany(name) {
  if (!name || typeof name !== 'string') return null;
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Display-friendly company name (title case)
 */
function displayCompany(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate and parse a numeric field (salary, bonus, stock)
 * Returns null if invalid
 */
function parseNumber(value, defaultValue = null) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

/**
 * Valid standardized levels
 */
const VALID_LEVELS = [
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8',
  'SDE1', 'SDE2', 'SDE3',
  'Senior', 'Staff', 'Principal', 'Distinguished', 'Fellow',
  'IC3', 'IC4', 'IC5', 'IC6',
  'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
  'M1', 'M2', 'M3',
  'Junior', 'Mid', 'Senior-II',
];

function isValidLevel(level) {
  if (!level || typeof level !== 'string') return false;
  // Accept any non-empty string for flexibility, but normalize known ones
  return level.trim().length > 0;
}

/**
 * Compute total compensation
 */
function computeTotal(base, bonus = 0, stock = 0) {
  return (base || 0) + (bonus || 0) + (stock || 0);
}

module.exports = {
  normalizeCompany,
  displayCompany,
  parseNumber,
  isValidLevel,
  computeTotal,
  VALID_LEVELS,
};
