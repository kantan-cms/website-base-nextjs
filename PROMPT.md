# AI Website Generation Guide - Kantan CMS Next.js Template

## Project Overview
This is a **Next.js 15 + TypeScript** template that integrates with **Kantan CMS** for content-driven websites. It fetches content from CMS, converts it to markdown, and builds static sites.

## Core Architecture

### Tech Stack
- **Framework**: Next.js 15.1.6 (App Router, Static Export)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 4.1.13
- **Content**: Markdown with YAML frontmatter (parsed via gray-matter)
- **API**: Axios for CMS integration

### Directory Structure
```
src/
├── app/              # Next.js pages & layouts (App Router)
├── components/       # React components (currently empty)
└── libs/             # Utilities
    └── .server/      # Server-side helpers
scripts/              # CMS integration & build automation
contents/             # Auto-generated markdown files (from CMS)
public/               # Static assets
```

## Key Files & Their Purpose

### Configuration Files
- **`tailwind.config.ts`**: Theme colors (primary: #2D5A3D green, Inter font)
- **`next.config.ts`**: Static export mode enabled
- **`scripts/config.ts`**: CMS-to-markdown conversion rules
- **`.env.local`**: CMS credentials (PROJECT_ID, CMS_API_KEY, etc.)

### Main Scripts
- **`build.sh`**: Complete workflow (fetch CMS → convert → build)
- **`scripts/get_data_from_cms.ts`**: Fetch content from Kantan CMS API
- **`scripts/convert-content.ts`**: Transform JSON to markdown files
- **`src/libs/.server/getSortedPostsData.ts`**: Read & sort markdown files

## Content Workflow

### 1. Content Structure
Content lives in `contents/{collection}/{slug}.md` with frontmatter:
```markdown
---
title: "Example Post"
date: "2024-01-01"
slug: "example-post"
---
# Content here
```

### 2. Fetching Content (Server-Side)
```typescript
import { getSortedCollectionsData } from '@/libs/.server/getSortedPostsData';

// In a Server Component or getStaticProps
const posts = getSortedCollectionsData('blog', 'date');
```

### 3. Form Submissions (Client-Side)
```typescript
import { postFormData } from '@/libs/postFormData';

await postFormData({ name: 'John', email: 'john@example.com' });
```

## Quick Start for AI Generation

### Development Mode
```bash
npm install
npm run dev  # http://localhost:3000
```

### Production Build
```bash
./build.sh   # Fetch CMS data + convert + build static site
```

## Common Tasks

### Adding a New Page
1. Create `src/app/{route}/page.tsx`
2. Use Server Components for data fetching
3. Import components from `@/components`

### Adding a Component
1. Create in `src/components/{ComponentName}.tsx`
2. Export from `src/components/index.ts`
3. Use Tailwind classes for styling

### Customizing Theme
Edit `tailwind.config.ts` for colors, fonts, and design tokens

### Modifying CMS Integration
Edit `scripts/config.ts` to configure:
- Collection names
- Field mappings
- Output format (markdown/json)
- Frontmatter fields

## Environment Variables (Required)
```env
PROJECT_ID=your-project-id
CMS_API_KEY=your-api-key
CMS_BASE_URL=https://api.kantan-cms.com
NEXT_PUBLIC_CMS_BASE_URL=https://api.kantan-cms.com
NEXT_PUBLIC_POST_COLLECTION_ID=collection-uuid
```

## Import Aliases
- `@/*` → `./src/*` (e.g., `import Layout from '@/components/Layout'`)

## Build Output
- **Development**: Hot-reload server at localhost:3000
- **Production**: Static HTML in `out/` directory (ready for hosting)

## Design System (Current Theme)
- **Primary Color**: Green (#2D5A3D)
- **Secondary**: Sage green (#4A7C59)
- **Accent**: Emerald (#10B981)
- **Font**: Inter (system fallbacks)
- **Layout**: Responsive, mobile-first Tailwind

## Notes for AI Code Generation
1. **Always use Server Components** in `src/app/` for data fetching
2. **Use TypeScript** with proper type definitions
3. **Tailwind classes only** - no custom CSS unless necessary
4. **Markdown content** is in `contents/` directory (auto-generated from CMS)
5. **Path references**: Use markdown links like `[file.ts](src/file.ts)` for clickability
6. **Static export mode** means no server-side runtime features (use Static Generation)
7. **Content fetching** is server-side only (use `.server/` utilities)
