import React, { createContext, useContext, useState, useCallback } from 'react';

type VideoPlayer = HTMLVideoElement | null;

interface VideoPlayerContextType {
  registerPlayer: (id: number, player: VideoPlayer) => void;
  unregisterPlayer: (id: number) => void;
  playVideo: (id: number) => void;
  stopAllExcept: (id: number) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType>({
  registerPlayer: () => {},
  unregisterPlayer: () => {},
  playVideo: () => {},
  stopAllExcept: () => {},
});

export const useVideoPlayer = () => useContext(VideoPlayerContext);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Map<number, VideoPlayer>>(new Map());

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
      
      // Use promise with timeout to handle slow loading videos
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
            console.error("Error playing video:", err);
            // If autoplay is prevented, try muting the video then playing
            if (err.name === 'NotAllowedError') {
              player.muted = true;
              player.play().catch(innerErr => console.error("Still can't play video:", innerErr));
            }
          });
      }
    }
  }, [players]);

  const stopAllExcept = useCallback((id: number) => {
    players.forEach((player, playerId) => {
      if (playerId !== id && player) {
        try {
          // Ensure video is fully stopped and unloaded from memory when not in use
          player.pause();
          
          // For large videos, we want to unload them from memory
          // Setting currentTime to 0 helps browsers garbage collect video data
          player.currentTime = 0;
          
          // Setting empty src can help free memory for large videos in some browsers
          // We don't do this here since it would require reloading the video when showing it again
        } catch (err) {
          console.error("Error stopping video:", err);
        }
      }
    });
  }, [players]);

  return (
    <VideoPlayerContext.Provider 
      value={{ 
        registerPlayer, 
        unregisterPlayer, 
        playVideo, 
        stopAllExcept 
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};