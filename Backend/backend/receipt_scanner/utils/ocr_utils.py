import cv2
import pytesseract
import re
from PIL import Image
import numpy as np
import os

# Set tesseract path if not in PATH
# Common paths for tesseract
possible_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'C:\Users\karki\anaconda3\Library\bin\tesseract.exe',  # conda path
    r'C:\Users\karki\miniconda3\Library\bin\tesseract.exe',
]

for path in possible_paths:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break


def preprocess_image(image_path):
    """
    Preprocess the image for better OCR results.
    - Convert to grayscale
    - Apply thresholding
    - Reduce noise
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to load image")

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply thresholding
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Optional: Morphological operations to clean up
    kernel = np.ones((1, 1), np.uint8)
    processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)

    return processed


def extract_text(image_path):
    """
    Extract text from the preprocessed image using pytesseract.
    """
    # Set tesseract path
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    processed_image = preprocess_image(image_path)

    # Convert to PIL Image for pytesseract
    pil_image = Image.fromarray(processed_image)

    # Extract text
    text = pytesseract.image_to_string(pil_image, config='--psm 6')

    return text


def parse_receipt_text(text):
    """
    Parse the extracted text to find items and total.
    Returns a dict with 'items' list and 'total' float.
    """
    lines = text.split('\n')
    items = []
    total = None

    # Regex patterns
    # Item pattern: name followed by price (e.g., "Milk 120.00", "Milk $120.00", "Milk ₹120.00" or "Milk Rs 120.00")
    # Updated patterns to handle thousands separators (commas/spaces) and
    # currency symbols/abbreviations in various positions.
    # The numeric portion allows digits and commas, with an optional decimal part.
    # amount_regex matches numbers with optional thousands commas and decimal
    amount_regex = r"(\d[\d,]*(?:\.\d{2})?)"
    item_pattern = re.compile(rf'^(.+?)\s+(?:\$|₹|Rs\.?\s*)?{amount_regex}$')
    # Total pattern: look for total keywords then an amount. Currency may come
    # before or after, and we capture the amount portion only.
    total_pattern = re.compile(
        rf'(?:total|grand total|subtotal|amount due|balance)\s*:?\s*(?:\$|₹|Rs\.?\s*)?{amount_regex}',
        re.IGNORECASE,
    )

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for total first
        total_match = total_pattern.search(line)
        if total_match:
            try:
                raw_total = total_match.group(1).replace(",", "").replace(" ", "")
                total = float(raw_total)
            except ValueError:
                pass
            continue

        # Check for item
        item_match = item_pattern.match(line)
        if item_match:
            name = item_match.group(1).strip()
            # Skip if name is too short or looks like total
            if len(name) < 2 or re.search(r'total|subtotal|tax', name, re.IGNORECASE):
                continue
            try:
                # strip commas/spaces from extracted amount before conversion
                raw_amount = item_match.group(2).replace(",", "").replace(" ", "")
                price = float(raw_amount)
                items.append({"name": name, "price": price})
            except ValueError:
                pass

    # If no total found, sum the items
    if total is None and items:
        total = sum(item['price'] for item in items)

    # sanity check: if total looks smaller than any individual item, it may be a
    # mis-parse (e.g. commas were dropped).  In that case, fall back to sum.
    if total is not None and items:
        try:
            min_price = min(item['price'] for item in items)
            if total < min_price:
                total = sum(item['price'] for item in items)
        except ValueError:
            pass

    return {
        "items": items,
        "total": total
    }


def process_receipt(image_path):
    """
    Full pipeline: preprocess, extract text, parse data.
    """
    try:
        text = extract_text(image_path)
        parsed_data = parse_receipt_text(text)
        return text, parsed_data
    except Exception as e:
        raise ValueError(f"OCR processing failed: {str(e)}")