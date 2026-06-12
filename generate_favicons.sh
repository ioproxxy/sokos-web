#!/bin/bash

# Sokos Favicon Generator Wrapper
# This script makes it easy to generate favicons without worrying about Python paths

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logo image is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: No image file provided${NC}"
    echo ""
    echo "Usage:"
    echo "  ./generate_favicons.sh sokos-logo.png"
    echo ""
    echo "Example:"
    echo "  ./generate_favicons.sh sokos-logo.png"
    exit 1
fi

IMAGE_FILE=$1

# Check if image file exists
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Error: Image file not found: $IMAGE_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}🎨 Sokos Favicon Generator${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Use the virtual environment's Python
PYTHON_BIN="/var/www/sokos/.venv/bin/python"

# Check if Python exists
if [ ! -f "$PYTHON_BIN" ]; then
    echo -e "${RED}❌ Error: Python virtual environment not found${NC}"
    echo "Run: pip3 install pillow"
    exit 1
fi

echo -e "${GREEN}✅ Using Python: $PYTHON_BIN${NC}"
echo ""

# Run the favicon generator
"$PYTHON_BIN" /var/www/sokos/generate_favicons.py "$IMAGE_FILE"

echo ""
echo -e "${GREEN}✅ Favicon generation complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. cp *.png *.ico /var/www/sokos/public/"
echo "  2. chmod 644 /var/www/sokos/public/*.{png,ico}"
echo "  3. Test in browser: https://sokos.co.ke/"
