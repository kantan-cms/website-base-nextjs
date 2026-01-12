import * as path from 'path';
import type { 
  ContentConverterConfig, 
  LatestItemsExporterConfig 
} from './types.js';

// Get environment variables with defaults
const STORAGE_PATH = process.env.KANTAN_STORAGE_PATH || path.resolve('..', 'tmp');
const KANTAN_REQUIRED_COLLECTION_IDS = process.env.KANTAN_REQUIRED_COLLECTION_IDS ? 
  process.env.KANTAN_REQUIRED_COLLECTION_IDS.split(',') : [];


/**
 * Formats a date string to YYYY-MM-DD format
 */
export function formatDateToIso(dateString: string): string {
  const dateObj = new Date(dateString);
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
}


// Configuration Objects
// Array of content converter configurations for different content types
export const converterConfigs: ContentConverterConfig[] = [
  // Blog converter configuration
  {
    collectionId: KANTAN_REQUIRED_COLLECTION_IDS[0],
    sourceFile: path.join(STORAGE_PATH, `${KANTAN_REQUIRED_COLLECTION_IDS[0]}.json`),
    targetDir: path.resolve('docs', 'docs'),
    slugField: 'fname',
    contentField: 'content',
    outputFormat: 'markdown',
    frontmatterFields: [
      { sourceField: 'name', targetField: 'title', required: true },
      { sourceField: 'date', targetField: 'date', formatter: (value: unknown) => formatDateToIso(String(value)), required: true },
      { sourceField: 'order', targetField: 'order' },
    ],
    extractors: []
  },
];

// Array of latest items exporter configurations
export const exporterConfigs: LatestItemsExporterConfig[] = [];
