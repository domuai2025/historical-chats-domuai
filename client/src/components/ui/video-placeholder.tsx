import { PlayIcon, PauseIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VideoPlaceholderProps {
  videoUrl?: string | null;
  bgColor?: string | null;
}

export default function VideoPlaceholder({ videoUrl, bgColor = "#7D2B35" }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayToggle = () => {
    if (!videoUrl || !videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Ensure video is unmuted and volume is set
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      
      // Try to play with sound
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        
        // If browser policy blocks autoplay with sound, try muted playback
        if (error.name === "NotAllowedError" && videoRef.current) {
          const video = videoRef.current;
          video.muted = true;
          video.play().catch(e => 
            console.error("Failed to play even with muted option:", e)
          );
        }
      });
      
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    // Handle video end
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoEnd = () => {
        setIsPlaying(false);
      };
      
      videoElement.addEventListener('ended', handleVideoEnd);
      
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  const bgGradient = `linear-gradient(135deg, ${bgColor}80, ${bgColor}40)`;

  return (
    <div 
      className="absolute inset-0 flex overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 z-10 transition-opacity duration-300"
        style={{ 
          background: bgGradient,
          opacity: isHovered ? 0.4 : 0.7
        }}
      />

      {/* Video element if available */}
      {videoUrl && (
        <video 
          ref={videoRef}
          src={encodeURI(videoUrl)}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted={!isPlaying} // Only muted when not playing
        />
      )}
      
      {/* Animated waveform background when no video */}
      {!videoUrl && (
        <div className="absolute inset-0 z-0 opacity-20 flex items-center justify-center">
          <div className="audio-wave w-1/2 max-w-[120px]">
            {[...Array(6)].map((_, i) => (
              <span 
                key={i}
                className="wave-bar"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  height: `${30 + Math.random() * 40}%`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Play/Pause button with hover animation - positioned in the bottom right */}
      <div className="absolute z-20 bottom-4 right-4">
        <button
          onClick={handlePlayToggle}
          className={`play-button group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isHovered ? 'scale-110 bg-cream border border-gold/50' : 'bg-cream/90 border border-gold/30'} 
                    ${isPlaying ? 'text-burgundy' : 'text-burgundy'} 
                    hover:bg-burgundy hover:text-cream`}
          style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)' }}
        >
          {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          
          {/* Sound tooltip */}
          <span className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity 
                         bottom-full right-0 mb-2 py-1 px-2 text-xs text-cream bg-burgundy/90 rounded whitespace-nowrap font-serif">
            {isPlaying ? "Sound On" : "Click for sound"}
          </span>
        </button>
      </div>
    </div>
  );
}
