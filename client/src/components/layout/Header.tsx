import { Link } from "wouter";
import { MusicIcon, BookIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [symbolsAngle, setSymbolsAngle] = useState(0);
  
  // Subtle continuous animations for the logo
  useEffect(() => {
    // For the inner dashed ring - slower rotation
    const ringInterval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 50);
    
    // For the symbols orbit - very slow rotation
    const symbolsInterval = setInterval(() => {
      setSymbolsAngle(prev => (prev + 0.1) % 360);
    }, 50);
    
    return () => {
      clearInterval(ringInterval);
      clearInterval(symbolsInterval);
    };
  }, []);
  
  return (
    <header className="bg-cream border-b border-gold/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div 
              className="logo-container w-14 h-14 rounded-full bg-cream border-2 border-gold flex items-center justify-center mr-3 overflow-hidden transition-all duration-500 ease-in-out"
              style={{ 
                boxShadow: isHovered ? '0 0 12px rgba(212, 175, 55, 0.7)' : '0 0 8px rgba(212, 175, 55, 0.4)',
                transform: `rotate(${isHovered ? 8 : 0}deg) scale(${isHovered ? 1.08 : 1})`,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg width="54" height="54" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                {/* Outer circle with pulsing animation */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="58" 
                  fill="#F5EDD7" 
                  stroke="#D4AF37" 
                  strokeWidth="4"
                  className="logo-outer-circle" 
                />
                
                {/* Middle circle with rotating dashed line */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="#F5EDD7" 
                  stroke="#7D2B35" 
                  strokeWidth="2" 
                  strokeDasharray="2 3"
                  style={{
                    transformOrigin: 'center',
                    transform: `rotate(${rotationAngle}deg)`,
                  }}
                  className="logo-inner-circle" 
                />
                
                {/* Inner solid circle with logo background */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="40" 
                  fill="#F5EDD7" 
                  stroke="#D4AF37" 
                  strokeWidth="1.5"
                  strokeDasharray="1 1"
                  className="logo-center" 
                />
                
                {/* Educational symbols rotating around the circle */}
                <g 
                  style={{
                    transformOrigin: 'center',
                    transform: `rotate(${symbolsAngle}deg)`,
                  }}
                  className="symbols-container"
                >
                  {/* Book symbol at 45 degrees */}
                  <g 
                    fill="#7D2B35" 
                    className={isHovered ? "symbol-animated" : ""} 
                    transform="translate(76, 32.5) rotate(45)"
                  >
                    <path d="M-6 -8 h12 v16 h-12 z" className="symbol-1" />
                    <path d="M-6 -8 v16 M0 -8 v16 M6 -8 v16" className="symbol-1" />
                  </g>
                  
                  {/* Theater masks at 135 degrees */}
                  <g 
                    fill="#7D2B35" 
                    className={isHovered ? "symbol-animated" : ""} 
                    transform="translate(32.5, 32.5) rotate(135)"
                  >
                    <path d="M-4 -6 a6 6 0 1 1 0 12 a6 6 0 1 1 0 -12 z" className="symbol-2" />
                    <path d="M4 -6 a6 6 0 1 0 0 12 a6 6 0 1 0 0 -12 z" className="symbol-2" />
                    <path d="M-6 -2 l12 0 M-5 2 l10 0" stroke="#7D2B35" strokeWidth="1.5" className="symbol-2" />
                  </g>
                  
                  {/* Ancient Greek column at 225 degrees */}
                  <g 
                    fill="#7D2B35" 
                    className={isHovered ? "symbol-animated" : ""} 
                    transform="translate(32.5, 76) rotate(225)"
                  >
                    <rect x="-5" y="-8" width="10" height="2" rx="1" className="symbol-3" />
                    <rect x="-4" y="-6" width="8" height="12" rx="0" className="symbol-3" />
                    <rect x="-5" y="6" width="10" height="2" rx="1" className="symbol-3" />
                    <path d="M-4 -6 v12 M0 -6 v12 M4 -6 v12" stroke="#7D2B35" strokeWidth="0.75" className="symbol-3" />
                  </g>
                  
                  {/* Musical note at 315 degrees */}
                  <g 
                    fill="#7D2B35" 
                    className={isHovered ? "symbol-animated" : ""} 
                    transform="translate(76, 76) rotate(315)"
                  >
                    <path d="M-2 -8 h4 v8 a4 4 0 1 1 -4 0 z" className="symbol-4" />
                  </g>
                </g>
                
                {/* Central quill pen */}
                <g fill="#7D2B35" className={isHovered ? "center-symbol-animated" : ""}>
                  <path d="M60 50 Q63 40 66 44 L63 70 Q62 75 60 75 Q58 75 57 70 L54 44 Q57 40 60 50 z" className="center-symbol" />
                  <path d="M55 70 L65 70" stroke="#7D2B35" strokeWidth="1.5" className="center-symbol" />
                  <path d="M60 45 L60 55" stroke="#7D2B35" strokeWidth="0.75" strokeDasharray="1 1" className="center-symbol" />
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
            <BookIcon className="w-4 h-4 mr-1 animate-pulse" />
            <span className="hidden md:inline italic font-serif">Vintage Audio Experience</span>
          </div>
        </div>
      </div>
    </header>
  );
}
