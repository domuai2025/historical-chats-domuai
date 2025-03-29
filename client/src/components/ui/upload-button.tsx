import { UploadIcon } from "lucide-react";

interface UploadButtonProps {
  onClick: () => void;
}

export default function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center text-darkbrown text-sm font-lora hover:text-burgundy transition-colors"
    >
      <UploadIcon className="w-4 h-4 mr-2" />
      Upload Video
    </button>
  );
}
