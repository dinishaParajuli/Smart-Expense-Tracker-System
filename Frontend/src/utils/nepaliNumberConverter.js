/**
 * Utility functions to handle Nepali numerals conversion
 * Nepali numerals: ० १ २ ३ ४ ५ ६ ७ ८ ९
 * English/Standard numerals: 0 1 2 3 4 5 6 7 8 9
 */

// Mapping of Nepali numerals to English numerals
const nepaliToEnglishMap = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

// Reverse mapping for display (if needed)
const englishToNepaliMap = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

/**
 * Converts Nepali numerals to English numerals
 * @param {string|number} input - The string containing Nepali numerals
 * @returns {string} - String with English numerals
 */
export const nepaliToEnglish = (input) => {
  if (input === null || input === undefined || input === '') return '';
  
  const stringInput = String(input);
  return stringInput.split('').map(char => nepaliToEnglishMap[char] || char).join('');
};

/**
 * Converts English numerals to Nepali numerals
 * @param {string|number} input - The string containing English numerals
 * @returns {string} - String with Nepali numerals
 */
export const englishToNepali = (input) => {
  if (input === null || input === undefined || input === '') return '';
  
  const stringInput = String(input);
  return stringInput.split('').map(char => englishToNepaliMap[char] || char).join('');
};

/**
 * Normalizes input value by converting Nepali numerals to English
 * Used in onChange handlers for input fields
 * @param {string} value - The input value
 * @returns {string} - Normalized value with English numerals
 */
export const normalizeNepaliInput = (value) => {
  return nepaliToEnglish(value);
};

/**
 * Ensures a number value is stored and transmitted as English numerals
 * @param {any} value - The value to normalize
 * @returns {string} - Normalized string with English numerals
 */
export const ensureEnglishNumerals = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return nepaliToEnglish(String(value));
};

/**
 * Parse a potentially mixed input (Nepali and English) as a number
 * @param {string} input - The input string
 * @returns {number} - Parsed numeric value
 */
export const parseNepaliNumber = (input) => {
  const normalized = nepaliToEnglish(input);
  return parseFloat(normalized) || 0;
};
