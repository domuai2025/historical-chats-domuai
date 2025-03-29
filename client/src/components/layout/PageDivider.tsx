import { BookOpenIcon } from "lucide-react";
import { MusicIcon } from "lucide-react";

export default function PageDivider() {
  return (
    <div className="container mx-auto px-4 my-8">
      <div className="flex items-center justify-center">
        <div className="w-16 h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0"></div>
        <div className="mx-3 relative">
          <div className="absolute -inset-1 rounded-full border border-gold/30 opacity-50"></div>
          <MusicIcon className="w-5 h-5 text-burgundy relative z-10" />
        </div>
        <div className="w-8 h-px bg-gradient-to-r from-gold/0 via-burgundy/30 to-gold/0"></div>
        <div className="mx-3 relative">
          <div className="absolute -inset-1 rounded-full border border-gold/30 opacity-50"></div>
          <BookOpenIcon className="w-5 h-5 text-burgundy relative z-10" />
        </div>
        <div className="w-16 h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0"></div>
      </div>
    </div>
  );
}
