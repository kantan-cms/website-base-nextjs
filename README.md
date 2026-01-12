# Kantan CMS Website Base (Next.js)

This repository is a Next.js-based website template that integrates with Kantan CMS. It includes scripts for fetching data from Kantan CMS, converting it to the appropriate format, and building a static site.

## Overview

This project provides a complete workflow for building content-driven websites powered by Kantan CMS. It fetches content from the CMS API, transforms it into markdown or JSON files, and builds a Next.js application with the latest content.

## Requirements

### System Requirements

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

### Project Dependencies

All dependencies are included in `package.json`. Install them with:

```bash
npm install
```

Key dependencies include:
- **Next.js 15** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **axios** - HTTP client for API requests
- **gray-matter** - Parse front-matter from markdown files
- **react-markdown** - Render markdown in React
- **archiver** - Create ZIP archives for deployment

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required - Kantan CMS API Credentials
PROJECT_ID=<your_project_id>
CMS_API_KEY=<your_api_key>
CMS_BASE_URL=https://api.kantan-cms.com

# Optional - Content Management
KANTAN_REQUIRED_COLLECTION_IDS=<Collections>  # comma-separated collection ids
KANTAN_STORAGE_PATH=../tmp                 # temporary storage for fetched data

# Optional - Frontend Configuration
NEXT_PUBLIC_CMS_BASE_URL=https://api.kantan-cms.com
NEXT_PUBLIC_POST_COLLECTION_ID=<collection_uuid>
```

See [.env.example](.env.example) for a template.

## Getting Started

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Complete Build Process

To fetch content from Kantan CMS and build the site, run:

```bash
./build.sh
```

This script will:
1. Fetch data from Kantan CMS API
2. Convert JSON data to markdown files
3. Build the Next.js site with static output

## Project Structure

```
website-base-nextjs/
├── src/
│   ├── app/              # Next.js app directory (pages and layouts)
│   ├── components/       # React components
│   └── libs/             # Utility libraries and helpers
├── scripts/
│   ├── config.ts         # Configuration for content conversion
│   ├── types.ts          # TypeScript interfaces for the conversion system
│   ├── get_data_from_cms.ts       # Fetches data from Kantan CMS API
│   ├── convert-content.ts         # Converts JSON to markdown/JSON
│   ├── zip_and_export.ts          # Creates ZIP archive for deployment
│   ├── get-from-cms.sh            # Shell wrapper for data fetching
│   ├── run-convert.sh             # Shell wrapper for content conversion
│   └── zip-and-export.sh          # Shell wrapper for export
├── public/               # Static assets
├── contents/             # Generated content files (markdown/JSON)
├── build.sh              # Main build script
└── package.json          # Project dependencies and scripts
```

## File Descriptions

### Scripts Directory

- [scripts/config.ts](scripts/config.ts) - Configuration file defining how content should be fetched and converted from Kantan CMS collections
- [scripts/types.ts](scripts/types.ts) - TypeScript interfaces for the content conversion system
- [scripts/get_data_from_cms.ts](scripts/get_data_from_cms.ts) - Fetches data from the Kantan CMS API and saves it to JSON files
- [scripts/convert-content.ts](scripts/convert-content.ts) - Converts content items from JSON to markdown or JSON format based on configuration
- [scripts/zip_and_export.ts](scripts/zip_and_export.ts) - Creates a ZIP archive of the static output directory and uploads it to Kantan CMS
- [scripts/get-from-cms.sh](scripts/get-from-cms.sh) - Bash script that runs `get_data_from_cms.ts`
- [scripts/run-convert.sh](scripts/run-convert.sh) - Bash script that runs `convert-content.ts`
- [scripts/zip-and-export.sh](scripts/zip-and-export.sh) - Bash script that runs `zip_and_export.ts`

### Root Files

- [build.sh](build.sh) - Main build script that orchestrates the entire build process
- [package.json](package.json) - Project dependencies and npm scripts
- [tsconfig.json](tsconfig.json) - TypeScript configuration for the project
- [tailwind.config.ts](tailwind.config.ts) - Tailwind CSS configuration

## Integration with Kantan CMS

### Setup Process

1. **Get Collection Information**
   - Log in to your Kantan CMS dashboard
   - Navigate to your collections
   - Note the collection names and UUIDs you want to integrate
   - Fetch a sample record to understand the data structure

2. **Configure the Project**
   - Copy `.env.example` to `.env.local` and fill in your credentials
   - Modify [scripts/config.ts](scripts/config.ts) to match your collection structure:
     - Set `collectionName` to your collection name
     - Define `slugField` (used for file naming)
     - Define `contentField` (the main content field)
     - Configure `frontmatterFields` to map CMS fields to markdown frontmatter

3. **Customize Build Process**
   - Edit [build.sh](build.sh) if you need custom build steps
   - Modify [scripts/config.ts](scripts/config.ts) to add multiple collections or exporters

### Configuration Example

```typescript
// Example from scripts/config.ts
export const converterConfigs: ContentConverterConfig[] = [
  {
    collectionId: 'UUID-of-Blog-Collection',
    sourceFile: path.join(STORAGE_PATH, 'Blog.json'),
    targetDir: path.resolve('docs', 'docs'),
    slugField: 'fname',
    contentField: 'content',
    outputFormat: 'markdown',
    frontmatterFields: [
      { sourceField: 'name', targetField: 'title', required: true },
      { sourceField: 'date', targetField: 'date', formatter: formatDateToIso, required: true },
      { sourceField: 'order', targetField: 'order' },
    ],
  },
];
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the Next.js application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `./build.sh` - Complete build process (fetch + convert + build)

## Integration with AI Agents

To integrate this repository with an AI agent:

1. **Download required files**:
   ```bash
   scripts/*
   build.sh
   ```

2. **Get CMS information**:
   - List all collection names from your Kantan CMS project
   - Get the UUID of collections you want to integrate
   - Fetch a single record from each collection to understand the data structure

3. **Configure the integration**:
   - Modify [scripts/config.ts](scripts/config.ts) with your collection mappings
   - Update [build.sh](build.sh) if custom build steps are needed
   - Create `.env.local` with your API credentials

4. **Test the integration**:
   ```bash
   ./build.sh
   npm run dev
   ```

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Kantan CMS Resources

- Visit [Kantan CMS](https://kantan-cms.com) for CMS documentation
- API documentation at your CMS dashboard

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Static Export

To create a static export and upload to Kantan CMS:

```bash
npm run build
./scripts/zip-and-export.sh
```

This will create a ZIP file of the static output and upload it to your Kantan CMS project.
