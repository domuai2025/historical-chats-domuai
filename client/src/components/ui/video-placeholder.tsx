import { PlayIcon, PauseIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VideoPlaceholderProps {
  videoUrl?: string | null;
  bgColor?: string | null;
}

export default function VideoPlaceholder({ videoUrl, bgColor = "#7D4F50" }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayToggle = () => {
    if (!videoUrl) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
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
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
        />
      )}
      
      {/* Animated waveform background when no video */}
      {!videoUrl && (
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="audio-wave">
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

      {/* Play/Pause button with hover animation */}
      <div className="relative z-20">
        <button
          onClick={handlePlayToggle}
          className={`play-button w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isHovered ? 'scale-110 bg-white' : 'bg-white/80'} 
                    ${isPlaying ? 'text-burgundy' : 'text-burgundy'} 
                    hover:bg-burgundy hover:text-white`}
          style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
