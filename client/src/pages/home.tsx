import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageDivider from "@/components/layout/PageDivider";
import SubCard from "@/components/ui/sub-card";
import { fetchSubs, uploadVideo } from "@/lib/api";
import { Link } from "wouter";
import { BookOpenIcon, MusicIcon, UserIcon } from "lucide-react";
import type { Sub } from "@shared/schema";

export default function Home() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: subs = [] as Sub[], isLoading } = useQuery<Sub[]>({
    queryKey: ['/api/subs'],
    queryFn: fetchSubs
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ subId, formData }: { subId: number, formData: FormData }) => {
      return uploadVideo(subId.toString(), formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subs'] });
      setUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    }
  });

  const handleUploadClick = (subId: number) => {
    setSelectedSubId(subId);
    setUploadDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedSubId) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate file type - prioritize MP4 but accept any video
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }
    
    // No file size validation - allow any size
    
    const formData = new FormData();
    formData.append('video', file);
    
    toast({
      title: "Uploading...",
      description: "Please wait while we upload your video. This may take some time for larger files.",
    });

    uploadMutation.mutate({ subId: selectedSubId, formData });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-cream py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-beige border border-gold/20 rounded-lg p-6 md:p-10 text-center gold-shimmer gold-shimmer-border">
            <div className="mx-auto w-40 h-40 mb-8 main-logo-container">
              <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="main-logo-svg">
                {/* Outer circle with fancy border */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="58" 
                  fill="#F5EDD7" 
                  stroke="#D4AF37" 
                  strokeWidth="3"
                  className="logo-outer-circle" 
                />
                
                {/* Elegant decorative outer ring */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#7D2B35" 
                  strokeOpacity="0.4"
                  strokeWidth="0.5"
                  className="decorative-ring" 
                />
                
                {/* Clock face tick marks (hours) */}
                <g className="clock-ticks">
                  {[...Array(12)].map((_, i) => (
                    <line 
                      key={`hour-${i}`}
                      x1="60" 
                      y1="8" 
                      x2="60" 
                      y2="16" 
                      stroke="#7D2B35" 
                      strokeWidth="2" 
                      transform={`rotate(${i * 30} 60 60)`} 
                    />
                  ))}
                  
                  {/* Minute marks - smaller ticks */}
                  {[...Array(60)].map((_, i) => (
                    (i % 5 !== 0) && (
                      <line 
                        key={`min-${i}`}
                        x1="60" 
                        y1="8" 
                        x2="60" 
                        y2="12" 
                        stroke="#7D2B35" 
                        strokeWidth="1" 
                        strokeOpacity="0.5"
                        transform={`rotate(${i * 6} 60 60)`} 
                      />
                    )
                  ))}
                </g>
                
                {/* Compass rose - cardinal directions */}
                <g className="compass-rose">
                  <text x="60" y="24" textAnchor="middle" fill="#7D2B35" fontSize="10" fontWeight="bold">N</text>
                  <text x="97" y="63" textAnchor="middle" fill="#7D2B35" fontSize="10" fontWeight="bold">E</text>
                  <text x="60" y="102" textAnchor="middle" fill="#7D2B35" fontSize="10" fontWeight="bold">S</text>
                  <text x="24" y="63" textAnchor="middle" fill="#7D2B35" fontSize="10" fontWeight="bold">W</text>
                </g>
                
                {/* Ornate time ring with roman numerals */}
                <g className="time-numerals">
                  <text x="60" y="32" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">XII</text>
                  <text x="74" y="38" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">I</text>
                  <text x="84" y="48" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">II</text>
                  <text x="90" y="62" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">III</text>
                  <text x="84" y="76" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">IV</text>
                  <text x="74" y="86" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">V</text>
                  <text x="60" y="92" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">VI</text>
                  <text x="46" y="86" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">VII</text>
                  <text x="36" y="76" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">VIII</text>
                  <text x="30" y="62" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">IX</text>
                  <text x="36" y="48" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">X</text>
                  <text x="46" y="38" textAnchor="middle" fill="#7D2B35" fontSize="6" fontWeight="normal">XI</text>
                </g>
                
                {/* Inner ring with time runes */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="48" 
                  fill="none" 
                  stroke="#7D2B35" 
                  strokeWidth="1.5" 
                  strokeDasharray="1 3"
                  className="time-runes rotating-circle" 
                />
                
                {/* Educational symbols at cardinal points */}
                <g className="time-artifacts">
                  {/* Music Note at North */}
                  <g transform="translate(60, 34)" className="artifact-north">
                    <ellipse cx="0" cy="4" rx="4.5" ry="4" fill="#7D2B35" />
                    <path d="M4.5,4 L4.5,-8 L-4.5,-8 L-4.5,4" fill="none" stroke="#7D2B35" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="-4.5" y1="-8" x2="4.5" y2="-8" stroke="#7D2B35" strokeWidth="2.5" strokeLinecap="round" />
                  </g>

                  {/* Math formula (E=mc²) at East */}
                  <g transform="translate(86, 60)" className="artifact-east">
                    <rect x="-7" y="-6" width="14" height="12" fill="#7D2B35" rx="2" />
                    <text x="0" y="0" textAnchor="middle" fill="#F5EDD7" fontSize="7" fontWeight="bold" dominantBaseline="middle">E=mc²</text>
                  </g>

                  {/* Movie camera at South */}
                  <g transform="translate(60, 86)" className="artifact-south">
                    <rect x="-6" y="-5" width="12" height="10" fill="#7D2B35" rx="1" />
                    <circle cx="0" cy="0" r="3.5" fill="none" stroke="#F5EDD7" strokeWidth="1" />
                    <circle cx="0" cy="0" r="1.5" fill="#F5EDD7" />
                    <rect x="6" y="-3" width="3" height="6" fill="#7D2B35" />
                    <rect x="-9" y="-3" width="3" height="6" fill="#7D2B35" />
                  </g>

                  {/* Podium/Lectern at West */}
                  <g transform="translate(34, 60)" className="artifact-west">
                    <path d="M-5,-5 L5,-5 L4,5 L-4,5 Z" fill="#7D2B35" />
                    <rect x="-6" y="-6.5" width="12" height="2" fill="#7D2B35" />
                    <line x1="-3" y1="-2.5" x2="3" y2="-2.5" stroke="#F5EDD7" strokeWidth="1" />
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="#F5EDD7" strokeWidth="1" />
                    <line x1="-3" y1="2.5" x2="3" y2="2.5" stroke="#F5EDD7" strokeWidth="1" />
                  </g>
                </g>
                
                {/* Clock mechanism - inner decorative elements */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="30" 
                  fill="none" 
                  stroke="#D4AF37" 
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  className="inner-decorative-ring" 
                />
                
                {/* Time travel artifact symbols */}
                <g className="time-travel-symbols rotating-symbols">
                  <g transform="translate(60, 42)">
                    <path d="M-2,-2 L2,-2 L0,-6 Z" fill="#7D2B35" opacity="0.7" />
                  </g>
                  <g transform="translate(78, 60)">
                    <path d="M-2,-2 L-2,2 L2,0 Z" fill="#7D2B35" opacity="0.7" />
                  </g>
                  <g transform="translate(60, 78)">
                    <path d="M-2,2 L2,2 L0,-2 Z" fill="#7D2B35" opacity="0.7" />
                  </g>
                  <g transform="translate(42, 60)">
                    <path d="M2,-2 L2,2 L-2,0 Z" fill="#7D2B35" opacity="0.7" />
                  </g>
                </g>
                
                {/* Clock hands */}
                <g className="clock-hands">
                  {/* Hour hand */}
                  <line 
                    x1="60" 
                    y1="60" 
                    x2="60" 
                    y2="30" 
                    stroke="#7D2B35" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className="hour-hand main-hour-hand" 
                  />
                  
                  {/* Minute hand */}
                  <line 
                    x1="60" 
                    y1="60" 
                    x2="60" 
                    y2="22" 
                    stroke="#D4AF37" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className="minute-hand main-minute-hand" 
                  />
                  
                  {/* Compass needle */}
                  <g className="compass-needle main-compass-needle">
                    <path d="M60,60 L56,38 L60,32 L64,38 Z" fill="#7D2B35" />
                    <path d="M60,60 L56,82 L60,88 L64,82 Z" fill="#D4AF37" />
                  </g>
                </g>
                
                {/* Central hub */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="6" 
                  fill="#7D2B35" 
                  stroke="#D4AF37" 
                  strokeWidth="1"
                  className="center-hub" 
                />
                
                {/* Time travel spark effect */}
                <g className="time-sparks">
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={`spark-${i}`}
                      cx="60"
                      cy="60"
                      r="1"
                      fill="#D4AF37"
                      className={`time-spark spark-${i}`}
                      style={{
                        transform: `translate(${Math.cos(i * Math.PI / 4) * 10}px, ${Math.sin(i * Math.PI / 4) * 10}px)`,
                      }}
                    />
                  ))}
                </g>
              </svg>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl mb-4">
              <span className="gold-shimmer-text">The Subs <span className="font-normal">AI</span></span><sup className="text-xs relative -top-3 text-burgundy">™</sup>
            </h1>
            
            <p className="font-serif text-darkbrown italic mb-4 text-lg">Step back in time and engage with history's greatest minds</p>
            
            <p className="text-darkbrown/70 text-xs italic font-serif mb-6">For educational purposes only. Provided by The Magdalena Foundation.</p>
            
            <div className="flex justify-center flex-wrap gap-8 mb-8">
              <div className="flex items-center text-sm text-darkbrown">
                <UserIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span className="font-serif">Historical Figures</span>
              </div>
              <div className="flex items-center text-sm text-darkbrown">
                <MusicIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span className="font-serif">Voice Generation</span>
              </div>
              <div className="flex items-center text-sm text-darkbrown">
                <BookOpenIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span className="font-serif">Knowledge Base</span>
              </div>
            </div>
            
            <p className="text-darkbrown mb-8 max-w-2xl mx-auto">
              Have a one-on-one conversation with AI versions of history's greatest figures and immerse yourself in their knowledge and perspectives.
            </p>
            
            <a href="#figure-selection" className="inline-block bg-burgundy hover:bg-burgundy/90 text-cream py-3 px-8 rounded-md font-serif transition-colors relative gold-shimmer overflow-hidden">
              Select a historical figure below to begin
            </a>
          </div>
        </div>
      </section>

      <PageDivider />

      {/* Figure Selection Section */}
      <section id="figure-selection" className="py-6 md:py-10 flex-grow">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-10 gold-shimmer-text">
            Select your conversational partner
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-darkbrown">Loading historical figures...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subs.map((sub: Sub) => (
                <SubCard 
                  key={sub.id} 
                  sub={sub} 
                  hasVideo={!!sub.videoUrl}
                  videoSrc={sub.videoUrl || undefined}
                />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-right">
            <Link href="/admin">
              <div className="text-burgundy hover:text-burgundy/70 text-sm flex items-center ml-auto transition-colors cursor-pointer">
                <span className="font-serif">Admin Videos</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-cream border border-gold/30 gold-shimmer-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl gold-shimmer-text">Upload Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-darkbrown font-serif">Select a video file to upload for this historical figure.</p>
            
            {/* File upload guidance */}
            <div className="mb-4 bg-beige/50 border border-gold/20 rounded-md p-3 text-sm text-darkbrown">
              <h3 className="font-serif font-medium mb-1 flex items-center">
                <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-burgundy/10 text-burgundy mr-2 text-xs">i</span>
                File Requirements:
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Video files only (MP4 recommended)</li>
                <li>No file size limit - larger files may take longer to upload</li>
                <li>Previously uploaded videos will be replaced</li>
              </ul>
            </div>
            
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-darkbrown file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-serif file:bg-burgundy file:text-cream hover:file:bg-burgundy/90"
            />
            
            {uploadMutation.isPending && (
              <div className="mt-4 flex items-center justify-center p-2 bg-burgundy/5 border border-burgundy/20 rounded-md">
                <div className="animate-spin w-5 h-5 border-2 border-burgundy border-r-transparent rounded-full mr-2"></div>
                <p className="text-sm text-burgundy font-serif">Uploading video...</p>
              </div>
            )}
            
            {uploadMutation.isError && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                <p className="font-serif">Upload failed: {uploadMutation.error.message}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              className="border-burgundy text-burgundy hover:bg-burgundy/10 font-serif"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              disabled={uploadMutation.isPending}
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              className="bg-burgundy hover:bg-burgundy/90 text-cream font-serif gold-shimmer relative overflow-hidden"
            >
              {uploadMutation.isPending ? "Uploading..." : "Select File"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
