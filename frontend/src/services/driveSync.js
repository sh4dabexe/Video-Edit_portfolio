// Google Drive Sync Service
// Automatically synchronizes video files from designated Google Drive folder into portfolio projects.

import { createClient } from '@supabase/supabase-js';

export const DEFAULT_GDRIVE_FOLDER_ID = '1YTFYglGAOpADlIxzqGvqh4-6SxkRy0wO';

/**
 * Extracts Google Drive Folder ID from a full link or ID string
 */
export function extractFolderId(linkOrId) {
  if (!linkOrId) return DEFAULT_GDRIVE_FOLDER_ID;
  const match = linkOrId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(linkOrId)) return linkOrId;
  return DEFAULT_GDRIVE_FOLDER_ID;
}

/**
 * Formats a clean title from a video filename
 * e.g., "Barisho me Tum.mp4" -> "Barisho me Tum"
 */
export function formatProjectTitle(filename) {
  if (!filename) return 'Untitled Project';
  // Remove file extension
  let clean = filename.replace(/\.(mp4|mov|mkv|avi|webm|m4v)$/i, '');
  // Replace underscores and dashes with spaces
  clean = clean.replace(/[_]/g, ' ').trim();
  return clean || filename;
}

/**
 * Categorizes a video based on title keywords or defaults to Cinematic
 */
export function inferCategory(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('reel') || lower.includes('short') || lower.includes('tiktok') || lower.includes('vertical')) {
    return 'Reels & Shorts';
  }
  if (lower.includes('commercial') || lower.includes('ad') || lower.includes('brand') || lower.includes('promo')) {
    return 'Commercial';
  }
  if (lower.includes('music') || lower.includes('song') || lower.includes('mv')) {
    return 'Music Video';
  }
  if (lower.includes('documentary') || lower.includes('doc')) {
    return 'Documentary';
  }
  return 'Cinematic';
}

/**
 * Generates default tags based on filename and category
 */
export function generateTags(filename, category) {
  const tags = new Set();
  tags.add(category);
  tags.add('Color Grading');
  tags.add('Sound Design');
  
  const lower = filename.toLowerCase();
  if (lower.includes('tum') || lower.includes('barish') || lower.includes('lagda')) {
    tags.add('Narrative');
    tags.add('Cinematic Mood');
  }
  if (lower.includes('commercial') || lower.includes('ad')) {
    tags.add('Brand Edit');
    tags.add('Motion Graphics');
  }
  return Array.from(tags);
}

/**
 * Fast helper to detect image dimensions from thumbnail bytes
 */
