import { UserIcon } from "lucide-react";

type MessageType = "user" | "ai";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  sender: string;
  initial: string;
}

export default function ChatMessage({ type, content, sender, initial }: ChatMessageProps) {
  const isUserMessage = type === "user";

  return (
    <div className="mb-6">
      <div className={`flex items-start ${isUserMessage ? "justify-end" : ""}`}>
        {!isUserMessage && (
          <div className="w-10 h-10 rounded-full bg-burgundy/10 flex-shrink-0 mr-3 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-playfair text-burgundy">{initial}</span>
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
                : "bg-white shadow-sm border border-gold/30"
            }`}
          >
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="font-lora text-darkbrown mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {isUserMessage && (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 ml-3 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
