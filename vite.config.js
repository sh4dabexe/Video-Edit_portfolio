import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fetchDriveFolderVideos, extractFolderId, syncProjects } from './src/services/driveSync.js';
import { getPlaybackSource } from './src/services/playbackAdapter.js';

dotenv.config();

const supabaseUrl = process.env.supa_url || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.supa_publishable_key || process.env.VITE_SUPABASE_ANON_KEY;
const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

// Global in-memory cache & throttle
let inMemoryProjects = [];
let lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 10000; // 10 seconds

async function getOrSyncProjects(force = false) {
  const now = Date.now();
  const cachePath = path.resolve(__dirname, 'src/data/projects-cache.json');

  // If memory has items and was synced recently, return immediately
  if (!force && inMemoryProjects.length > 0 && now - lastSyncTimestamp < SYNC_THROTTLE_MS) {
    return inMemoryProjects;
  }

  try {
    const fresh = await fetchDriveFolderVideos(folderId);
    const existingIds = inMemoryProjects.map(p => p.drive_file_id).join(',');
    const freshIds = fresh.map(p => p.drive_file_id).join(',');
    
    inMemoryProjects = fresh;
    lastSyncTimestamp = Date.now();

    // Only write to disk if videos were added, removed, or cache file does not exist
    if (!fs.existsSync(cachePath) || existingIds !== freshIds) {
      fs.writeFileSync(cachePath, JSON.stringify(fresh, null, 2), 'utf-8');
    }
    return fresh;
  } catch (err) {
    console.warn('Auto-sync fetch error (using fallback cache):', err.message);
    if (inMemoryProjects.length > 0) return inMemoryProjects;
    if (fs.existsSync(cachePath)) {
      inMemoryProjects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      return inMemoryProjects;
    }
    return [];
  }
}

// Background auto-polling (every 20 seconds)
setInterval(() => {
  getOrSyncProjects(true).catch(e => console.warn('Background auto-sync:', e.message));
}, 20000);

// Vite API plugin to serve backend endpoints
function portfolioApiPlugin() {
  return {
    name: 'portfolio-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        const setNoCacheHeaders = () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        };

        // GET /api/projects - Automatic live sync with Google Drive
        if (pathname === '/api/projects' && req.method === 'GET') {
          try {
            setNoCacheHeaders();
            const projects = await getOrSyncProjects(false);
            return res.end(JSON.stringify(projects));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // GET /api/projects/:id/playback
        const playbackMatch = pathname.match(/^\/api\/projects\/([^/]+)\/playback$/);
        if (playbackMatch && req.method === 'GET') {
          const id = playbackMatch[1];
          try {
            setNoCacheHeaders();
            const projects = await getOrSyncProjects(false);
            const project = projects.find(p => p.id === id || p.drive_file_id === id);
            if (!project) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Project not found' }));
            }
            const source = getPlaybackSource(project);
            return res.end(JSON.stringify(source));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // GET /api/projects/:id
        const detailMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
        if (detailMatch && req.method === 'GET' && !pathname.includes('/playback')) {
          const id = detailMatch[1];
          try {
            setNoCacheHeaders();
            const projects = await getOrSyncProjects(false);
            const project = projects.find(p => p.id === id || p.drive_file_id === id);
            if (!project) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Project not found' }));
            }
            return res.end(JSON.stringify(project));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // POST /api/sync - Explicit manual sync
        if (pathname === '/api/sync' && req.method === 'POST') {
          try {
            setNoCacheHeaders();
            const fresh = await getOrSyncProjects(true);
            return res.end(JSON.stringify({
              success: true,
              totalScanned: fresh.length,
              published: fresh.length,
              projects: fresh
            }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [portfolioApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
