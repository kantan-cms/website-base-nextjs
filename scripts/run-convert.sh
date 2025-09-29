#!/bin/bash

# Kantan CMS Content Converter
# This script converts JSON data from the CMS into markdown files
# It uses the convert-content.ts TypeScript file to perform the conversion

# Load environment variables from .env
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default values if environment variables are not set
STORAGE_PATH=${KANTAN_STORAGE_PATH:-"./tmp/"}
REQUIRED_COLLECTIONS=${KANTAN_REQUIRED_COLLECTIONS:-""}

# Remove trailing slash if present
STORAGE_PATH=${STORAGE_PATH%/}

# Get the first collection from the list (usually Blog)
FIRST_COLLECTION=$(echo $REQUIRED_COLLECTIONS | cut -d ',' -f 1)

echo "====================================================="
echo "🔄 Starting content conversion process"
echo "====================================================="
echo "Using storage path: $STORAGE_PATH"
echo "Required collections: $REQUIRED_COLLECTIONS"

# Check if the storage directory exists and contains the required data
if [ ! -d "$STORAGE_PATH" ]; then
    echo "❌ Error: $STORAGE_PATH directory not found"
    echo "Please run get-from-cms.sh first to fetch data from the CMS"
    exit 1
fi

if [ ! -f "$STORAGE_PATH/$FIRST_COLLECTION.json" ]; then
    echo "❌ Error: $FIRST_COLLECTION.json not found in $STORAGE_PATH directory"
    echo "Please run get-from-cms.sh first to fetch data from the CMS"
    exit 1
fi

echo "Converting JSON data to markdown files..."
echo "This will create/update files in the content/blog directory..."

# Run the conversion script
npx tsx scripts/convert-content.ts

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ Content conversion completed successfully"
    
    # Count the number of markdown files created
    file_count=$(find ./content/blog -name "*.md" | wc -l)
    echo "Created/updated $file_count markdown files in content/blog directory"
else
    echo "❌ Error occurred during content conversion"
    exit 1
fi

echo "====================================================="
