import { fetchDriveFolderVideos, extractFolderId } from '../src/services/driveSync.js';
import { getPlaybackSource } from '../src/services/playbackAdapter.js';
import cachedFallback from '../src/data/projects-cache.json';

const gdriveLink = process.env.gdrive_fodler_link || process.env.VITE_GDRIVE_FOLDER_LINK;
const folderId = extractFolderId(gdriveLink);

let memoryCache = null;
let lastSyncTime = 0;
const CACHE_TTL = 15000; // 15 seconds

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id, playback } = req.query;

    const now = Date.now();
    let projects = memoryCache;

    if (!projects || now - lastSyncTime > CACHE_TTL) {
      try {
        projects = await fetchDriveFolderVideos(folderId);
        memoryCache = projects;
        lastSyncTime = now;
      } catch (err) {
        console.warn('Vercel live fetch failed, using fallback cache:', err.message);
        projects = cachedFallback || [];
      }
    }

    // Playback source request
    if (id && playback) {
      const project = projects.find(p => p.id === id || p.drive_file_id === id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(getPlaybackSource(project));
    }

    // Single project request
    if (id) {
      const project = projects.find(p => p.id === id || p.drive_file_id === id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(project);
    }

    // All projects
    return res.status(200).json(projects);
  } catch (error) {
    console.error('API projects error:', error);
    return res.status(500).json({ error: error.message, projects: cachedFallback || [] });
  }
}
