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
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioWave, setShowAudioWave] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { registerPlayer, unregisterPlayer, stopAllExcept } = useVideoPlayer();
  
  // Generate random wave bar heights for audio visualization
  const waveHeights = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 10);
  
  // Register and unregister the video player with the context
  useEffect(() => {
    if (videoRef.current) {
      registerPlayer(sub.id, videoRef.current);
    }
    
    return () => {
      unregisterPlayer(sub.id);
    };
  }, [sub.id, registerPlayer, unregisterPlayer, videoLoaded]);
  
  const handlePlayPause = () => {
    if (!videoLoaded && !videoError && hasVideo) {
      return; // Don't allow play/pause while video is loading
    }
    
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
  
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
    
    // Capture first frame as thumbnail if no avatar is provided
    if (!sub.avatarUrl && videoSrc) {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true;
      video.playsInline = true;
      
      video.addEventListener('loadeddata', () => {
        // Create canvas to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // We don't need to do anything with the captured frame here
          // since we're now just using the video element properly
        }
        
        // Clean up
        video.src = '';
      });
      
      // Start loading
      video.load();
    }
  };
  
  const handleVideoError = () => {
    console.log(`Video error for ${sub.name}: ${videoSrc}`);
    setVideoLoaded(true); // Set to true so we can show the error state
    setVideoError(true);
    setShowAudioWave(true); // Show audio wave as fallback
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
            <div 
              className={`absolute bottom-2 right-2 z-10 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              onClick={handlePlayPause}
            >
              {!videoLoaded && !videoError && (
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {showAudioWave && videoError && (
              <div className="absolute inset-0 z-0 flex items-center justify-center bg-burgundy">
                <div className="audio-wave">
                  {waveHeights.map((height, index) => (
                    <span 
                      key={index} 
                      className="wave-bar"
                      style={{ 
                        height: `${height}px`, 
                        animationDelay: `${index * 0.2}s` 
                      }}
                    ></span>
                  ))}
                </div>
              </div>
            )}
            
            {!showAudioWave && (
              sub.avatarUrl ? (
                <img 
                  src={sub.avatarUrl} 
                  alt={sub.name} 
                  className="h-full w-full object-cover"
                  style={{ display: videoLoaded && !videoError ? 'none' : 'block' }}
                />
              ) : (
                <div 
                  className="h-full w-full flex items-center justify-center font-serif text-6xl"
                  style={{ 
                    backgroundColor: sub.bgColor || '#7D2B35',
                    color: '#F5EDD7',
                    display: videoLoaded && !videoError ? 'none' : 'flex'
                  }}
                >
                  {sub.name.split(' ').map(n => n[0]).join('')}
                </div>
              )
            )}
            
            <video 
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover ${videoLoaded && !videoError ? '' : 'hidden'}`}
              poster={sub.avatarUrl || ''}
              autoPlay={isPlaying}
              loop
              playsInline
              controls
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              style={{ display: videoLoaded && !videoError ? 'block' : 'none' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              {videoSrc && (
                <>
                  {/* Using source tags approach for better cross-environment compatibility */}
                  <source src={videoSrc} type="video/mp4" />
                  {/* Fallback in case the direct path doesn't work in production */}
                  <source 
                    src={videoSrc.startsWith('/uploads/') 
                      ? `/uploads/videos/${videoSrc.split('/').pop()}` 
                      : videoSrc} 
                    type="video/mp4" 
                  />
                </>
              )}
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