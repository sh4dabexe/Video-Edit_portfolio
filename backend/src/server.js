import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchDriveFolderVideos, extractFolderId, syncProjects } from './services/driveSync.js';
import { getPlaybackSource } from './services/playbackAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables (.env in backend/ or root)
if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
} else {
  dotenv.config({ path: path.join(rootDir, '..', '.env') });
}

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.supa_url || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.supa_publishable_key || process.env.VITE_SUPABASE_ANON_KEY;
const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

// Enable CORS for all incoming requests (Vercel, Netlify, localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

app.use(express.json());

// In-memory cache and sync lock
let inMemoryProjects = [];
let lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 10000; // 10 seconds

const dataDir = path.join(rootDir, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const cachePath = path.join(dataDir, 'projects-cache.json');

// Preload cache from disk if available
if (fs.existsSync(cachePath)) {
  try {
    inMemoryProjects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch (e) {
    inMemoryProjects = [];
  }
}

async function getOrSyncProjects(force = false) {
  const now = Date.now();
  if (!force && inMemoryProjects.length > 0 && now - lastSyncTimestamp < SYNC_THROTTLE_MS) {
    return inMemoryProjects;
  }

  try {
    const fresh = await fetchDriveFolderVideos(folderId);
    inMemoryProjects = fresh;
    lastSyncTimestamp = Date.now();

    fs.writeFileSync(cachePath, JSON.stringify(fresh, null, 2), 'utf-8');
    return fresh;
  } catch (err) {
    console.warn('Google Drive sync warning (serving cached data):', err.message);
    if (inMemoryProjects.length > 0) return inMemoryProjects;
    if (fs.existsSync(cachePath)) {
      inMemoryProjects = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      return inMemoryProjects;
    }
    return [];
  }
}

// Background auto-polling (every 20s)
setInterval(() => {
  getOrSyncProjects(true).catch(e => console.warn('Background auto-sync:', e.message));
}, 20000);

// Set no-cache headers middleware for API routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Video Editing Portfolio Backend',
    activeProjects: inMemoryProjects.length,
    folderId,
    timestamp: new Date().toISOString()
  });
});

// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getOrSyncProjects(false);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/playback
app.get('/api/projects/:id/playback', async (req, res) => {
  try {
    const projects = await getOrSyncProjects(false);
    const project = projects.find(p => p.id === req.params.id || p.drive_file_id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(getPlaybackSource(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
app.get('/api/projects/:id', async (req, res) => {
  try {
    const projects = await getOrSyncProjects(false);
    const project = projects.find(p => p.id === req.params.id || p.drive_file_id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sync
app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncProjects({
      supabaseUrl,
      supabaseKey,
      folderId
    });
    inMemoryProjects = result.projects;
    lastSyncTimestamp = Date.now();
    fs.writeFileSync(cachePath, JSON.stringify(result.projects, null, 2), 'utf-8');

    res.json({
      success: true,
      totalScanned: result.totalScanned,
      published: result.published,
      projects: result.projects
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initial scan on boot
getOrSyncProjects(true).then(projects => {
  console.log(`✅ Loaded ${projects.length} portfolio projects on boot.`);
}).catch(console.warn);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Video Portfolio Backend running on http://0.0.0.0:${PORT}`);
});
