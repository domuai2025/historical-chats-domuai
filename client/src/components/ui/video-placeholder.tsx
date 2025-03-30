import { PlayIcon, PauseIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VideoPlaceholderProps {
  videoUrl?: string | null;
  bgColor?: string | null;
}

export default function VideoPlaceholder({ videoUrl, bgColor = "#7D2B35" }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Function to capture the first frame of the video
  const captureFirstFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame to the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL and set as thumbnail
      try {
        const dataUrl = canvas.toDataURL('image/jpeg');
        setThumbnailUrl(dataUrl);
      } catch (e) {
        console.error("Error creating thumbnail:", e);
      }
    }
  };

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

  // Handle video loaded event to capture the first frame
  const handleVideoLoaded = () => {
    if (!videoLoaded && videoRef.current) {
      // Need to ensure the video is at the beginning and ready to extract the frame
      if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or better
        captureFirstFrame();
        setVideoLoaded(true);
      } else {
        // If not ready yet, try again in a moment
        setTimeout(handleVideoLoaded, 100);
      }
    }
  };

  // Force video to load its metadata for thumbnail generation
  useEffect(() => {
    // When videoUrl changes, reset states and try to load the video
    if (videoUrl) {
      setVideoLoaded(false);
      setThumbnailUrl(null);
      
      // Create a temporary video element to load the first frame
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = encodeURI(videoUrl);
      tempVideo.muted = true;
      tempVideo.preload = 'metadata';
      
      // Only need to load metadata to get the first frame
      tempVideo.addEventListener('loadeddata', function() {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = tempVideo.videoWidth;
          canvas.height = tempVideo.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Set current time to 0 to ensure we get the first frame
            tempVideo.currentTime = 0;
            
            // Wait a short time to ensure frame is available
            setTimeout(() => {
              ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
              try {
                const dataUrl = canvas.toDataURL('image/jpeg');
                setThumbnailUrl(dataUrl);
                setVideoLoaded(true);
              } catch (e) {
                console.error("Error creating thumbnail:", e);
              }
              
              // Clean up
              tempVideo.src = '';
            }, 200);
          }
        }
      });
      
      // Start loading
      tempVideo.load();
    }
  }, [videoUrl]);

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
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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
        <>
          {/* Display thumbnail when not playing */}
          {!isPlaying && thumbnailUrl && (
            <img 
              src={thumbnailUrl} 
              alt="Video thumbnail" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <video 
            ref={videoRef}
            src={encodeURI(videoUrl)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: isPlaying ? 'block' : 'none' }} 
            loop
            muted={!isPlaying}
            onLoadedData={handleVideoLoaded}
            preload="metadata"
          />
        </>
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
