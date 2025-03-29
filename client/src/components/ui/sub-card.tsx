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
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const subInitials = getInitials(sub.name);

  return (
    <div 
      className="figure-card bg-white rounded-lg shadow-vintage overflow-hidden transition-all duration-300 hover:shadow-vintage-lg border border-gold/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <div className="relative h-48 bg-gray-100">
        <VideoPlaceholder videoUrl={sub.videoUrl} bgColor={sub.bgColor} />
        
        {/* Avatar circle - positioned in the bottom left corner of the card */}
        <div className={`absolute z-30 bottom-0 right-0 transform translate-y-1/3 translate-x-1/3 mr-4 
                       ${isHovered ? 'avatar-glow' : ''}`}>
          <div 
            className="avatar-circle w-14 h-14 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: sub.bgColor || '#7D4F50' }}
          >
            {sub.avatarUrl ? (
              <img src={sub.avatarUrl} alt={sub.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-cream font-playfair text-lg">{subInitials}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-10">
        <h3 className="font-playfair text-lg font-medium text-darkbrown">{sub.name}</h3>
        <p className="text-sm text-darkbrown/70 mb-4">{sub.title}</p>
        <div className="flex items-center justify-between">
          <UploadButton onClick={() => onUploadClick(sub.id)} />
          <Link href={`/chat/${sub.id}`}>
            <a className="bg-burgundy hover:bg-burgundy/90 text-cream text-sm py-2 px-4 rounded font-lora transition-colors">
              Start Conversation
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