async function detectDimensions(fileId) {
  try {
    const res = await fetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w600`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const view = new DataView(buf);
    for (let i = 0; i < buf.byteLength - 8; i++) {
      if (view.getUint8(i) === 0xFF && (view.getUint8(i+1) === 0xC0 || view.getUint8(i+1) === 0xC2)) {
        const height = view.getUint16(i + 5);
        const width = view.getUint16(i + 7);
        return { width, height, isVertical: height > width };
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

/**
 * Fetches files from the designated Google Drive folder HTML payload
 */
export async function fetchDriveFolderVideos(folderId = DEFAULT_GDRIVE_FOLDER_ID) {
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const response = await fetch(folderUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Drive folder: HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)';/);
  if (!match) {
    throw new Error('Could not parse Google Drive data payload (_DRIVE_ivd not found)');
  }

  // Google Drive encodes this using hex escape sequences (\x5b, etc.)
  const unescaped = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );

  const rawData = JSON.parse(unescaped);
  const foundVideos = [];

  function scanForVideos(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      // Check if this array represents a file node: [fileId, [folderId], name, mimeType, ...]
      if (
        typeof obj[0] === 'string' &&
        typeof obj[2] === 'string' &&
        typeof obj[3] === 'string' &&
        obj[3].startsWith('video/')
      ) {
        const fileId = obj[0];
        const driveName = obj[2];
        const mimeType = obj[3];
        const fileSize = typeof obj[13] === 'number' ? obj[13] : 0;
        const modifiedTimestamp = typeof obj[10] === 'number' ? obj[10] : Date.now();
        const category = inferCategory(driveName);

        foundVideos.push({
          id: fileId,
          drive_file_id: fileId,
          drive_name: driveName,
          title: formatProjectTitle(driveName),
          description: `Cinematic edit showcasing rhythm, emotion, and visual storytelling by Shadab Alam.`,
          category,
          is_vertical: false,
          aspect_ratio: '16:9',
          tags: generateTags(driveName, category),
          video_url: `https://drive.google.com/uc?id=${fileId}&export=download`,
          thumbnail_url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
          embed_url: `https://drive.google.com/file/d/${fileId}/preview`,
          mime_type: mimeType,
          file_size: fileSize,
          duration: 0,
          sync_status: 'published',
          published: true,
          sort_order: foundVideos.length,
          created_at: new Date(modifiedTimestamp).toISOString(),
          updated_at: new Date(modifiedTimestamp).toISOString()
        });
      }
      for (const child of obj) {
        scanForVideos(child);
      }
    }
  }

  scanForVideos(rawData);

  // Detect dimensions and aspect ratios for all videos in parallel
  await Promise.all(foundVideos.map(async (v) => {
    const dims = await detectDimensions(v.drive_file_id);
    if (dims) {
      v.is_vertical = dims.isVertical;
      v.aspect_ratio = dims.isVertical ? '9:16' : '16:9';
      if (dims.isVertical) {
        v.category = 'Reels & Shorts';
        v.tags = generateTags(v.drive_name, 'Reels & Shorts');
      }
    }
  }));

  return foundVideos;
}

/**
 * Synchronizes Drive files with Supabase DB (with safe fallback)
 */
export async function syncProjects({
  supabaseUrl,
  supabaseKey,
  folderId = DEFAULT_GDRIVE_FOLDER_ID
} = {}) {
  const driveVideos = await fetchDriveFolderVideos(folderId);
  const results = {
    totalScanned: driveVideos.length,
    published: driveVideos.length,
    archived: 0,
    dbStatus: 'unconnected',
    projects: driveVideos
  };

  if (!supabaseUrl || !supabaseKey) {
    return results;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if table exists
    const { data: existing, error: selectError } = await supabase
      .from('projects')
      .select('id, drive_file_id, published');

    if (selectError) {
      console.warn('Supabase projects table not yet created or inaccessible:', selectError.message);
      results.dbStatus = 'table_missing';
      return results;
    }

    results.dbStatus = 'connected';
    const driveIdSet = new Set(driveVideos.map(v => v.drive_file_id));

    // 1. Upsert new/modified Drive videos
    for (const video of driveVideos) {
      const { error: upsertError } = await supabase
        .from('projects')
        .upsert({
          drive_file_id: video.drive_file_id,
          drive_name: video.drive_name,
          title: video.title,
          description: video.description,
          category: video.category,
          tags: video.tags,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          mime_type: video.mime_type,
          file_size: video.file_size,
          sync_status: 'published',
          published: true,
          sort_order: video.sort_order
        }, { onConflict: 'drive_file_id' });

      if (upsertError) {
        console.warn(`Failed to upsert ${video.title}:`, upsertError.message);
      }
    }

    // 2. Mark removed files as archived
    if (existing && existing.length > 0) {
      for (const item of existing) {
        if (!driveIdSet.has(item.drive_file_id) && item.published) {
          await supabase
            .from('projects')
            .update({ published: false, sync_status: 'archived' })
            .eq('id', item.id);
          results.archived++;
        }
      }
    }
  } catch (err) {
    console.warn('Supabase sync error (fallback active):', err.message);
    results.dbStatus = 'error: ' + err.message;
  }

  return results;
}
