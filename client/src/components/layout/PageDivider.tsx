import { BookOpenIcon } from "lucide-react";

export default function PageDivider() {
  return (
    <div className="container mx-auto px-4 my-6">
      <div className="flex items-center justify-center">
        <div className="w-12 h-px bg-gradient-to-r from-burgundy/0 via-burgundy/30 to-burgundy/0"></div>
        <div className="mx-3">
          <BookOpenIcon className="w-5 h-5 text-burgundy opacity-70" />
        </div>
        <div className="w-12 h-px bg-gradient-to-r from-burgundy/0 via-burgundy/30 to-burgundy/0"></div>
      </div>
    </div>
  );
}
