import { Link } from "wouter";
import { ClockIcon, BookIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const hourHandRef = useRef<number>(0);
  const minuteHandRef = useRef<number>(0);
  const compassHandRef = useRef<number>(0);
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [compassAngle, setCompassAngle] = useState(0);

  // Time travel clock hands animation
  useEffect(() => {
    // Hour hand - very slow rotation (counterclockwise)
    const hourInterval = setInterval(() => {
      hourHandRef.current = (hourHandRef.current - 0.3) % 360;
      setHourAngle(hourHandRef.current);
    }, 60);
    
    // Minute hand - faster rotation (clockwise)
    const minuteInterval = setInterval(() => {
      minuteHandRef.current = (minuteHandRef.current + 0.7) % 360;
      setMinuteAngle(minuteHandRef.current);
    }, 40);

    // Compass hand - oscillating motion
    const compassInterval = setInterval(() => {
      // Oscillate between -40 and 40 degrees
      compassHandRef.current = Math.sin(Date.now() / 2000) * 40;
      setCompassAngle(compassHandRef.current);
    }, 50);
    
    return () => {
      clearInterval(hourInterval);
      clearInterval(minuteInterval);
      clearInterval(compassInterval);
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
                boxShadow: isHovered ? '0 0 15px rgba(212, 175, 55, 0.8)' : '0 0 8px rgba(212, 175, 55, 0.4)',
                transform: `rotate(${isHovered ? 5 : 0}deg) scale(${isHovered ? 1.08 : 1})`,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg width="54" height="54" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                {/* Outer circle with fancy border */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="58" 
                  fill="#F5EDD7" 
                  stroke="#D4AF37" 
                  strokeWidth="3"
                  className="logo-outer-circle" 
                />
                
                {/* Clock face tick marks (hours) */}
                <g className="clock-ticks">
                  {[...Array(12)].map((_, i) => (
                    <line 
                      key={`hour-${i}`}
                      x1="60" 
                      y1="10" 
                      x2="60" 
                      y2="16" 
                      stroke="#7D2B35" 
                      strokeWidth="2" 
                      transform={`rotate(${i * 30} 60 60)`} 
                    />
                  ))}
                  
                  {/* Minute marks - smaller ticks */}
                  {[...Array(60)].map((_, i) => (
                    (i % 5 !== 0) && (
                      <line 
                        key={`min-${i}`}
                        x1="60" 
                        y1="10" 
                        x2="60" 
                        y2="13" 
                        stroke="#7D2B35" 
                        strokeWidth="1" 
                        strokeOpacity="0.5"
                        transform={`rotate(${i * 6} 60 60)`} 
                      />
                    )
                  ))}
                </g>
                
                {/* Compass rose - cardinal directions */}
                <g className="compass-rose">
                  <text x="60" y="26" textAnchor="middle" fill="#7D2B35" fontSize="8" fontWeight="bold">N</text>
                  <text x="94" y="63" textAnchor="middle" fill="#7D2B35" fontSize="8" fontWeight="bold">E</text>
                  <text x="60" y="100" textAnchor="middle" fill="#7D2B35" fontSize="8" fontWeight="bold">S</text>
                  <text x="26" y="63" textAnchor="middle" fill="#7D2B35" fontSize="8" fontWeight="bold">W</text>
                </g>
                
                {/* Inner ring with time runes */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="48" 
                  fill="none" 
                  stroke="#7D2B35" 
                  strokeWidth="1.5" 
                  strokeDasharray="1 3"
                  className="time-runes" 
                />
                
                {/* Educational symbols around the edge */}
                <g className="time-artifacts">
                  {/* Book at North */}
                  <g transform="translate(60, 34)">
                    <rect x="-5" y="-6" width="10" height="12" fill="#7D2B35" />
                    <line x1="-5" y1="-4" x2="5" y2="-4" stroke="#F5EDD7" strokeWidth="1" />
                    <line x1="-5" y1="-1" x2="5" y2="-1" stroke="#F5EDD7" strokeWidth="1" />
                    <line x1="-5" y1="2" x2="5" y2="2" stroke="#F5EDD7" strokeWidth="1" />
                  </g>

                  {/* Scroll at East */}
                  <g transform="translate(86, 60)">
                    <path d="M-5,-5 C-4,-6 -2,-6 0,-5 C2,-6 4,-6 5,-5 L5,5 C4,4 2,4 0,5 C-2,4 -4,4 -5,5 Z" fill="#7D2B35" />
                    <line x1="-3" y1="-2" x2="3" y2="-2" stroke="#F5EDD7" strokeWidth="0.75" />
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="#F5EDD7" strokeWidth="0.75" />
                    <line x1="-3" y1="2" x2="3" y2="2" stroke="#F5EDD7" strokeWidth="0.75" />
                  </g>

                  {/* Greek column at South */}
                  <g transform="translate(60, 86)">
                    <rect x="-3" y="-7" width="6" height="14" fill="#7D2B35" />
                    <rect x="-4" y="-8" width="8" height="1.5" fill="#7D2B35" />
                    <rect x="-4" y="6.5" width="8" height="1.5" fill="#7D2B35" />
                    <line x1="-3" y1="-6" x2="-3" y2="6" stroke="#F5EDD7" strokeWidth="0.5" />
                    <line x1="0" y1="-6" x2="0" y2="6" stroke="#F5EDD7" strokeWidth="0.5" />
                    <line x1="3" y1="-6" x2="3" y2="6" stroke="#F5EDD7" strokeWidth="0.5" />
                  </g>

                  {/* Music note at West */}
                  <g transform="translate(34, 60)">
                    <path d="M-1,-6 L3,-6 L3,0 C3,3 -1,3 -1,0 Z" fill="#7D2B35" />
                    <line x1="3" y1="-6" x2="5" y2="-7" stroke="#7D2B35" strokeWidth="1.5" />
                  </g>
                </g>
                
                {/* Clock hands */}
                <g style={{ transformOrigin: 'center' }}>
                  {/* Hour hand */}
                  <line 
                    x1="60" 
                    y1="60" 
                    x2="60" 
                    y2="30" 
                    stroke="#7D2B35" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className="hour-hand"
                    style={{ transformOrigin: 'center', transform: `rotate(${hourAngle}deg)` }}
                  />
                  
                  {/* Minute hand */}
                  <line 
                    x1="60" 
                    y1="60" 
                    x2="60" 
                    y2="22" 
                    stroke="#D4AF37" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className="minute-hand"
                    style={{ transformOrigin: 'center', transform: `rotate(${minuteAngle}deg)` }}
                  />
                  
                  {/* Compass needle */}
                  <g 
                    className="compass-needle"
                    style={{ transformOrigin: 'center', transform: `rotate(${compassAngle}deg)` }}
                  >
                    <path d="M60,60 L57,36 L60,32 L63,36 Z" fill="#7D2B35" />
                    <path d="M60,60 L57,84 L60,88 L63,84 Z" fill="#D4AF37" />
                  </g>
                </g>
                
                {/* Central hub */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="5" 
                  fill="#7D2B35" 
                  stroke="#D4AF37" 
                  strokeWidth="1"
                  className={isHovered ? "center-hub-animated" : "center-hub"}
                />
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
            <ClockIcon className="w-4 h-4 mr-1 animate-pulse" />
            <span className="hidden md:inline italic font-serif">Vintage Audio Experience</span>
          </div>
        </div>
      </div>
    </header>
  );
}
