#!/bin/bash

# Run the TypeScript file using vite-node to create a ZIP archive and upload it to Kantan CMS
# If vite-node is not installed, you can install it with: npm install -g vite-node typescript

echo "Starting ZIP creation and upload process..."

# Run the export script
echo "Creating ZIP archive of static output..."
vite-node scripts/zip_and_export.ts

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ ZIP creation and upload process completed successfully."
else
    echo "❌ Error occurred during ZIP creation or upload."
    exit 1
fi
