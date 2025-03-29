import { UserIcon } from "lucide-react";
import { useState, useEffect } from "react";

type MessageType = "user" | "ai";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  sender: string;
  initial: string;
  bgColor?: string;
}

export default function ChatMessage({ 
  type, 
  content, 
  sender, 
  initial,
  bgColor = "#7D2B35" 
}: ChatMessageProps) {
  const isUserMessage = type === "user";
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`mb-6 ${isVisible ? 'message-animation' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
      <div className={`flex items-start ${isUserMessage ? "justify-end" : ""}`}>
        {!isUserMessage && (
          <div 
            className="avatar-glow w-10 h-10 rounded-full flex-shrink-0 mr-3 overflow-hidden border border-gold/40"
            style={{ backgroundColor: bgColor }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-cream">{initial}</span>
            </div>
          </div>
        )}
        <div>
          <div 
            className={`font-serif text-sm mb-1 ${
              isUserMessage 
                ? "text-darkbrown/70 text-right" 
                : "text-burgundy"
            }`}
          >
            {sender}
          </div>
          <div 
            className={`p-3 rounded-lg ${
              isUserMessage 
                ? "bg-beige border border-burgundy/10" 
                : "bg-cream shadow-sm border border-gold/30"
            }`}
            style={{ 
              boxShadow: isUserMessage ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}
          >
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="font-serif text-darkbrown mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {isUserMessage && (
          <div className="w-10 h-10 rounded-full bg-burgundy/10 flex-shrink-0 ml-3 overflow-hidden border border-burgundy/20">
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-burgundy/70" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
