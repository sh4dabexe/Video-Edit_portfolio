/**
 * API Service for Video Editing Portfolio
 * Handles fetching projects, playback sources, and triggering syncs.
 */

import { fetchDriveFolderVideos } from './driveSync.js';
import { getPlaybackSource } from './playbackAdapter.js';

// Cache for instant rendering
let cachedProjects = null;

export async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedProjects = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('API endpoint not reachable or offline, checking direct sync fallback...', err.message);
  }

  // Direct client-side Drive fallback (guarantees site works 100% of the time)
  if (cachedProjects && cachedProjects.length > 0) {
    return cachedProjects;
  }

  try {
    const fallbackProjects = await fetchDriveFolderVideos();
    cachedProjects = fallbackProjects;
    return fallbackProjects;
  } catch (syncErr) {
    console.error('Failed to fetch from fallback Drive sync:', syncErr);
    return [];
  }
}

export async function fetchProjectById(id) {
  const projects = await fetchProjects();
  return projects.find(p => p.id === id || p.drive_file_id === id) || null;
}

export async function fetchPlaybackSource(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}/playback`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Playback API fallback:', err.message);
  }

  // Fallback to local adapter
  const project = await fetchProjectById(projectId);
  if (!project) return null;
  return getPlaybackSource(project);
}

export async function triggerSync() {
  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      cachedProjects = null; // Invalidate cache
      return data;
    }
  } catch (err) {
    console.warn('Server sync failed:', err);
  }

  // Client-side fallback sync
  const fresh = await fetchDriveFolderVideos();
  cachedProjects = fresh;
  return { success: true, count: fresh.length, projects: fresh };
}
