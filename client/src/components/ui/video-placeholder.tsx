import { PlayIcon } from "lucide-react";

interface VideoPlaceholderProps {
  videoUrl: string | null;
}

export default function VideoPlaceholder({ videoUrl }: VideoPlaceholderProps) {
  const handlePlay = () => {
    if (videoUrl) {
      // Play the video
      console.log("Playing video:", videoUrl);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <button
        onClick={handlePlay}
        className="play-button w-14 h-14 rounded-full flex items-center justify-center bg-white/80 hover:bg-burgundy/90 transition-all duration-300 text-burgundy hover:text-white hover:scale-110"
      >
        <PlayIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
