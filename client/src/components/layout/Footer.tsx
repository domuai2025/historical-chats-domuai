export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gold/30">
      <div className="container mx-auto px-4 text-center">
        <p className="text-darkbrown text-sm mb-2">
          © {new Date().getFullYear()} The Subs - Educational AI Avatars
        </p>
        <p className="text-darkbrown/70 text-xs">
          For educational purposes only. Free to all, provided by The Magdalena Foundation.
        </p>
        <p className="text-darkbrown/60 text-xs mt-2">
          Powered by DOMU AI
        </p>
        <div className="mt-3 flex justify-center items-center text-xs text-darkbrown/50">
          <span>Vintage Audio Experience</span>
        </div>
      </div>
    </footer>
  );
}
