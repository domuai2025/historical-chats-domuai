import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
const optimizedDir = path.join(uploadDir, 'optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
  console.log(`Created optimized video directory at: ${optimizedDir}`);
}

interface OptimizationOptions {
  maxWidth?: number;         // Maximum width in pixels (default: 720)
  videoBitrate?: string;     // Video bitrate (default: '1M')
  audioBitrate?: string;     // Audio bitrate (default: '128k')
  format?: 'mp4' | 'webm';   // Output format (default: 'mp4')
  preset?: string;           // FFmpeg preset (default: 'medium')
  deleteOriginal?: boolean;  // Whether to delete the original after optimization (default: false)
}

const defaultOptions: OptimizationOptions = {
  maxWidth: 720,
  videoBitrate: '1M',
  audioBitrate: '128k',
  format: 'mp4',
  preset: 'medium',
  deleteOriginal: false
};

/**
 * Compresses a video file using FFmpeg with optimized settings for web
 * 
 * @param inputPath Full path to the input video file
 * @param options Optional optimization parameters
 * @returns Promise with the path to the optimized video
 */
export async function optimizeVideo(
  inputPath: string, 
  options: OptimizationOptions = {}
): Promise<string> {
  // Merge default options with provided options
  const config = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const inputFile = path.basename(inputPath);
    const outputFile = `optimized-${path.parse(inputFile).name}.${config.format}`;
    const outputPath = path.join(optimizedDir, outputFile);
    
    // FFmpeg arguments for optimization
    const args = [
      '-i', inputPath,                           // Input file
      '-vf', `scale='min(${config.maxWidth},iw)':-2`,  // Scale down to max width while maintaining aspect ratio
      '-c:v', 'libx264',                         // Video codec
      '-crf', '23',                              // Constant Rate Factor (quality)
      '-preset', config.preset!,                 // Compression preset
      '-b:v', config.videoBitrate!,              // Video bitrate
      '-c:a', 'aac',                             // Audio codec
      '-b:a', config.audioBitrate!,              // Audio bitrate
      '-movflags', '+faststart',                 // Optimize for web streaming
      '-y',                                      // Overwrite output file if it exists
      outputPath                                 // Output file
    ];
    
    console.log(`Optimizing video: ${inputFile}`);
    console.log(`FFmpeg command: ffmpeg ${args.join(' ')}`);
    
    // Spawn FFmpeg process
    const ffmpeg = spawn('ffmpeg', args);
    
    // Collect output
    let stdoutChunks: Buffer[] = [];
    let stderrChunks: Buffer[] = [];
    
    ffmpeg.stdout.on('data', (data) => {
      stdoutChunks.push(data);
    });
    
    ffmpeg.stderr.on('data', (data) => {
      stderrChunks.push(data);
    });
    
    // Handle process completion
    ffmpeg.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString();
      const stderr = Buffer.concat(stderrChunks).toString();
      
      if (code === 0) {
        console.log(`Video optimization complete: ${outputPath}`);
        
        // Check compression results
        try {
          const originalSize = fs.statSync(inputPath).size;
          const optimizedSize = fs.statSync(outputPath).size;
          const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
          
          console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`Space saved: ${savingsPercent}%`);
          
          // Delete original if requested
          if (config.deleteOriginal) {
            fs.unlinkSync(inputPath);
            console.log(`Original file deleted: ${inputPath}`);
          }
          
          // Resolve with the path relative to uploads folder
          resolve(`/uploads/optimized/${outputFile}`);
        } catch (error) {
          console.error('Error checking file sizes:', error);
          reject(error);
        }
      } else {
        console.error(`FFmpeg process exited with code ${code}`);
        console.error('FFmpeg stderr output:', stderr);
        reject(new Error(`Video optimization failed with code ${code}: ${stderr}`));
      }
    });
    
    // Handle process errors
    ffmpeg.on('error', (err) => {
      console.error('Failed to start FFmpeg process:', err);
      reject(err);
    });
  });
}

/**
 * Batch optimize multiple videos in the uploads folder
 * 
 * @param options Optimization options
 * @returns Promise with an array of optimized video paths
 */
export async function batchOptimizeExistingVideos(
  options: OptimizationOptions = {}
): Promise<string[]> {
  // Find all MP4 files in the uploads directory
  const files = fs.readdirSync(uploadDir)
    .filter(file => file.endsWith('.mp4') && !fs.statSync(path.join(uploadDir, file)).isDirectory());
  
  console.log(`Found ${files.length} videos to optimize`);
  
  // Process files in small batches to avoid memory issues
  const results: string[] = [];
  const batchSize = 3; // Process 3 videos at a time
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchPromises = batch.map(file => {
      const inputPath = path.join(uploadDir, file);
      return optimizeVideo(inputPath, options)
        .catch(err => {
          console.error(`Failed to optimize ${file}:`, err);
          return null; // Continue with other videos even if one fails
        });
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean) as string[]);
    
    console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`);
  }
  
  return results;
}

/**
 * Clean up unused video files to save space
 * 
 * @param keepList List of video URLs to keep (from video-urls.json)
 * @returns Number of files deleted
 */
export function cleanupUnusedVideos(keepList: string[]): number {
  try {
    // Normalize paths in keepList to just filenames
    const keepFilenames = keepList.map(url => path.basename(url));
    
    // Get all MP4 files in uploads directory
    const allFiles = fs.readdirSync(uploadDir)
      .filter(file => 
        file.endsWith('.mp4') && 
        !fs.statSync(path.join(uploadDir, file)).isDirectory()
      );
    
    // Find files not in the keep list
    const filesToDelete = allFiles.filter(file => !keepFilenames.includes(file));
    
    console.log(`Found ${filesToDelete.length} unused video files to delete`);
    
    // Delete unused files
    let deletedCount = 0;
    for (const file of filesToDelete) {
      const filePath = path.join(uploadDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted unused video: ${file}`);
      } catch (err) {
        console.error(`Failed to delete ${file}:`, err);
      }
    }
    
    console.log(`Deleted ${deletedCount} unused video files`);
    return deletedCount;
  } catch (error) {
    console.error('Error in cleanup process:', error);
    return 0;
  }
}