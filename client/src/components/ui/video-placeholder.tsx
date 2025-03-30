import { PlayIcon, PauseIcon, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VideoPlaceholderProps {
  videoUrl?: string | null;
  bgColor?: string | null;
}

// Special handling for known large videos
const isLargeVideo = (url: string): boolean => {
  // Check for known large videos by filename components
  const knownLargeVideoKeywords = [
    'lennon',
    'joplin',
    'socrets',
    'socrates'
  ];
  
  // Check if url contains any of the keywords (case insensitive)
  return knownLargeVideoKeywords.some(keyword => 
    url.toLowerCase().includes(keyword.toLowerCase())
  );
};

export default function VideoPlaceholder({ videoUrl, bgColor = "#7D2B35" }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isLargeFile, setIsLargeFile] = useState(false);
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
    
    // Reset any previous errors
    setPlaybackError(null);
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // For large videos, apply enhanced playback strategy
      if (isLargeFile && videoRef.current) {
        // Ensure video element is visible before attempting playback
        if (videoRef.current.style.display === 'none') {
          videoRef.current.style.display = 'block';
        }
        
        // Ensure video is properly loaded
        videoRef.current.load();
      }
      
      // Ensure video is unmuted and volume is set
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      
      // Try to play with sound with enhanced error handling
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        setPlaybackError(error.message || "Error playing video");
        
        // If browser policy blocks autoplay with sound, try muted playback
        if (error.name === "NotAllowedError" && videoRef.current) {
          // Try muted playback
          const video = videoRef.current;
          video.muted = true;
          
          video.play().catch(e => {
            console.error("Failed to play even with muted option:", e);
            setPlaybackError("Cannot play video. Please try again or reload the page.");
            setIsPlaying(false);
            return;
          });
        } else if (isLargeFile) {
          // For large files, display a specific message
          setPlaybackError("Large video may take a moment to load. Please be patient.");
        } else {
          setIsPlaying(false);
          return;
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
      setPlaybackError(null);
      
      // Check if this is a known large video
      const isLargeVideoFile = isLargeVideo(videoUrl);
      setIsLargeFile(isLargeVideoFile);
      
      // Create a temporary video element to load the first frame
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = encodeURI(videoUrl);
      tempVideo.muted = true;
      
      // For large videos, be conservative with preloading
      tempVideo.preload = isLargeVideoFile ? 'metadata' : 'auto';
      
      // Set a timeout for thumbnail generation to ensure we don't spend too long trying to generate thumbnails
      const thumbnailTimeout = isLargeVideoFile ? 5000 : 2000;
      
      // Only need to load metadata to get the first frame
      tempVideo.addEventListener('loadeddata', function() {
        if (canvasRef.current) {
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
      
      // Set a safety timeout to ensure we don't wait forever for thumbnails
      const safetyTimeoutId = setTimeout(() => {
        if (!videoLoaded) {
          console.log("Thumbnail generation timed out after", thumbnailTimeout, "ms");
          setVideoLoaded(true); // Mark as loaded to proceed with UI
        }
      }, thumbnailTimeout);
      
      // Add error handling for thumbnail generation
      tempVideo.addEventListener('error', function(e) {
        console.error("Error loading video for thumbnail:", e);
        setVideoLoaded(true); // Mark as loaded to prevent further attempts
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
      
      // Also add error listener
      const handleVideoError = (e: ErrorEvent) => {
        console.error("Video playback error:", e);
        setIsPlaying(false);
        setPlaybackError("Video playback error. Please try again.");
      };
      
      videoElement.addEventListener('ended', handleVideoEnd);
      videoElement.addEventListener('error', handleVideoError as EventListener);
      
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
        videoElement.removeEventListener('error', handleVideoError as EventListener);
      };
    }
  }, []);

  // Special optimization for large videos
  useEffect(() => {
    if (videoRef.current && isLargeFile) {
      // Set specific properties for large video files
      videoRef.current.preload = "metadata"; // Only preload metadata
      
      // Cleanup function
      return () => {
        if (videoRef.current && !isPlaying) {
          // Unload video source when component unmounts if not playing
          // This helps free up memory for large videos
          videoRef.current.removeAttribute('src');
        }
      };
    }
  }, [isLargeFile, isPlaying]);

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
            preload={isLargeFile ? "metadata" : "auto"}
            playsInline // Add playsInline for better mobile support
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

      {/* Error message display */}
      {playbackError && (
        <div className="absolute z-30 top-2 left-2 right-2 bg-burgundy/80 text-cream p-2 rounded text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{playbackError}</span>
        </div>
      )}

      {/* Large file indicator for better user experience */}
      {isLargeFile && !isPlaying && isHovered && (
        <div className="absolute z-30 top-2 left-2 bg-burgundy/80 text-cream p-1 rounded text-xs">
          Large video - may take longer to load
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
