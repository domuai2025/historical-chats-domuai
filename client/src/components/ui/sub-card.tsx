import { Link } from "wouter";
import { Sub } from "@shared/schema";
import VideoPlaceholder from "./video-placeholder";
import UploadButton from "./upload-button";

interface SubCardProps {
  sub: Sub;
  onUploadClick: (subId: number) => void;
}

export default function SubCard({ sub, onUploadClick }: SubCardProps) {
  return (
    <div className="figure-card bg-white rounded-lg shadow-vintage overflow-hidden transition-shadow hover:shadow-vintage-lg border border-gold/30">
      <div className="relative h-48 bg-gray-100">
        <VideoPlaceholder videoUrl={sub.videoUrl} />
      </div>
      <div className="p-4">
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
