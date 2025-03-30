import { useState } from 'react';

interface FallbackVideoProps {
  subId: number;
  name: string;
  videoPath: string;
}

// This is a super simplified video component for problem videos
export default function FallbackVideo({ subId, name, videoPath }: FallbackVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Create a fixed background color for the figure based on ID - this ensures consistency
  const bgColor = "#7D2B35"; // burgundy color
  const initials = name.split(' ').map(n => n[0]).join('');
  
  const handlePlayClick = () => {
    setIsPlaying(true);
    
    // We need a small delay to allow React to update the DOM before we target the video
    setTimeout(() => {
      // Find and play the video element directly using the DOM
      const videoEl = document.getElementById(`fallback-video-${subId}`) as HTMLVideoElement;
      if (videoEl) {
        videoEl.play().catch(err => {
          console.error(`Error playing fallback video for ${name}:`, err);
          setIsPlaying(false);
        });
      }
    }, 50);
  };
  
  return (
    <div className="relative aspect-square overflow-hidden">
      {/* Initial state - show initials */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayClick}
          style={{ backgroundColor: bgColor, color: '#F5EDD7' }}
        >
          <div className="text-6xl font-serif">{initials}</div>
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-cream/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-burgundy ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Only render the video element if playing is requested */}
      {isPlaying && (
        <video 
          id={`fallback-video-${subId}`}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          muted={!videoLoaded}
          loop
          playsInline
          preload="auto"
          autoPlay
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src={videoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}