import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Debug environment variables
console.log('Environment variables:');
console.log('PROJECT_ID:', process.env.PROJECT_ID);
console.log('CMS_API_KEY:', process.env.CMS_API_KEY ? '(set)' : '(not set)');
console.log('KANTAN_REQUIRED_COLLECTION_IDS:', process.env.KANTAN_REQUIRED_COLLECTION_IDS);
console.log('KANTAN_STORAGE_PATH:', process.env.KANTAN_STORAGE_PATH);

// Configuration
interface KantanConfig {
  projectId: string;
  apiKey: string;
  baseUrl: string;
  requiredCollections: string[];
  storagePath: string;
}

const config: KantanConfig = {
  projectId: process.env.PROJECT_ID || '',
  apiKey: process.env.CMS_API_KEY || '',
  baseUrl: `${process.env.CMS_BASE_URL}/v1/api`,
  requiredCollections: process.env.KANTAN_REQUIRED_COLLECTION_IDS ? 
    process.env.KANTAN_REQUIRED_COLLECTION_IDS.split(',') : 
    [],
  storagePath: process.env.KANTAN_STORAGE_PATH || './tmp/'
};

// Interfaces for API responses
interface Collection {
  id: string;
  name: string;
  description: string | null;
  type: string;
  order: number | null;
  created_at: string;
  updated_at: string;
}

interface CollectionsResponse {
  collections: Collection[];
}

interface CollectionCountResponse {
  count: number;
}

interface Record {
  id: string;
  [key: string]: any;
}

interface RecordsResponse {
  records: Record[];
}

interface RecordCountResponse {
  count: number;
}

interface ApiValidationResponse {
  status: number;
}

// API client with authentication headers
const apiClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'X-Project-Id': config.projectId,
    'X-API-Key': config.apiKey,
    'Content-Type': 'application/json'
  }
});

/**
 * Validates the API key and project ID
 */
async function validateApiKey(): Promise<boolean> {
  try {
    console.log('Validating API credentials...');
    
    // Check if credentials are provided
    if (!config.projectId) {
      console.log('❌ Project ID is missing.');
      return false;
    }
    
    if (!config.apiKey) {
      console.log('❌ API Key is missing.');
      return false;
    }
    
    console.log(`Project ID: ${config.projectId}`);
    console.log(`API Key: ${config.apiKey.substring(0, 4)}${'*'.repeat(Math.max(0, config.apiKey.length - 4))}`);
    console.log(`API Base URL: ${config.baseUrl}`);
    
    const response = await apiClient.get<ApiValidationResponse>('/api_key/validate');
    console.log('API Response:', response.data);
    return response.data.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('API key validation failed:');
      console.log(`Status: ${error.response?.status}`);
      console.log(`Message: ${error.message}`);
      console.log(`Response data:`, error.response?.data);
    } else {
      console.log('API key validation failed:', error);
    }
    return false;
  }
}

/**
 * Counts the total number of collections
 */
async function countCollections(): Promise<number> {
  try {
    const response = await apiClient.get<CollectionCountResponse>('/collections_count/');
    return response.data.count;
  } catch (error) {
    console.log('Error counting collections:', error);
    return 0;
  }
}

/**
 * Retrieves all collections with pagination
 */
async function getCollections(): Promise<Collection[]> {
  try {
    const count = await countCollections();
    const pageSize = 100;
    const pages = Math.ceil(count / pageSize);
    
    let allCollections: Collection[] = [];
    
    for (let page = 1; page <= pages; page++) {
      const response = await apiClient.get<CollectionsResponse>(
        `/collections/?page_size=${pageSize}&page_num=${page}`
      );
      
      allCollections = [...allCollections, ...response.data.collections];
    }
    
    // Filter collections if required
    if (config.requiredCollections.length > 0) {
      return allCollections.filter(collection => 
        config.requiredCollections.includes(collection.id)
      );
    }
    
    return allCollections;
  } catch (error) {
    console.log('Error retrieving collections:', error);
    return [];
  }
}

/**
 * Counts the total number of records in a collection
 */
async function countRecords(collectionId: string): Promise<number> {
  try {
    const response = await apiClient.get<RecordCountResponse>(
      `/collections/${collectionId}/records_count/`
    );
    return response.data.count;
  } catch (error) {
    console.log(`Error counting records for collection ${collectionId}:`, error);
    return 0;
  }
}

/**
 * Retrieves all records from a collection with pagination
 */
async function getRecords(collection: Collection): Promise<Record[]> {
  try {
    const count = await countRecords(collection.id);
    const pageSize = 100;
    const pages = Math.ceil(count / pageSize);
    
    let allRecords: Record[] = [];
    
    for (let page = 1; page <= pages; page++) {
      const response = await apiClient.get<RecordsResponse>(
        `/collections/${collection.id}/records/?page_size=${pageSize}&page_num=${page}`
      );
      
      allRecords = [...allRecords, ...response.data.records];
    }
    
    // Save records to file
    saveRecordsToFile(collection, allRecords);
    
    return allRecords;
  } catch (error) {
    console.log(`Error retrieving records for collection ${collection.id}:`, error);
    return [];
  }
}

/**
 * Saves records to a JSON file
 */
function saveRecordsToFile(collection: Collection, records: Record[]): void {
  try {
    // Ensure directory exists
    if (!fs.existsSync(config.storagePath)) {
      fs.mkdirSync(config.storagePath, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(
      path.join(config.storagePath, `${collection.id}.json`), 
      JSON.stringify(records, null, 2)
    );
    
    console.log(`✓ Saved ${records.length} records for collection "${collection.id}"`);
  } catch (error) {
    console.log(`Error saving records for collection ${collection.id}:`, error);
  }
}

/**
 * Main function to fetch all data
 */
async function fetchAllData(): Promise<void> {
  console.log('Starting Kantan CMS data fetch...');
  
  // Validate API key
  const isValid = await validateApiKey();
  
  if (!isValid) {
    console.log('❌ API validation failed. Check your projectId and apiKey.');
    return;
  }
  
  console.log('✓ API credentials validated');
  
  // Get collections
  const collections = await getCollections();
  
  if (collections.length === 0) {
    console.log('❌ No collections found or matching requirements.');
    return;
  }
  
  console.log(`✓ Found ${collections.length} collections`);
  
  // Process each collection
  for (const collection of collections) {
    console.log(`Processing collection: ${collection.name} (${collection.id})`);
    const records = await getRecords(collection);
    console.log(`✓ Processed ${records.length} records for collection "${collection.name}"`);
  }
  
  console.log('✓ All data fetched successfully');
}

// Run the script
fetchAllData().catch(error => {
  console.error('Error in main execution:', error);
  process.exit(1);
});
