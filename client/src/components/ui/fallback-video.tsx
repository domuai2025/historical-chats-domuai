import { useState } from 'react';
import { Link } from 'wouter';

interface FallbackVideoProps {
  subId: number;
  name: string;
  videoPath: string;
}

// For the MVP, we'll just show initials and an invitation to view on the conversation page
export default function FallbackVideo({ subId, name, videoPath }: FallbackVideoProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Create a fixed background color for the figure based on ID - this ensures consistency
  const bgColor = "#7D2B35"; // burgundy color
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <Link href={`/chat/${subId}`}>
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Show initials with message to view in chat */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backgroundColor: bgColor, color: '#F5EDD7' }}
        >
          <div className="text-6xl font-serif mb-2">{initials}</div>
          
          <div className={`text-sm text-cream mt-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            {isHovered ? (
              <div className="flex flex-col items-center">
                <span className="font-medium">Watch video in conversation</span>
                <span className="text-xs mt-1">(click to open)</span>
              </div>
            ) : (
              <div className="text-xs italic">Large video available in conversation</div>
            )}
          </div>
        </div>
        
        {/* Play button indication overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-0'}`}>
          <div className="w-16 h-16 rounded-full bg-cream/80 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-burgundy ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}