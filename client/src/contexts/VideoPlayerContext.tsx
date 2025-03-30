import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type VideoPlayer = HTMLVideoElement | null;

interface VideoPlayerContextType {
  registerPlayer: (id: number, player: VideoPlayer) => void;
  unregisterPlayer: (id: number) => void;
  playVideo: (id: number) => void;
  stopAllExcept: (id: number) => void;
  isLargeVideo: (id: number) => boolean;
}

const VideoPlayerContext = createContext<VideoPlayerContextType>({
  registerPlayer: () => {},
  unregisterPlayer: () => {},
  playVideo: () => {},
  stopAllExcept: () => {},
  isLargeVideo: () => false,
});

export const useVideoPlayer = () => useContext(VideoPlayerContext);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Map<number, VideoPlayer>>(new Map());
  // Track large videos specifically for special handling
  const [largeVideoIds] = useState<number[]>([4, 14, 17]); // ID 4=Socrates(Socrets), 14=John Lennon, 17=Janis Joplin

  // Memory management - clean up unused players
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      players.forEach((player, id) => {
        if (player && !player.paused && player.readyState === 0) {
          console.warn(`Video player ${id} is stuck loading, cleaning up`);
          player.src = ''; // Reset source to release memory
          player.load(); // Force browser to release resources
          
          // Re-register the player to ensure it can be used again
          const playerId = id; // Create a stable reference to the ID
          setTimeout(() => {
            if (player) {
              setPlayers(prev => {
                const newMap = new Map(prev);
                newMap.set(playerId, player);
                return newMap;
              });
            }
          }, 1000);
        }
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(cleanupInterval);
  }, [players]);

  const isLargeVideo = useCallback((id: number) => {
    return largeVideoIds.includes(id);
  }, [largeVideoIds]);

  const registerPlayer = useCallback((id: number, player: VideoPlayer) => {
    setPlayers(prev => {
      const newMap = new Map(prev);
      newMap.set(id, player);
      return newMap;
    });
  }, []);

  const unregisterPlayer = useCallback((id: number) => {
    setPlayers(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const playVideo = useCallback((id: number) => {
    const player = players.get(id);
    if (player) {
      // Set low volume to reduce initial audio pop if there is any
      const originalVolume = player.volume;
      player.volume = 0.1;
      
      // Special handling for large videos
      if (largeVideoIds.includes(id)) {
        // For large videos, ensure metadata is loaded first
        if (player.readyState < 1) { // HAVE_METADATA = 1
          player.load(); // Force metadata loading
          
          // Wait a short time for metadata to load
          setTimeout(() => {
            const playPromise = player.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setTimeout(() => {
                    player.volume = originalVolume;
                  }, 300);
                })
                .catch(err => {
                  console.error(`Error playing large video ${id}:`, err);
                  // If autoplay is prevented, try muting the video then playing
                  if (err.name === 'NotAllowedError') {
                    player.muted = true;
                    player.play().catch(innerErr => console.error(`Still can't play large video ${id}:`, innerErr));
                  }
                });
            }
          }, 500);
          
          return;
        }
      }
      
      // Standard flow for normal videos
      const playPromise = player.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Gradually increase volume to original level
            setTimeout(() => {
              player.volume = originalVolume;
            }, 300);
          })
          .catch(err => {
            console.error(`Error playing video ${id}:`, err);
            // If autoplay is prevented, try muting the video then playing
            if (err.name === 'NotAllowedError') {
              player.muted = true;
              player.play().catch(innerErr => console.error(`Still can't play video ${id}:`, innerErr));
            }
          });
      }
    }
  }, [players, largeVideoIds]);

  const stopAllExcept = useCallback((id: number) => {
    players.forEach((player, playerId) => {
      if (playerId !== id && player) {
        try {
          // Ensure video is fully stopped and unloaded from memory when not in use
          player.pause();
          
          // For large videos, we want to unload them from memory more aggressively
          if (largeVideoIds.includes(playerId)) {
            // Setting currentTime to 0 helps browsers garbage collect video data
            player.currentTime = 0;
            
            // For very large videos, temporarily disable the source to free memory
            // We create a cleanup function to restore the src later if needed
            const originalSrc = player.src;
            if (originalSrc && player.readyState > 0) {
              // Store the current position to restore later if needed
              player.removeAttribute('src');
              player.load(); // Force browser to release resources
              
              // We don't store the original source here since the component will handle that
            }
          } else {
            // For normal-sized videos just reset the time
            player.currentTime = 0;
          }
        } catch (err) {
          console.error(`Error stopping video ${playerId}:`, err);
        }
      }
    });
  }, [players, largeVideoIds]);

  return (
    <VideoPlayerContext.Provider 
      value={{ 
        registerPlayer, 
        unregisterPlayer, 
        playVideo, 
        stopAllExcept,
        isLargeVideo
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};