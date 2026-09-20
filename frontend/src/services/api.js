/**
 * Frontend API Client
 * Connects to Render Backend (via VITE_API_URL) or relative /api
 */

import { getPlaybackSource } from './playbackAdapter.js';
import cachedFallback from '../data/projects-cache.json';

const DEFAULT_RENDER_BACKEND = 'https://video-edit-portfolio.onrender.com';
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_RENDER_BACKEND).replace(/\/$/, '');

let inMemoryProjects = null;

export async function fetchProjects(forceRefresh = false) {
  try {
    const url = `${API_BASE_URL}/api/projects${forceRefresh ? `?t=${Date.now()}` : ''}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        inMemoryProjects = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API request failed, using instant cache:', err.message);
  }

  // Graceful fallback for instant paint or sleeping Render backend
  if (inMemoryProjects && inMemoryProjects.length > 0) {
    return inMemoryProjects;
  }
  return cachedFallback || [];
}

export async function fetchProjectById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }
  const all = await fetchProjects();
  return all.find(p => p.id === id || p.drive_file_id === id) || null;
}

export async function fetchPlaybackSource(projectId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/playback`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }

  const project = await fetchProjectById(projectId);
  if (!project) return null;
  return getPlaybackSource(project);
}

export async function triggerSync() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.projects && data.projects.length > 0) {
        inMemoryProjects = data.projects;
      }
      return data;
    }
  } catch (err) {
    console.warn('Sync call failed:', err.message);
  }

  const fresh = await fetchProjects(true);
  return { success: true, count: fresh.length, projects: fresh };
}
