/**
 * Types for the content conversion system
 */

// Base content item interface
export interface ContentItem {
  id: string;
  [key: string]: unknown;
}

// Exported item interface
export interface ExportedItem {
  [key: string]: unknown;
}

// Frontmatter field configuration
export interface FrontmatterFieldConfig {
  sourceField: string;
  targetField: string;
  formatter?: (value: unknown) => string;
  required?: boolean;
}

// Extractor configuration
export interface ExtractorConfig {
  field: string;
  extractor: (item: ContentItem) => string;
  condition: (item: ContentItem) => boolean;
}

// Content converter configuration
export interface ContentConverterConfig {
  // Collection information
  collectionName: string;  // Name of the collection (e.g., 'Blog', 'Project')
  
  // File paths
  sourceFile: string;      // Path to the source JSON file
  targetDir: string;       // Directory where converted files will be stored
  
  // Content mapping
  slugField: string;       // Field to use for generating the slug
  contentField: string;    // Field containing the main content
  
  // Output configuration
  outputFormat: 'markdown' | 'json';
  
  // Field mappings and transformations
  frontmatterFields: FrontmatterFieldConfig[];
  extractors: ExtractorConfig[];
}

// Latest items exporter configuration
export interface LatestItemsExporterConfig {
  // Source and target
  sourceFile: string;
  targetFile: string;
  
  // Selection and sorting
  itemCount: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  
  // Formatting and defaults
  formatters: {
    [key: string]: (item: ContentItem) => unknown;
  };
  defaultValues: {
    [key: string]: unknown;
  };
  
  // Output TypeScript configuration
  interfaceName: string;
  exportName: string;
}
