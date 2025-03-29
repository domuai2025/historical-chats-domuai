import { UploadIcon } from "lucide-react";

interface UploadButtonProps {
  onClick: () => void;
}

export default function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center text-darkbrown/80 text-sm font-serif hover:text-burgundy transition-colors group"
    >
      <UploadIcon className="w-4 h-4 mr-2 group-hover:text-gold transition-colors" />
      <span className="group-hover:border-b border-burgundy/40 pb-0.5 transition-all">Upload Video</span>
    </button>
  );
}
