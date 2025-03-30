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
      player.play().catch(err => console.error("Error playing video:", err));
    }
  }, [players]);

  const stopAllExcept = useCallback((id: number) => {
    players.forEach((player, playerId) => {
      if (playerId !== id && player) {
        player.pause();
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