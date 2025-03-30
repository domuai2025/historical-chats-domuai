import { Link } from "wouter";
import { MusicIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseAngle, setPulseAngle] = useState(0);
  
  // Subtle continuous animation for the logo
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAngle(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="bg-cream border-b border-gold/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div 
              className="logo-container w-12 h-12 rounded-full bg-burgundy/10 border-2 border-gold flex items-center justify-center mr-3 overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-110"
              style={{ 
                boxShadow: isHovered ? '0 0 12px rgba(212, 175, 55, 0.6)' : '0 0 6px rgba(212, 175, 55, 0.3)',
                transform: `rotate(${isHovered ? 5 : 0}deg) scale(${isHovered ? 1.1 : 1})`,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg width="38" height="38" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                {/* Outer circle with pulsing animation */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="58" 
                  fill="#F5F2E9" 
                  stroke="#D4AF37" 
                  strokeWidth="4"
                  className="logo-outer-circle" 
                />
                
                {/* Middle circle with rotating dashed line */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="#F5F2E9" 
                  stroke="#7D2B35" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  style={{
                    transformOrigin: 'center',
                    transform: `rotate(${pulseAngle}deg)`,
                  }}
                  className="logo-inner-circle" 
                />
                
                {/* Main music note in center */}
                <g fill="#7D2B35" className={isHovered ? "logo-notes-animated" : ""}>
                  <path d="M60 50 Q64 40 68 50 V70 Q68 76 60 76 Q52 76 52 70 V50 Z" />
                  <rect x="52" y="70" width="16" height="4" rx="2" />
                  
                  {/* Four outer music notes */}
                  <path d="M35 30 Q38 25 41 30 V40 Q41 44 35 44 Q29 44 29 40 V30 Z" className="note-1" />
                  <rect x="29" y="40" width="12" height="3" rx="1.5" className="note-1" />
                  
                  <path d="M85 30 Q88 25 91 30 V40 Q91 44 85 44 Q79 44 79 40 V30 Z" className="note-2" />
                  <rect x="79" y="40" width="12" height="3" rx="1.5" className="note-2" />
                  
                  <path d="M35 75 Q38 70 41 75 V85 Q41 89 35 89 Q29 89 29 85 V75 Z" className="note-3" />
                  <rect x="29" y="85" width="12" height="3" rx="1.5" className="note-3" />
                  
                  <path d="M85 75 Q88 70 91 75 V85 Q91 89 85 89 Q79 89 79 85 V75 Z" className="note-4" />
                  <rect x="79" y="85" width="12" height="3" rx="1.5" className="note-4" />
                </g>
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-burgundy font-semibold text-xl md:text-2xl">
                The Subs <span className="text-gold font-normal">AI</span>
              </h1>
            </div>
          </div>
        </Link>
        <div className="flex items-center">
          <div className="text-sm text-burgundy flex items-center">
            <MusicIcon className="w-4 h-4 mr-1 animate-pulse" />
            <span className="hidden md:inline italic font-serif">Vintage Audio Experience</span>
          </div>
        </div>
      </div>
    </header>
  );
}
