import { syncProjects, extractFolderId } from '../src/services/driveSync.js';

const supabaseUrl = process.env.supa_url || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.supa_publishable_key || process.env.VITE_SUPABASE_ANON_KEY;
const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await syncProjects({
      supabaseUrl,
      supabaseKey,
      folderId
    });

    return res.status(200).json({
      success: true,
      totalScanned: result.totalScanned,
      published: result.published,
      dbStatus: result.dbStatus,
      projects: result.projects
    });
  } catch (err) {
    console.error('Vercel sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
