import * as fs from 'fs';
import * as path from 'path';
import type {
  ContentItem,
  ExportedItem,
  ContentConverterConfig,
  FrontmatterFieldConfig,
  LatestItemsExporterConfig
} from './types.js';
import {
  converterConfigs,
  exporterConfigs,
} from './config.js';

// Utility Functions
/**
 * Creates a URL-friendly slug from a string
 */

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Ensures that the specified directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Reads and parses a JSON file
 */
function readJsonFile<T>(filePath: string): T[] {
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

/**
 * Formats a single frontmatter field value
 */
function formatFrontmatterField(key: string, value: unknown): string {
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${key}: []`;
    }
    const itemsStr = value.map(item => `"${item}"`).join(', ');
    return `${key}: [${itemsStr}]`;
  }
  
  // Handle booleans
  if (typeof value === 'boolean') {
    return `${key}: ${value.toString().toLowerCase()}`;
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    return `${key}: ${value}`;
  }
  
  // Handle strings - escape quotes
  const escapedValue = String(value).replace(/"/g, '\\"');
  return `${key}: "${escapedValue}"`;
}

/**
 * Generates frontmatter for a markdown file based on configuration
 */
function generateFrontmatter(item: ContentItem, config: FrontmatterFieldConfig[]): string {
  const frontmatterLines = ['---'];
  
  for (const field of config) {
    const value = item[field.sourceField];
    
    if (value !== undefined && value !== null && value !== '') {
      const formattedValue = field.formatter ? field.formatter(value) : value;
      
      frontmatterLines.push(formatFrontmatterField(field.targetField, formattedValue));
    } else if (field.required) {
      frontmatterLines.push(`${field.targetField}: ""`);
    }
  }
  
  frontmatterLines.push('---', '');
  return frontmatterLines.join('\n');
}

/**
 * Processes a single content item and converts it to the target format
 */
function processContentItem(
  item: ContentItem, 
  targetDir: string, 
  config: ContentConverterConfig, 
  processedSlugs: Set<string>
): void {
  // Create a slug from the specified field
  let slug = createSlug(String(item[config.slugField]));
  
  // Handle duplicate slugs by adding a unique identifier
  if (processedSlugs.has(slug)) {
    // Add a short part of the ID to make it unique
    const uniqueId = item.id.substring(0, 8);
    slug = `${slug}-${uniqueId}`;
  }
  
  processedSlugs.add(slug);
  
  // Apply extractors to enrich the item with additional data
  for (const extractorConfig of config.extractors) {
    if (extractorConfig.condition(item)) {
      item[extractorConfig.field] = extractorConfig.extractor(item);
    }
  }
  
  let fileContent: string;
  let fileExtension: string;
  
  if (config.outputFormat === 'markdown') {
    // Generate frontmatter
    const frontmatter = generateFrontmatter(item, config.frontmatterFields);
    
    // Combine frontmatter and content
    fileContent = `${frontmatter}\n${item[config.contentField]}`;
    fileExtension = 'md';
  } else {
    // For JSON output, create a JSON representation
    const outputObject: { [key: string]: unknown } = {};
    
    for (const field of config.frontmatterFields) {
      if (item[field.sourceField] !== undefined) {
        outputObject[field.targetField] = field.formatter 
          ? field.formatter(item[field.sourceField]) 
          : item[field.sourceField];
      }
    }
    
    // Add the content field
    outputObject.content = item[config.contentField];
    
    fileContent = JSON.stringify(outputObject, null, 2);
    fileExtension = 'json';
  }
  
  const targetPath = path.join(targetDir, `${slug}.${fileExtension}`);
  
  // Write to the target file
  fs.writeFileSync(targetPath, fileContent);
  console.log(`Converted: ${targetPath}`);
}

/**
 * Converts content items from JSON to the target format based on configuration
 */
async function convertContent(config: ContentConverterConfig): Promise<void> {
  try {
    // Create target directory if it doesn't exist
    ensureDirectoryExists(config.targetDir);
    
    // Read the source JSON file
    const sourcePath = path.resolve(config.sourceFile);
    const items = readJsonFile<ContentItem>(sourcePath);
    
    console.log(`Found ${items.length} items to convert for ${config.collectionId}`);
    
    // Keep track of processed slugs to handle duplicates
    const processedSlugs = new Set<string>();
    
    // Process each item
    for (const item of items) {
      processContentItem(item, config.targetDir, config, processedSlugs);
    }
    
    console.log(`Content conversion completed successfully for ${config.collectionId}`);
  } catch (error) {
    console.error(`Error converting content for ${config.collectionId}:`, error);
  }
}

/**
 * Exports the latest items to a TypeScript file based on configuration
 */
async function exportLatestItems(config: LatestItemsExporterConfig): Promise<void> {
  try {
    // Create directory for the target file if it doesn't exist
    const targetDir = path.dirname(config.targetFile);
    ensureDirectoryExists(targetDir);
    
    // Read the source JSON file
    const sourcePath = path.join(process.cwd(), config.sourceFile);
    const items = readJsonFile<ContentItem>(sourcePath);
    
    console.log(`Found ${items.length} items to extract latest from`);
    
    // Sort items based on configuration
    const sortedItems = [...items].sort((a, b) => {
      const aValue = a[config.sortField];
      const bValue = b[config.sortField];
      
      // Convert to comparable types
      const aValueStr = String(aValue);
      const bValueStr = String(bValue);
      
      if (config.sortDirection === 'asc') {
        return aValueStr > bValueStr ? 1 : -1;
      } else {
        return aValueStr < bValueStr ? 1 : -1;
      }
    });
    
    // Take the latest N items
    const latestItems = sortedItems.slice(0, config.itemCount);
    
    // Format the items based on configuration
    const formattedItems: ExportedItem[] = latestItems.map(item => {
      const formattedItem: ExportedItem = { ...config.defaultValues };
      
      // Apply formatters to each field
      for (const [field, formatter] of Object.entries(config.formatters)) {
        formattedItem[field] = formatter(item);
      }
      
      return formattedItem;
    });
    
    // Create the TypeScript file content
    const tsContent = `// Auto-generated from ${config.sourceFile}
// Last updated: ${new Date().toISOString()}

export interface ${config.interfaceName} {
${Object.keys(formattedItems[0] || {}).map(key => `  ${key}: ${typeof formattedItems[0]?.[key]};`).join('\n')}
}

export const ${config.exportName}: ${config.interfaceName}[] = ${JSON.stringify(formattedItems, null, 2)};
`;
    
    // Write to the target file
    fs.writeFileSync(config.targetFile, tsContent);
    console.log(`Exported latest items to: ${config.targetFile}`);
    
  } catch (error) {
    console.error('Error exporting latest items:', error);
  }
}


// Execute the conversion and extraction
async function main() {
  try {
    // Process all converter configurations
    for (const config of converterConfigs) {
      await convertContent(config);
    }
    
    // Process all exporter configurations
    for (const config of exporterConfigs) {
      await exportLatestItems(config);
    }
    
    console.log('All conversions completed successfully');
  } catch (error) {
    console.error('Error during content conversion:', error);
  }
}

main().catch(console.error);
