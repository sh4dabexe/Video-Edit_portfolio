/**
 * Playback Adapter Layer (Backend)
 */

export class GoogleDrivePlaybackAdapter {
  constructor(options = {}) {
    this.name = 'GoogleDrive';
    this.options = options;
  }

  resolveSource(project) {
    if (!project) return null;
    const fileId = project.drive_file_id || project.id;
    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const posterUrl = project.thumbnail_url || `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

    return {
      provider: 'gdrive',
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || [],
      src: directUrl,
      mimeType: project.mime_type || 'video/mp4',
      poster: posterUrl,
      fallbackEmbedUrl: embedUrl,
      aspectRatio: project.aspect_ratio || '16:9',
      is_vertical: project.is_vertical || false,
      isDirectPlayable: true
    };
  }
}

export class CDNPlaybackAdapter {
  constructor(options = {}) {
    this.name = 'CDN';
    this.baseUrl = options.baseUrl || 'https://cdn.example.com/videos';
  }

  resolveSource(project) {
    if (!project) return null;
    const slug = project.slug || project.drive_file_id || project.id;
    return {
      provider: 'cdn',
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || [],
      src: `${this.baseUrl}/${slug}.mp4`,
      mimeType: 'video/mp4',
      poster: project.thumbnail_url,
      fallbackEmbedUrl: null,
      aspectRatio: project.aspect_ratio || '16:9',
      is_vertical: project.is_vertical || false,
      isDirectPlayable: true
    };
  }
}

class PlaybackManager {
  constructor() {
    this.adapters = {
      gdrive: new GoogleDrivePlaybackAdapter(),
      cdn: new CDNPlaybackAdapter()
    };
    this.defaultProvider = 'gdrive';
  }

  getPlaybackSource(project, providerOverride) {
    const provider = providerOverride || project?.playback_provider || this.defaultProvider;
    const adapter = this.adapters[provider] || this.adapters[this.defaultProvider];
    return adapter.resolveSource(project);
  }
}

export const playbackManager = new PlaybackManager();
export const getPlaybackSource = (project, provider) => playbackManager.getPlaybackSource(project, provider);
