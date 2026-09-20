import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { syncProjects, extractFolderId } from '../src/services/driveSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

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

    // Save cache file for instant static/offline loading
    const dataDir = path.join(rootDir, 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const cachePath = path.join(dataDir, 'projects-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(result.projects, null, 2), 'utf-8');
    console.log(`💾 Saved project metadata to: ${cachePath}`);

    if (result.projects.length > 0) {
      console.log('\n🎬 Synced Videos:');
      result.projects.forEach((p, idx) => {
        console.log(`   ${idx + 1}. [${p.category}] ${p.title} (${(p.file_size / (1024 * 1024)).toFixed(2)} MB)`);
      });
    }

    console.log('\n🚀 Sync finished successfully.\n');
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

run();
