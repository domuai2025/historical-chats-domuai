import { Link } from "wouter";
import { MusicIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-cream border-b border-gold/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-burgundy text-cream flex items-center justify-center mr-3">
              <span className="font-playfair text-lg">S</span>
            </div>
            <div>
              <h1 className="font-playfair text-burgundy font-semibold text-xl md:text-2xl">
                The Subs <span className="text-gold font-normal">AI</span>
              </h1>
            </div>
          </a>
        </Link>
        <div className="flex items-center">
          <Link href="/">
            <a className="text-sm text-burgundy hover:text-mutedred transition-colors flex items-center mr-4">
              <MusicIcon className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">Vintage Audio Experience</span>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
