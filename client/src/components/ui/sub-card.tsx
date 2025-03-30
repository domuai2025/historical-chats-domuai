import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, PauseCircle } from 'lucide-react';
import { ShareButton } from '@/components/ui/share-button';
import { Sub } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';

interface SubCardProps {
  sub: Sub;
  hasVideo?: boolean;
  videoSrc?: string;
  onUploadClick?: (subId: number) => void;
}

export default function SubCard({ sub, hasVideo = false, videoSrc, onUploadClick }: SubCardProps) {
  // TypeScript fix for null values in avatarUrl
  const avatarUrl = sub.avatarUrl || undefined;
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { registerPlayer, unregisterPlayer, stopAllExcept, isLargeVideo } = useVideoPlayer();
  
  // Register and unregister the video player with the context
  useEffect(() => {
    if (videoRef.current) {
      registerPlayer(sub.id, videoRef.current);
    }
    
    return () => {
      unregisterPlayer(sub.id);
    };
  }, [sub.id, registerPlayer, unregisterPlayer]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Stop all other videos before playing this one
      stopAllExcept(sub.id);
      
      // Play this video
      if (videoRef.current) {
        videoRef.current.play()
          .catch(err => console.error("Error playing video:", err));
      }
    } else {
      // Pause this video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Generate a unique URL for sharing this specific sub
  const shareUrl = `${window.location.origin}/chat/${sub.id}`;
  
  return (
    <div 
      className="relative overflow-hidden rounded-md border border-gold/30 bg-cream transition-all duration-300 hover:shadow-md steampunk-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        {hasVideo ? (
          <>
            {/* Play/pause button overlay */}
            <div 
              className={`absolute bottom-2 right-2 z-10 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-70'}`}
              onClick={handlePlayPause}
            >
              <div className="rounded-full bg-cream/90 p-2 shadow-lg cursor-pointer hover:bg-cream">
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-burgundy">
                    <rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-burgundy">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </div>
            </div>
            
            {/* Always show the image no matter what */}
            <div className="absolute inset-0 z-0">
              {sub.avatarUrl ? (
                <img 
                  src={sub.avatarUrl} 
                  alt={sub.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div 
                  className="h-full w-full flex items-center justify-center font-serif text-6xl"
                  style={{ 
                    backgroundColor: sub.bgColor || '#7D2B35',
                    color: '#F5EDD7',
                  }}
                >
                  {sub.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            
            {/* Video element that only shows when playing */}
            <video 
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              poster={sub.avatarUrl || undefined}
              autoPlay={false}
              loop
              playsInline
              preload="none"
              muted={false}
              controls={isPlaying}
              style={{ display: isPlaying ? 'block' : 'none' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              {videoSrc && <source src={videoSrc} type="video/mp4" />}
              Your browser does not support the video tag.
            </video>
          </>
        ) : (
          sub.avatarUrl ? (
            <img 
              src={sub.avatarUrl} 
              alt={sub.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div 
              className="h-full w-full flex items-center justify-center font-serif text-6xl"
              style={{ 
                backgroundColor: sub.bgColor || '#7D2B35',
                color: '#F5EDD7',
              }}
            >
              {sub.name.split(' ').map(n => n[0]).join('')}
            </div>
          )
        )}
        
        {/* Share button in the top-right corner */}
        <div className="absolute right-2 top-2 z-20">
          <ShareButton 
            url={shareUrl}
            title={`Share ${sub.name}'s profile`} 
            variant="icon"
            className="bg-cream/80 hover:bg-cream shadow-sm"
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-xl font-medium gold-shimmer-text">{sub.name}</h3>
        <p className="text-sm text-darkbrown/80 italic">{sub.title}</p>
        
        <div className="mt-4 space-y-2">
          <Link href={`/chat/${sub.id}`}>
            <Button 
              className="w-full bg-burgundy text-cream hover:bg-burgundy/90 gold-shimmer relative"
            >
              Start Conversation
            </Button>
          </Link>
          
          {onUploadClick && (
            <Button 
              className="w-full bg-gold/80 text-darkbrown hover:bg-gold/90 gold-gear-border"
              onClick={() => onUploadClick(sub.id)}
            >
              Upload Video Avatar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}