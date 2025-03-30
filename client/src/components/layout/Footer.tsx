import { BookOpenIcon, MusicIcon } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-gold/30 bg-beige/40">
      <div className="container mx-auto px-4 text-center">
        {/* Music & Book icon divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-gold/10 via-gold/40 to-gold/10"></div>
          <div className="mx-3 text-burgundy">
            <MusicIcon size={18} />
          </div>
          <div className="h-px w-4 bg-burgundy/20"></div>
          <div className="mx-3 text-burgundy">
            <BookOpenIcon size={18} />
          </div>
          <div className="h-px w-12 bg-gradient-to-r from-gold/10 via-gold/40 to-gold/10"></div>
        </div>
        
        <p className="text-burgundy text-sm mb-2 font-serif">
          © {new Date().getFullYear()} The Subs - Educational AI Avatars
        </p>
        <p className="text-darkbrown/70 text-xs italic font-serif">
          For educational purposes only. Free to all, provided by The Magdalena Foundation.
        </p>
        <p className="text-darkbrown/60 text-xs mt-4 font-serif">
          Powered by <a href="https://domuai.com" target="_blank" rel="noopener noreferrer" className="hover:text-burgundy transition-colors">DOMU AI<sup className="text-[0.7em] relative -top-0.5">™</sup></a>
        </p>
        <div className="mt-4 flex justify-center items-center text-xs text-gold">
          <span className="font-serif italic border-b border-burgundy/20 pb-0.5 px-2">Vintage Audio Experience</span>
        </div>
        
        {/* Nearly invisible admin link */}
        <div className="mt-8 opacity-10 hover:opacity-40 transition-opacity duration-300">
          <Link to="/admin-login" className="text-[8px] text-burgundy/30 tracking-wider cursor-default">
            ⨀
          </Link>
        </div>
      </div>
    </footer>
  );
}
