import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
const dataDir = path.join(__dirname, '../../data');
const videoUrlsFile = path.join(dataDir, 'video-urls.json');

/**
 * Synchronizes the actual files in the uploads directory with the 
 * video URLs stored in the database, and cleans up any unused files.
 * 
 * @returns Object with statistics about the cleanup operation
 */
export async function cleanupUnusedFiles(): Promise<{
  totalFiles: number;
  usedFiles: number;
  deletedFiles: number;
  savedSpace: number;
}> {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Get video URLs from database (stored in video-urls.json)
    let videoUrls: string[] = [];
    if (fs.existsSync(videoUrlsFile)) {
      try {
        const videoUrlsData = fs.readFileSync(videoUrlsFile, 'utf8');
        videoUrls = JSON.parse(videoUrlsData);
      } catch (error) {
        console.error('Error reading video URLs file:', error);
      }
    }

    // Extract filenames from URLs
    const usedFilenames = videoUrls.map(url => {
      // Handle both /uploads/filename.mp4 and /uploads/optimized/filename.mp4 formats
      const parts = url.split('/');
      return parts[parts.length - 1];
    });

    console.log(`Found ${usedFilenames.length} videos referenced in the database`);

    // Get all files in the uploads directory
    const allVideoFiles: string[] = [];
    
    // Read the uploads directory
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        // Only process files (not directories) and video files
        if (stats.isFile() && (file.endsWith('.mp4') || file.endsWith('.webm'))) {
          allVideoFiles.push(file);
        }
      }
      
      // Also check the optimized directory if it exists
      const optimizedDir = path.join(uploadDir, 'optimized');
      if (fs.existsSync(optimizedDir)) {
        const optimizedFiles = fs.readdirSync(optimizedDir);
        for (const file of optimizedFiles) {
          const filePath = path.join(optimizedDir, file);
          const stats = fs.statSync(filePath);
          
          // Add with the prefix 'optimized/'
          if (stats.isFile() && (file.endsWith('.mp4') || file.endsWith('.webm'))) {
            allVideoFiles.push(`optimized/${file}`);
          }
        }
      }
    }

    console.log(`Found ${allVideoFiles.length} video files in the uploads directory`);

    // Find unused files
    const unusedFiles = allVideoFiles.filter(file => {
      // For files in the optimized directory, we need to extract just the filename
      const filename = file.includes('/') ? file.split('/').pop()! : file;
      return !usedFilenames.includes(filename);
    });

    console.log(`Found ${unusedFiles.length} unused video files`);

    // Delete unused files and calculate saved space
    let savedSpace = 0;
    let deletedCount = 0;

    for (const file of unusedFiles) {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        savedSpace += stats.size;
        
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted unused file: ${file}, size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
      }
    }

    const savedSpaceMB = savedSpace / 1024 / 1024;
    console.log(`Cleanup complete. Deleted ${deletedCount} files, saved ${savedSpaceMB.toFixed(2)} MB of space`);

    return {
      totalFiles: allVideoFiles.length,
      usedFiles: usedFilenames.length,
      deletedFiles: deletedCount,
      savedSpace: savedSpaceMB
    };
  } catch (error) {
    console.error('Error during cleanup process:', error);
    throw error;
  }
}

/**
 * Reorganizes the uploads folder by moving all content into appropriate subdirectories
 * for better organization and management
 */
export async function reorganizeUploadsFolder(): Promise<{
  moveCount: number;
  errorCount: number;
}> {
  try {
    // Create category subdirectories if they don't exist
    const categories = ['videos', 'optimized', 'audio', 'images', 'temp'];
    
    for (const category of categories) {
      const categoryPath = path.join(uploadDir, category);
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
        console.log(`Created directory: ${categoryPath}`);
      }
    }

    // Only process files directly in the uploads folder (not in subdirectories)
    const files = fs.readdirSync(uploadDir);
    let moveCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      // Skip directories
      if (!stats.isFile()) continue;
      
      try {
        let targetDir = '';
        
        // Determine target directory based on file extension
        if (file.match(/\.(mp4|webm|mov|avi)$/i)) {
          targetDir = 'videos';
        } else if (file.match(/\.(mp3|wav|ogg|m4a)$/i)) {
          targetDir = 'audio';
        } else if (file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          targetDir = 'images';
        } else {
          targetDir = 'temp';
        }
        
        const targetPath = path.join(uploadDir, targetDir, file);
        
        // Check if destination already exists
        if (fs.existsSync(targetPath)) {
          console.log(`File already exists at destination: ${targetPath}`);
          // Delete the source file as it's a duplicate
          fs.unlinkSync(filePath);
        } else {
          // Move the file
          fs.renameSync(filePath, targetPath);
          moveCount++;
          console.log(`Moved ${file} to ${targetDir}/`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Reorganization complete. Moved ${moveCount} files, encountered ${errorCount} errors`);
    
    return {
      moveCount,
      errorCount
    };
  } catch (error) {
    console.error('Error during folder reorganization:', error);
    throw error;
  }
}

/**
 * Performs a full maintenance routine on the storage system
 */
export async function performFullMaintenance(): Promise<{
  cleanupStats: any;
  reorganizeStats: any;
}> {
  console.log('Starting full storage maintenance...');
  
  try {
    // First clean up unused files
    const cleanupStats = await cleanupUnusedFiles();
    
    // Then reorganize the folder structure
    const reorganizeStats = await reorganizeUploadsFolder();
    
    console.log('Storage maintenance completed successfully');
    
    return {
      cleanupStats,
      reorganizeStats
    };
  } catch (error) {
    console.error('Error during storage maintenance:', error);
    throw error;
  }
}