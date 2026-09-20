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

// Vite API plugin to serve backend endpoints
function portfolioApiPlugin() {
  return {
    name: 'portfolio-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // GET /api/projects
        if (url === '/api/projects' && req.method === 'GET') {
          try {
            const cachePath = path.resolve(__dirname, 'src/data/projects-cache.json');
            let projects = [];
            if (fs.existsSync(cachePath)) {
              projects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            } else {
              projects = await fetchDriveFolderVideos(folderId);
            }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(projects));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // GET /api/projects/:id/playback
        const playbackMatch = url.match(/^\/api\/projects\/([^/]+)\/playback$/);
        if (playbackMatch && req.method === 'GET') {
          const id = playbackMatch[1];
          try {
            const cachePath = path.resolve(__dirname, 'src/data/projects-cache.json');
            let projects = [];
            if (fs.existsSync(cachePath)) {
              projects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            } else {
              projects = await fetchDriveFolderVideos(folderId);
            }
            const project = projects.find(p => p.id === id || p.drive_file_id === id);
            if (!project) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Project not found' }));
            }
            const source = getPlaybackSource(project);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(source));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // GET /api/projects/:id
        const detailMatch = url.match(/^\/api\/projects\/([^/]+)$/);
        if (detailMatch && req.method === 'GET' && !url.includes('/playback')) {
          const id = detailMatch[1];
          try {
            const cachePath = path.resolve(__dirname, 'src/data/projects-cache.json');
            let projects = [];
            if (fs.existsSync(cachePath)) {
              projects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            } else {
              projects = await fetchDriveFolderVideos(folderId);
            }
            const project = projects.find(p => p.id === id || p.drive_file_id === id);
            if (!project) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Project not found' }));
            }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(project));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // POST /api/sync
        if (url === '/api/sync' && req.method === 'POST') {
          try {
            const result = await syncProjects({
              supabaseUrl,
              supabaseKey,
              folderId
            });
            const cachePath = path.resolve(__dirname, 'src/data/projects-cache.json');
            fs.writeFileSync(cachePath, JSON.stringify(result.projects, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, ...result }));
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
