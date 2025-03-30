import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

// Create thumbnails directory if it doesn't exist
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
  console.log(`Created thumbnails directory at: ${thumbnailDir}`);
}

/**
 * Generates a thumbnail from a video file
 * 
 * @param videoPath The path to the video file
 * @param options Options for thumbnail generation
 * @returns Promise with the path to the generated thumbnail
 */
export async function generateThumbnail(
  videoPath: string,
  options: {
    timestamp?: string; // Timestamp to take thumbnail at (default: '00:00:01')
    size?: string;      // Size of thumbnail (default: '320x180')
    quality?: number;   // JPEG quality 1-100 (default: 90)
  } = {}
): Promise<string> {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const timestamp = options.timestamp || '00:00:01';
  const size = options.size || '320x180';
  const quality = options.quality || 90;
  
  // Get the base filename without extension
  const videoBaseName = path.basename(videoPath, path.extname(videoPath));
  const thumbnailPath = path.join(thumbnailDir, `${videoBaseName}.jpg`);
  
  return new Promise((resolve, reject) => {
    // Use ffmpeg to generate a thumbnail
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,                // Input file
      '-ss', timestamp,               // Timestamp to take thumbnail at
      '-vframes', '1',                // Extract 1 frame
      '-vf', `scale=${size}`,         // Resize the frame
      '-q:v', quality.toString(),     // JPEG quality
      '-y',                           // Overwrite output files
      thumbnailPath                   // Output file
    ]);
    
    let errorOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`Generated thumbnail: ${thumbnailPath}`);
        resolve(thumbnailPath);
      } else {
        reject(new Error(`Failed to generate thumbnail: ${errorOutput}`));
      }
    });
  });
}

/**
 * Batch generates thumbnails for all videos in the uploads directory
 * 
 * @param options Thumbnail generation options
 * @returns Array of generated thumbnail paths
 */
export async function batchGenerateThumbnails(
  options: {
    timestamp?: string;
    size?: string;
    quality?: number;
  } = {}
): Promise<string[]> {
  // Get all video files in the uploads directory
  const videoFiles = fs.readdirSync(uploadDir)
    .filter(file => file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm'))
    .map(file => path.join(uploadDir, file));
  
  console.log(`Found ${videoFiles.length} video files to process`);
  
  const results: string[] = [];
  let successCount = 0;
  let failCount = 0;
  
  // Process videos sequentially to avoid overwhelming the system
  for (const videoPath of videoFiles) {
    try {
      const thumbnailPath = await generateThumbnail(videoPath, options);
      results.push(thumbnailPath);
      successCount++;
    } catch (error) {
      console.error(`Error generating thumbnail for ${videoPath}:`, error);
      failCount++;
    }
  }
  
  console.log(`Thumbnail generation complete. Success: ${successCount}, Failed: ${failCount}`);
  return results;
}

/**
 * Gets the thumbnail path for a given video URL
 * If the thumbnail doesn't exist, it returns null
 * 
 * @param videoUrl The URL of the video (e.g., /uploads/video.mp4)
 * @returns The URL of the thumbnail or null if it doesn't exist
 */
export function getThumbnailUrl(videoUrl: string): string | null {
  if (!videoUrl) return null;
  
  // Extract the filename from the video URL
  const videoFileName = path.basename(videoUrl);
  const baseFileName = path.basename(videoFileName, path.extname(videoFileName));
  const thumbnailPath = path.join(thumbnailDir, `${baseFileName}.jpg`);
  
  // Check if the thumbnail file exists
  if (fs.existsSync(thumbnailPath)) {
    return `/uploads/thumbnails/${baseFileName}.jpg`;
  }
  
  return null;
}