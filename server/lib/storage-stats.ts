import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

/**
 * Gets the size of a file or directory in bytes
 * If it's a directory, gets the sum of all files inside recursively
 * 
 * @param itemPath Path to the file or directory
 * @returns Size in bytes
 */
function getItemSize(itemPath: string): number {
  try {
    const stats = fs.statSync(itemPath);
    
    if (stats.isFile()) {
      return stats.size;
    } else if (stats.isDirectory()) {
      let totalSize = 0;
      const items = fs.readdirSync(itemPath);
      
      for (const item of items) {
        const fullPath = path.join(itemPath, item);
        totalSize += getItemSize(fullPath);
      }
      
      return totalSize;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error getting size for ${itemPath}:`, error);
    return 0;
  }
}

/**
 * Gets statistics about file types in a directory
 * 
 * @param dirPath Path to the directory
 * @returns Object with count and total size for each file extension
 */
function getFileTypeStats(dirPath: string): { [ext: string]: { count: number; size: number } } {
  const result: { [ext: string]: { count: number; size: number } } = {};
  
  try {
    const processDir = (currentPath: string) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isFile()) {
          const ext = path.extname(item).toLowerCase() || 'no-extension';
          
          if (!result[ext]) {
            result[ext] = { count: 0, size: 0 };
          }
          
          result[ext].count++;
          result[ext].size += stats.size;
        } else if (stats.isDirectory()) {
          processDir(fullPath);
        }
      }
    };
    
    processDir(dirPath);
  } catch (error) {
    console.error(`Error getting file type stats for ${dirPath}:`, error);
  }
  
  return result;
}

/**
 * Gets detailed storage statistics for the application
 * 
 * @returns Object with detailed storage stats
 */
export async function getStorageStats(): Promise<{
  total: {
    size: number;
    sizeHuman: string;
  };
  directories: {
    [dir: string]: {
      size: number;
      sizeHuman: string;
      percentage: number;
    };
  };
  uploads: {
    totalFiles: number;
    totalSize: number;
    totalSizeHuman: string;
    fileTypes: {
      [ext: string]: {
        count: number;
        size: number;
        sizeHuman: string;
        percentage: number;
      };
    };
  };
}> {
  try {
    // Get overall size
    const totalSize = getItemSize(rootDir);
    
    // Get size of main directories
    const dirsToCheck = ['uploads', 'data', 'client', 'server', 'node_modules'];
    const dirStats: {
      [dir: string]: {
        size: number;
        sizeHuman: string;
        percentage: number;
      };
    } = {};
    
    for (const dir of dirsToCheck) {
      const dirPath = path.join(rootDir, dir);
      
      if (fs.existsSync(dirPath)) {
        const size = getItemSize(dirPath);
        dirStats[dir] = {
          size,
          sizeHuman: formatBytes(size),
          percentage: (size / totalSize) * 100
        };
      }
    }
    
    // Get details about uploads folder
    const uploadsPath = path.join(rootDir, 'uploads');
    let uploadsStats = {
      totalFiles: 0,
      totalSize: 0,
      totalSizeHuman: '0 B',
      fileTypes: {} as {
        [ext: string]: {
          count: number;
          size: number;
          sizeHuman: string;
          percentage: number;
        };
      }
    };
    
    if (fs.existsSync(uploadsPath)) {
      const fileTypeStats = getFileTypeStats(uploadsPath);
      let totalFiles = 0;
      let totalSize = 0;
      
      for (const ext in fileTypeStats) {
        totalFiles += fileTypeStats[ext].count;
        totalSize += fileTypeStats[ext].size;
      }
      
      const fileTypesDetailed: {
        [ext: string]: {
          count: number;
          size: number;
          sizeHuman: string;
          percentage: number;
        };
      } = {};
      
      for (const ext in fileTypeStats) {
        fileTypesDetailed[ext] = {
          count: fileTypeStats[ext].count,
          size: fileTypeStats[ext].size,
          sizeHuman: formatBytes(fileTypeStats[ext].size),
          percentage: (fileTypeStats[ext].size / totalSize) * 100
        };
      }
      
      uploadsStats = {
        totalFiles,
        totalSize,
        totalSizeHuman: formatBytes(totalSize),
        fileTypes: fileTypesDetailed
      };
    }
    
    return {
      total: {
        size: totalSize,
        sizeHuman: formatBytes(totalSize)
      },
      directories: dirStats,
      uploads: uploadsStats
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
}

/**
 * Format bytes to human-readable string
 * 
 * @param bytes Bytes to format
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}