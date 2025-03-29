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
  bgColor = "#7D4F50" 
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
            className="avatar-glow w-10 h-10 rounded-full flex-shrink-0 mr-3 overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-playfair text-cream">{initial}</span>
            </div>
          </div>
        )}
        <div>
          <div 
            className={`font-playfair text-sm mb-1 ${
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
                ? "bg-burgundy/10" 
                : "bg-white shadow-md border border-gold/30"
            }`}
            style={{ 
              boxShadow: isUserMessage ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="font-lora text-darkbrown mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {isUserMessage && (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 ml-3 overflow-hidden shadow-sm">
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
