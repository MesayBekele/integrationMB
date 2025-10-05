import axios from 'axios';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export class SubtitleService {
  private s3Client: S3Client;
  private openSubtitlesApiKey: string;
  private openSubtitlesBaseUrl: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    this.openSubtitlesApiKey = process.env.OPENSUBTITLES_API_KEY!;
    this.openSubtitlesBaseUrl = process.env.OPENSUBTITLES_API_URL || 'https://api.opensubtitles.com/api/v1';
  }

  /**
   * Search for subtitles by movie title or IMDB ID
   */
  async searchSubtitles(query: string, imdbId?: string, language = 'en'): Promise<SubtitleSearchResult[]> {
    try {
      const params: any = {
        languages: language,
        order_by: 'download_count',
        order_direction: 'desc'
      };

      if (imdbId) {
        params.imdb_id = imdbId.replace('tt', '');
      } else {
        params.query = query;
      }

      const response = await axios.get(`${this.openSubtitlesBaseUrl}/subtitles`, {
        params,
        headers: {
          'Api-Key': this.openSubtitlesApiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'SubtitleGuardian v1.0'
        }
      });

      return response.data.data.map((subtitle: any) => ({
        id: subtitle.attributes.subtitle_id,
        movieTitle: subtitle.attributes.feature_details.movie_name,
        year: subtitle.attributes.feature_details.year,
        language: subtitle.attributes.language,
        downloadUrl: subtitle.attributes.url,
        downloadCount: subtitle.attributes.download_count,
        rating: subtitle.attributes.ratings,
        uploader: subtitle.attributes.uploader.name,
        imdbId: subtitle.attributes.feature_details.imdb_id
      }));
    } catch (error) {
      console.error('Error searching subtitles:', error);
      throw new Error('Failed to search subtitles');
    }
  }

  /**
   * Download subtitle file and store in S3
   */
  async downloadAndStoreSubtitle(downloadUrl: string, movieId: string, language: string): Promise<string> {
    try {
      // Download subtitle file
      const response = await axios.get(downloadUrl, {
        headers: {
          'Api-Key': this.openSubtitlesApiKey,
          'User-Agent': 'SubtitleGuardian v1.0'
        }
      });

      const subtitleContent = response.data;
      const s3Key = `subtitles/${movieId}/${language}/${Date.now()}.srt`;

      // Store in S3
      await this.s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: subtitleContent,
        ContentType: 'text/plain',
        Metadata: {
          movieId,
          language,
          downloadedAt: new Date().toISOString()
        }
      }));

      return s3Key;
    } catch (error) {
      console.error('Error downloading subtitle:', error);
      throw new Error('Failed to download and store subtitle');
    }
  }

  /**
   * Retrieve subtitle content from S3
   */
  async getSubtitleContent(s3Key: string): Promise<string> {
    try {
      const response = await this.s3Client.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key
      }));

      const content = await response.Body?.transformToString();
      return content || '';
    } catch (error) {
      console.error('Error retrieving subtitle from S3:', error);
      throw new Error('Failed to retrieve subtitle content');
    }
  }

  /**
   * Parse SRT subtitle format to extract text content
   */
  parseSubtitleContent(srtContent: string): SubtitleLine[] {
    const lines = srtContent.split('\n');
    const subtitles: SubtitleLine[] = [];
    let currentSubtitle: Partial<SubtitleLine> = {};
    let state = 'index'; // index, timestamp, text

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        if (currentSubtitle.index && currentSubtitle.timestamp && currentSubtitle.text) {
          subtitles.push(currentSubtitle as SubtitleLine);
          currentSubtitle = {};
          state = 'index';
        }
        continue;
      }

      switch (state) {
        case 'index':
          if (/^\d+$/.test(line)) {
            currentSubtitle.index = parseInt(line);
            state = 'timestamp';
          }
          break;
        case 'timestamp':
          if (line.includes('-->')) {
            const [start, end] = line.split('-->').map(t => t.trim());
            currentSubtitle.timestamp = { start, end };
            currentSubtitle.text = '';
            state = 'text';
          }
          break;
        case 'text':
          currentSubtitle.text += (currentSubtitle.text ? ' ' : '') + line;
          break;
      }
    }

    // Add the last subtitle if it exists
    if (currentSubtitle.index && currentSubtitle.timestamp && currentSubtitle.text) {
      subtitles.push(currentSubtitle as SubtitleLine);
    }

    return subtitles;
  }

  /**
   * Extract plain text from subtitle lines for analysis
   */
  extractTextForAnalysis(subtitleLines: SubtitleLine[]): string {
    return subtitleLines
      .map(line => line.text)
      .join(' ')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\{[^}]*\}/g, '') // Remove formatting tags
      .replace(/\[[^\]]*\]/g, '') // Remove sound descriptions
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

export interface SubtitleSearchResult {
  id: string;
  movieTitle: string;
  year: number;
  language: string;
  downloadUrl: string;
  downloadCount: number;
  rating: number;
  uploader: string;
  imdbId: string;
}

export interface SubtitleLine {
  index: number;
  timestamp: {
    start: string;
    end: string;
  };
  text: string;
}

