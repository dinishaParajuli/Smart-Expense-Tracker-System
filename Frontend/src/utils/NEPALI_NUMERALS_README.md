# Nepali Numerals Support

## Overview
This implementation adds support for Nepali numerals across the expense tracking application. Users can input numbers using Nepali digits (०, १, २, ३, ४, ५, ६, ७, ८, ९) or standard digits (0-9), and they will be automatically converted and displayed internally in English numerals.

## How It Works

### Nepali to English Conversion
- **Input**: Nepali numerals are accepted in input fields (BudgetEntry, BudgetPlanner, GoalsAndChallenges)
- **Processing**: `normalizeNepaliInput()` converts Nepali digits to English digits in real-time as user types
- **Storage**: Values are stored and processed using English numerals
- **Output**: All displays and calculations use standard English numerals

Nepali Numeral Mapping:
```
०ः0   १ः1   २ः2   ३ः3   ४ः4
५ः5   ६ः6   ७ः7   ८ः8   ९ः9
```

## Components Updated

### 1. BudgetEntryPage.jsx
- Amount input field accepts Nepali or English numerals
- Input type changed from `number` to `text` for flexibility
- Placeholder shows example: "e.g., 3500 or ३५००"
- Normalization happens on input change
- Values are converted using `parseNepaliNumber()` before saving

### 2. BudgetPlanner.jsx
- Budget amount input accepts Nepali or English numerals
- Input type changed from `number` to `text`
- Enhanced input handler normalizes Nepali input
- Amount is converted before being sent to API

### 3. GoalsAndChallenges.jsx
- Target amount input accepts Nepali or English numerals
- Input type changed from `number` to `text`
- Placeholder shows example: "150000 or १५०००"
- Value is normalized before API submission

## Utility Functions

Located in: `src/utils/nepaliNumberConverter.js`

### `nepaliToEnglish(input)`
Converts all Nepali numerals to English numerals in a string.
```javascript
nepaliToEnglish('३५००')  // Returns '3500'
nepaliToEnglish('२०००')  // Returns '2000'
```

### `englishToNepali(input)`
Converts all English numerals to Nepali numerals in a string.
```javascript
englishToNepali('3500')  // Returns '३५००'
englishToNepali('2000')  // Returns '२०००'
```

### `normalizeNepaliInput(value)`
Used in onChange handlers to convert Nepali input to English in real-time.
```javascript
// In input onChange handler
onChange={(e) => setAmount(normalizeNepaliInput(e.target.value))}
```

### `parseNepaliNumber(input)`
Parses a potentially mixed input (Nepali and English) as a number.
```javascript
parseNepaliNumber('३५००')   // Returns 3500
parseNepaliNumber('35००')   // Returns 3500 (mixed)
parseNepaliNumber('3500')   // Returns 3500
```

## Usage Examples

### User Input Flow
1. **User types**: ४५३५ (in Nepali numerals)
2. **Input field displays**: ४५३५ (as typed)
3. **Internally stored**: 4535 (converted to English)
4. **API receives**: 4535
5. **Display output**: 4535 (shown with NPR prefix)

### Mixed Input (Nepali + English)
- Users can mix numerals: २०००,  5000
- System normalizes to: 2000, 5000

## How to Use

### For Adding New Input Fields
1. Import the converter function in your component:
```javascript
import { normalizeNepaliInput, parseNepaliNumber } from '../utils/nepaliNumberConverter';
```

2. For the input onChange handler:
```javascript
<input
  type="text"  // Use text instead of number
  placeholder="Enter amount (e.g., 5000 or पाँच)"
  onChange={(e) => setAmount(normalizeNepaliInput(e.target.value))}
  value={amount}
/>
```

3. Before sending to API/saving:
```javascript
const normalizedValue = parseNepaliNumber(inputValue);
// Now use normalizedValue for API calls or calculations
```

## Testing

To test the implementation:
1. Go to BudgetEntry, BudgetPlanner, or GoalsAndChallenges page
2. Enter a value using Nepali numerals (e.g., १५००)
3. Verify the value is stored and displayed correctly
4. Check that calculations and API submissions work properly

## Limitations & Notes

- Decimal separators are not explicitly handled - focus is on integer display
- The system handles both pure Nepali and mixed Nepali-English input
- All internal processing uses English numerals for consistency and API compatibility
- HTML input type is changed from `number` to `text` to avoid browser validation issues with Nepali numerals
