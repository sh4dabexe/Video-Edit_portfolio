import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { syncProjects, extractFolderId } from '../backend/src/services/driveSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables (.env in root or backend)
if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
} else if (fs.existsSync(path.join(rootDir, 'backend', '.env'))) {
  dotenv.config({ path: path.join(rootDir, 'backend', '.env') });
}

const supabaseUrl = process.env.supa_url || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.supa_publishable_key || process.env.VITE_SUPABASE_ANON_KEY;
const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

console.log('--------------------------------------------------');
console.log('⚡ Starting Video Editing Portfolio Drive Sync');
console.log(`📁 Folder ID: ${folderId}`);
console.log(`🔗 Supabase URL: ${supabaseUrl || 'Not configured'}`);
console.log('--------------------------------------------------');

async function run() {
  try {
    const result = await syncProjects({
      supabaseUrl,
      supabaseKey,
      folderId
    });

    console.log(`\n✅ Scan complete!`);
    console.log(`   - Total videos detected: ${result.totalScanned}`);
    console.log(`   - Published projects: ${result.published}`);
    console.log(`   - Archived projects: ${result.archived}`);
    console.log(`   - Supabase connection status: ${result.dbStatus}`);

    // 1. Save cache to backend data
    const backendDataDir = path.join(rootDir, 'backend', 'data');
    if (!fs.existsSync(backendDataDir)) {
      fs.mkdirSync(backendDataDir, { recursive: true });
    }
    const backendCachePath = path.join(backendDataDir, 'projects-cache.json');
    fs.writeFileSync(backendCachePath, JSON.stringify(result.projects, null, 2), 'utf-8');
    console.log(`💾 Saved backend project metadata to: ${backendCachePath}`);

    // 2. Save cache to frontend src data (for instant static build & fallback)
    const frontendDataDir = path.join(rootDir, 'frontend', 'src', 'data');
    if (!fs.existsSync(frontendDataDir)) {
      fs.mkdirSync(frontendDataDir, { recursive: true });
    }
    const frontendCachePath = path.join(frontendDataDir, 'projects-cache.json');
    fs.writeFileSync(frontendCachePath, JSON.stringify(result.projects, null, 2), 'utf-8');
    console.log(`💾 Saved frontend project metadata to: ${frontendCachePath}`);

    if (result.projects.length > 0) {
      console.log('\n🎬 Synced Videos in Google Drive Order:');
      result.projects.forEach((p, idx) => {
        console.log(`   ${idx + 1}. [${p.category} | ${p.aspect_ratio}] ${p.title} (${(p.file_size / (1024 * 1024)).toFixed(2)} MB)`);
      });
    }

    console.log('\n🚀 Sync finished successfully.\n');
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

run();
