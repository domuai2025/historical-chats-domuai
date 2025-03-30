import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStorageStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RefreshCwIcon, HardDriveIcon, FileIcon } from 'lucide-react';

type FileTypeStats = {
  count: number;
  size: number;
  sizeHuman: string;
  percentage: number;
};

type StorageStats = {
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
      [ext: string]: FileTypeStats;
    };
  };
};

export default function StorageStatsPanel() {
  const [expanded, setExpanded] = useState(false);
  
  const { data: stats, isLoading, isError, refetch, isFetching } = useQuery<StorageStats>({
    queryKey: ['/api/admin/storage-stats'],
    queryFn: getStorageStats,
    refetchOnWindowFocus: false,
  });
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  // Sort file types by size (largest first)
  const sortedFileTypes = stats && Object.entries(stats.uploads.fileTypes)
    .sort(([, a], [, b]) => b.size - a.size);
  
  // Sort directories by size (largest first)
  const sortedDirectories = stats && Object.entries(stats.directories)
    .sort(([, a], [, b]) => b.size - a.size);
  
  return (
    <Card className="border-gold/30 shadow-vintage mb-8">
      <CardHeader className="bg-burgundy/5">
        <CardTitle className="text-2xl font-playfair text-burgundy flex items-center justify-between">
          <div className="flex items-center">
            <HardDriveIcon className="w-5 h-5 mr-2" />
            Storage Statistics
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-burgundy text-burgundy hover:bg-burgundy/10"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCwIcon className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription className="text-darkbrown/70">
          View detailed information about your storage usage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-darkbrown">Loading storage statistics...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-700">Failed to load storage statistics. Please try refreshing.</p>
          </div>
        ) : stats ? (
          <div>
            <div className="bg-beige/50 rounded-md p-6 border border-gold/20 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-darkbrown">Total Storage Usage</h3>
                <span className="text-darkbrown font-medium">{stats.total.sizeHuman}</span>
              </div>
              
              <div className="space-y-4">
                {sortedDirectories?.slice(0, expanded ? undefined : 5).map(([dir, dirStats]) => (
                  <div key={dir} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-darkbrown/80">/{dir}</span>
                      <span className="text-darkbrown/80">{dirStats.sizeHuman} ({dirStats.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={dirStats.percentage} className="h-2 bg-beige/50" />
                  </div>
                ))}
                
                {!expanded && sortedDirectories && sortedDirectories.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-burgundy hover:text-burgundy/80 hover:bg-burgundy/10 mt-2"
                    onClick={toggleExpanded}
                  >
                    Show {sortedDirectories.length - 5} more directories
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-beige/50 rounded-md p-6 border border-gold/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-darkbrown">Uploads Breakdown</h3>
                <div className="text-sm text-darkbrown/80">
                  <span className="font-medium">{stats.uploads.totalFiles}</span> files • 
                  <span className="font-medium ml-1">{stats.uploads.totalSizeHuman}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {sortedFileTypes?.slice(0, expanded ? undefined : 5).map(([ext, fileStats]) => (
                  <div key={ext} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <FileIcon className="w-3 h-3 mr-1 text-darkbrown/60" />
                        <span className="font-medium text-darkbrown/80">{ext} ({fileStats.count} files)</span>
                      </span>
                      <span className="text-darkbrown/80">{fileStats.sizeHuman} ({fileStats.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={fileStats.percentage} className="h-2 bg-beige/50" />
                  </div>
                ))}
                
                {!expanded && sortedFileTypes && sortedFileTypes.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-burgundy hover:text-burgundy/80 hover:bg-burgundy/10 mt-2"
                    onClick={toggleExpanded}
                  >
                    Show {sortedFileTypes.length - 5} more file types
                  </Button>
                )}
                
                {expanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-burgundy hover:text-burgundy/80 hover:bg-burgundy/10 mt-2"
                    onClick={toggleExpanded}
                  >
                    Show less
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}