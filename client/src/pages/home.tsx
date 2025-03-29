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
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Video file must be smaller than 100MB",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('video', file);
    
    toast({
      title: "Uploading...",
      description: "Please wait while we upload your video",
    });

    uploadMutation.mutate({ subId: selectedSubId, formData });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-cream py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-beige border border-gold/20 rounded-lg p-6 md:p-10 text-center">
            <div className="mx-auto w-24 h-24 mb-6">
              <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="58" fill="#F5F2E9" stroke="#D4AF37" strokeWidth="4" />
                <circle cx="60" cy="60" r="50" fill="#F5F2E9" stroke="#7D2B35" strokeWidth="2" strokeDasharray="4 4" />
                <g fill="#7D2B35">
                  <path d="M60 50 Q64 40 68 50 V70 Q68 76 60 76 Q52 76 52 70 V50 Z" />
                  <rect x="52" y="70" width="16" height="4" rx="2" />
                  <path d="M35 30 Q38 25 41 30 V40 Q41 44 35 44 Q29 44 29 40 V30 Z" />
                  <rect x="29" y="40" width="12" height="3" rx="1.5" />
                  <path d="M85 30 Q88 25 91 30 V40 Q91 44 85 44 Q79 44 79 40 V30 Z" />
                  <rect x="79" y="40" width="12" height="3" rx="1.5" />
                  <path d="M35 75 Q38 70 41 75 V85 Q41 89 35 89 Q29 89 29 85 V75 Z" />
                  <rect x="29" y="85" width="12" height="3" rx="1.5" />
                  <path d="M85 75 Q88 70 91 75 V85 Q91 89 85 89 Q79 89 79 85 V75 Z" />
                  <rect x="79" y="85" width="12" height="3" rx="1.5" />
                </g>
              </svg>
            </div>
            
            <h1 className="font-serif text-burgundy text-4xl md:text-5xl mb-4">The Subs <span className="text-gold font-normal">AI</span></h1>
            
            <div className="w-6 h-6 relative mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border border-burgundy opacity-30"></div>
              <div className="absolute inset-2 rounded-full border border-burgundy opacity-10"></div>
            </div>
            
            <p className="font-serif text-darkbrown italic mb-8 text-lg">Talk to and learn from history's greatest minds</p>
            
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
              Have a one-on-one chat with AI versions of renowned figures from history and culture.
            </p>
            
            <a href="#figure-selection" className="inline-block bg-burgundy hover:bg-burgundy/90 text-cream py-3 px-8 rounded-md font-serif transition-colors">
              Select a historical figure below to begin
            </a>
          </div>
        </div>
      </section>

      <PageDivider />

      {/* Figure Selection Section */}
      <section id="figure-selection" className="py-6 md:py-10 flex-grow">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-burgundy text-center mb-10">
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
                  onUploadClick={handleUploadClick} 
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
        <DialogContent className="bg-cream border border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-burgundy">Upload Video</DialogTitle>
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
                <li>Video files only (MP4, WebM, MOV, etc.)</li>
                <li>Maximum size: 100MB</li>
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
              className="bg-burgundy hover:bg-burgundy/90 text-cream font-serif"
            >
              {uploadMutation.isPending ? "Uploading..." : "Select File"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
