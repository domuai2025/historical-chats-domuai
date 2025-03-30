import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Clock, Compass, History } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-beige">
      <Card className="w-full max-w-md mx-4 border border-gold/30 bg-cream shadow-lg">
        <CardContent className="pt-6 pb-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-burgundy flex items-center justify-center">
                  <Clock className="h-12 w-12 text-burgundy" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Compass className="h-10 w-10 text-gold animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Book className="h-6 w-6 text-darkbrown" />
                </div>
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold text-burgundy">Page Not Found</h1>
            <div className="flex items-center justify-center mt-2 mb-6">
              <History className="h-5 w-5 text-gold mr-2" />
              <p className="text-darkbrown italic font-serif">
                It seems you've traveled to an unknown time period
              </p>
            </div>
          </div>
          
          <p className="text-center mb-8 text-darkbrown">
            The historical document you're searching for doesn't exist in our archives.
            Perhaps you'd like to return to our collection of remarkable historical figures?
          </p>
          
          <div className="text-center">
            <Link href="/">
              <Button className="bg-burgundy hover:bg-burgundy/90 text-cream">
                Return to The Archives
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gold/30 text-center">
            <p className="text-xs text-darkbrown/70">
              For educational purposes only. Provided by The Magdalena Foundation™
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
