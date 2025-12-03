import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'contents');

export function getCollectionsRecord(collection: string, slugField: string) {
  const collectionDirectory = path.join(postsDirectory, collection);
  const fileName = `${slugField}.md`;
  const fullPath = path.join(collectionDirectory, fileName);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  // Read markdown file as string
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Convert Date objects to strings
  const data = { ...matterResult.data };
  if (data.date instanceof Date) {
    data.date = data.date.toISOString().split('T')[0];
  }

  // Return the data with the id and content
  return {
    slugField,
    content: matterResult.content,
    ...data,
  };
}
