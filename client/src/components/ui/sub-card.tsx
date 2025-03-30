import { Link } from "wouter";
import type { Sub } from "@shared/schema";
import VideoPlaceholder from "./video-placeholder";
import UploadButton from "./upload-button";
import { useState } from "react";

interface SubCardProps {
  sub: Sub;
  onUploadClick: (subId: number) => void;
}

export default function SubCard({ sub, onUploadClick }: SubCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="figure-card bg-cream rounded-lg overflow-hidden transition-all duration-300 border border-gold/30 hover:border-gold/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <div className="relative h-48 bg-beige">
        <VideoPlaceholder videoUrl={sub.videoUrl} bgColor={sub.bgColor} />
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-lg font-medium text-burgundy">{sub.name}</h3>
        <p className="text-sm text-darkbrown/80 italic mb-4 font-serif">{sub.title}</p>
        <div className="flex items-center justify-between">
          {/* Hide Upload Button if a video already exists */}
          {!sub.videoUrl ? (
            <UploadButton onClick={() => onUploadClick(sub.id)} />
          ) : (
            <div className="opacity-0"></div> // Empty div to maintain layout
          )}
          <Link href={`/chat/${sub.id}`}>
            <div className="bg-burgundy hover:bg-burgundy/90 text-cream text-sm py-2 px-4 rounded font-serif transition-colors cursor-pointer">
              Start Conversation
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
