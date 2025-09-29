
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import archiver from 'archiver';
import { createReadStream } from 'fs';

// Load environment variables
dotenv.config({ path: '.env' });

// Configuration
interface KantanConfig {
  projectId: string;
  apiKey: string;
  baseUrl: string;
  staticOutputDir: string;
  zipFileName: string;
}

const config: KantanConfig = {
  projectId: process.env.PROJECT_ID || '',
  apiKey: process.env.CMS_API_KEY || '',
  baseUrl: process.env.CMS_BASE_URL || '',
  staticOutputDir: process.env.STATIC_OUTPUT_DIR || './out',
  zipFileName: process.env.ZIP_FILENAME || 'site-export.zip'
};

// Interfaces for API responses
interface PresignedZipUrl {
  url: string;
}

interface PresignedZipResponse {
  presigned_zip: PresignedZipUrl;
}

interface UpdateHostingStatusReq {
  hosting: {
    status: 'host_error' | 'preview_error' | 'host_complete' | 'preview_complete' | 'waiting' | 'running';
    status_message: string;
  };
}

// API client with authentication headers
const apiClient = axios.create({
  baseURL: [config.baseUrl, "v1", "api"].join('/'),
  headers: {
    'X-Project-Id': config.projectId,
    'X-API-Key': config.apiKey,
    'Content-Type': 'application/json'
  }
});

/**
 * Creates a ZIP archive of the static output directory
 */
async function createZipArchive(outputPath: string, sourceDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create output stream
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });

    // Handle events
    output.on('close', () => {
      console.log(`✓ Archive created: ${outputPath} (${archive.pointer()} bytes)`);
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // Pipe archive data to the output file
    archive.pipe(output);

    // Add files from the output directory
    archive.directory(sourceDir, false);

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * Requests a presigned URL for uploading the ZIP archive
 */
async function getPresignedUrl(): Promise<string> {
  try {
    const response = await apiClient.post<PresignedZipResponse>('/hosting/build/upload_presigned_url/');
    return response.data.presigned_zip.url;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw new Error('Failed to get presigned URL for upload');
  }
}

/**
 * Uploads the ZIP archive to the presigned URL
 */
async function uploadZipToPresignedUrl(zipPath: string, presignedUrl: string): Promise<boolean> {
  try {
    const fileStream = createReadStream(zipPath);
    
    const response = await axios.put(presignedUrl, fileStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': fs.statSync(zipPath).size
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error uploading ZIP file:', error);
    throw new Error('Failed to upload ZIP file');
  }
}

/**
 * Updates the hosting status after upload
 */
async function updateHostingStatus(status: 'host_complete' | 'preview_complete', message: string): Promise<boolean> {
  try {
    const requestBody: UpdateHostingStatusReq = {
      hosting: {
        status: status,
        status_message: message
      }
    };
    
    const response = await apiClient.post('/hosting/status/', requestBody);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating hosting status:', error);
    throw new Error('Failed to update hosting status');
  }
}

/**
 * Main deployment function
 */
async function deployToKantan(isPreview: boolean = false): Promise<void> {
  try {
    console.log('Starting deployment to Kantan CMS...');
    
    // 1. Create ZIP archive of the static output
    const zipPath = path.resolve(config.zipFileName);
    await createZipArchive(zipPath, config.staticOutputDir);
    
    // 2. Get presigned URL for upload
    console.log('Requesting presigned upload URL...');
    const presignedUrl = await getPresignedUrl();
    console.log('✓ Received presigned URL');
    console.log("presignedUrl", presignedUrl)
    // 3. Upload the ZIP file
    console.log('Uploading ZIP archive...');
    const uploadSuccess = await uploadZipToPresignedUrl(zipPath, presignedUrl);
    console.log("uploadSuccess", uploadSuccess)
    console.log('✓ Upload completed successfully');
    
    // 4. Update the hosting status
    const statusType = isPreview ? 'preview_complete' : 'host_complete';
    const statusMessage = isPreview ? 'Preview deployment complete' : 'Production deployment complete';
    
    console.log(`Updating hosting status to ${statusType}...`);
    const statusUpdateSuccess = await updateHostingStatus(statusType, statusMessage);
    console.log('✓ Status updated successfully');
    
    // 5. Clean up the ZIP file
    fs.unlinkSync(zipPath);
    console.log('✓ Cleaned up temporary ZIP file');
    
    console.log('✓ Deployment to Kantan CMS completed successfully');
    console.log(`${isPreview ? 'Preview' : 'Production'} site will be available shortly`);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isPreview = args.includes('--preview');

// Run the deployment
deployToKantan(isPreview).catch(error => {
  console.error('Unhandled error during deployment:', error);
  process.exit(1);
});