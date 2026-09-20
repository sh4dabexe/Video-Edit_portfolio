import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { syncProjects, extractFolderId } from '../src/services/driveSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
} else {
  dotenv.config({ path: path.join(rootDir, '..', '.env') });
}

const supabaseUrl = process.env.supa_url || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.supa_publishable_key || process.env.VITE_SUPABASE_ANON_KEY;
const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

console.log('⚡ Starting Backend Drive Sync...');
console.log(`📁 Folder: ${folderId}`);

async function run() {
  try {
    const result = await syncProjects({
      supabaseUrl,
      supabaseKey,
      folderId
    });

    const dataDir = path.join(rootDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const cachePath = path.join(dataDir, 'projects-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(result.projects, null, 2), 'utf-8');

    console.log(`✅ Synced ${result.projects.length} videos to ${cachePath}`);
    result.projects.forEach((p, idx) => {
      console.log(`   ${idx + 1}. [${p.category} | ${p.aspect_ratio}] ${p.title}`);
    });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

run();
