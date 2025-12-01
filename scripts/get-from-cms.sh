#!/bin/bash

# Kantan CMS Data Fetcher
# This script fetches data from the Kantan CMS API and saves it to JSON files
# It uses the get_data_from_cms.ts TypeScript file to perform the API calls

# Load environment variables from .env
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default values if environment variables are not set
STORAGE_PATH=${KANTAN_STORAGE_PATH:-"./tmp/"}

# Remove trailing slash if present
STORAGE_PATH=${STORAGE_PATH%/}

echo "====================================================="
echo "📥 Starting Kantan CMS data fetching process"
echo "====================================================="
echo "Using storage path: $STORAGE_PATH"

# Check if the storage directory exists, create it if not
if [ ! -d "$STORAGE_PATH" ]; then
    echo "Creating $STORAGE_PATH directory for storing fetched data..."
    mkdir -p "$STORAGE_PATH"
fi

echo "Fetching data from Kantan CMS API..."
echo "This may take a moment depending on the amount of data..."

# Run the data fetching script
vite-node --project scripts/tsconfig.json scripts/get_data_from_cms.ts

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ Data fetching completed successfully"
    echo "Data has been saved to the $STORAGE_PATH directory"
else
    echo "❌ Error occurred during data fetching"
    exit 1
fi

echo "====================================================="
