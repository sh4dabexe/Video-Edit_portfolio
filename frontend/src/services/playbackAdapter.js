/**
 * Playback Adapter Layer
 * Provides an extensible, provider-independent abstraction between portfolio
 * project metadata and video player components.
 *
 * Current Provider: Google Drive Direct Playback
 * Future Providers: Cloudflare Stream, AWS CloudFront, BunnyCDN, etc.
 */

export class GoogleDrivePlaybackAdapter {
  constructor(options = {}) {
    this.name = 'GoogleDrive';
    this.options = options;
  }

  /**
   * Resolves a project into a standardized playable stream source
   */
  resolveSource(project) {
    if (!project) return null;
    const fileId = project.drive_file_id || project.id;
    
    // Direct stream link for HTML5 <video> tag
    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    
    // Fallback embedded preview iframe if third-party cookies or browser blocks direct GDrive video download
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    
    // High-resolution poster thumbnail
    const posterUrl = project.thumbnail_url || `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

    return {
      provider: 'gdrive',
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || [],
      // Primary direct HTML5 video stream
      src: directUrl,
      mimeType: project.mime_type || 'video/mp4',
      poster: posterUrl,
      // Fallback embed url
      fallbackEmbedUrl: embedUrl,
      aspectRatio: '16:9',
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
      aspectRatio: '16:9',
      isDirectPlayable: true
    };
  }
}

/**
 * Playback Adapter Registry / Factory
 */
class PlaybackManager {
  constructor() {
    this.adapters = {
      gdrive: new GoogleDrivePlaybackAdapter(),
      cdn: new CDNPlaybackAdapter()
    };
    this.defaultProvider = 'gdrive';
  }

  registerAdapter(name, adapter) {
    this.adapters[name] = adapter;
  }

  getPlaybackSource(project, providerOverride) {
    const provider = providerOverride || project?.playback_provider || this.defaultProvider;
    const adapter = this.adapters[provider] || this.adapters[this.defaultProvider];
    return adapter.resolveSource(project);
  }
}

export const playbackManager = new PlaybackManager();
export const getPlaybackSource = (project, provider) => playbackManager.getPlaybackSource(project, provider);
