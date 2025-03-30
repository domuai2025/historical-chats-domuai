import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string | null;
  className?: string;
  compact?: boolean;
  autoPlay?: boolean;
}

export default function AudioPlayer({ 
  audioUrl,
  className,
  compact = false,
  autoPlay = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Stops playing when component unmounts or when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    
    if (audioUrl && autoPlay) {
      // Small delay to ensure the new audio is loaded
      const timer = setTimeout(() => {
        setIsPlaying(true);
        audioRef.current?.play().catch(() => setIsPlaying(false));
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      if (audioRef.current && duration > 0) {
        const currentProgress = (audioRef.current.currentTime / duration) * 100;
        setProgress(currentProgress);
      }
    };

    const loadMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const audioEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    audioRef.current.addEventListener('timeupdate', updateProgress);
    audioRef.current.addEventListener('loadedmetadata', loadMetadata);
    audioRef.current.addEventListener('ended', audioEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('loadedmetadata', loadMetadata);
        audioRef.current.removeEventListener('ended', audioEnded);
      }
    };
  }, [duration]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekAudio = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = (clickX / rect.width) * 100;
    
    // Ensure the percentage is between 0 and 100
    const boundedPercent = Math.max(0, Math.min(100, percentClicked));
    
    // Update the progress visually
    setProgress(boundedPercent);
    
    // Update the audio time
    if (audioRef.current) {
      audioRef.current.currentTime = (boundedPercent / 100) * duration;
    }
  };

  // If no audio URL is provided, don't render the player
  if (!audioUrl) return null;

  return (
    <div className={cn(
      'flex items-center bg-[#34292B] rounded-md border border-amber-200/20 shadow-md overflow-hidden',
      compact ? 'p-1 gap-1 max-w-[120px]' : 'p-2 gap-2',
      className
    )}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
      />
      
      <Button 
        variant="ghost" 
        size={compact ? "sm" : "icon"} 
        onClick={togglePlay}
        className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20"
      >
        {isPlaying ? <Pause size={compact ? 16 : 20} /> : <Play size={compact ? 16 : 20} />}
      </Button>
      
      {!compact && (
        <div 
          ref={progressBarRef}
          className="relative h-2 flex-grow rounded-full bg-amber-950 cursor-pointer"
          onClick={seekAudio}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {!compact && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>
      )}
    </div>
  );
}