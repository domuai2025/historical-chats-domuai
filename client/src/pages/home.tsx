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

export default function Home() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: subs = [], isLoading } = useQuery({
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
    const formData = new FormData();
    formData.append('video', file);

    uploadMutation.mutate({ subId: selectedSubId, formData });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-cream py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-beige border border-gold/30 rounded-lg shadow-vintage-lg p-6 md:p-8 text-center">
            <div className="mx-auto w-20 h-20 mb-4">
              <div className="w-full h-full rounded-full bg-cream border-2 border-gold p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-cream border border-dashed border-burgundy flex items-center justify-center">
                  <div className="font-playfair text-burgundy text-xl">
                    The Subs <span className="text-gold">AI</span>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="font-playfair text-burgundy text-4xl mb-2">The Subs <span className="text-gold">AI</span></h1>
            <div className="w-6 h-6 relative mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border border-burgundy opacity-30"></div>
              <div className="absolute inset-1 rounded-full border border-burgundy opacity-10"></div>
            </div>
            <p className="font-lora text-darkbrown italic mb-6">Talk to and learn from history's greatest minds</p>
            
            <div className="flex justify-center flex-wrap gap-6 mb-8">
              <div className="flex items-center text-sm text-darkbrown">
                <UserIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span>Historical Figures</span>
              </div>
              <div className="flex items-center text-sm text-darkbrown">
                <MusicIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span>Voice Generation</span>
              </div>
              <div className="flex items-center text-sm text-darkbrown">
                <BookOpenIcon className="w-5 h-5 mr-2 text-burgundy" />
                <span>Knowledge Base</span>
              </div>
            </div>
            
            <p className="text-darkbrown mb-6 max-w-2xl mx-auto">
              Have a one-on-one chat with AI versions of renowned figures from history and culture.
            </p>
            
            <a href="#figure-selection" className="inline-block bg-burgundy hover:bg-burgundy/90 text-cream py-3 px-6 rounded-md font-lora transition-colors shadow-sm">
              Select a historical figure below to begin
            </a>
          </div>
        </div>
      </section>

      <PageDivider />

      {/* Figure Selection Section */}
      <section id="figure-selection" className="py-6 md:py-10 flex-grow">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair text-2xl md:text-3xl text-darkbrown text-center mb-10">
            Select your conversational partner
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-darkbrown">Loading historical figures...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subs.map((sub) => (
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
              <a className="text-burgundy hover:text-mutedred text-sm flex items-center ml-auto transition-colors">
                <span>Admin Videos</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-cream">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-burgundy">Upload Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-darkbrown">Select a video file to upload for this historical figure.</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-darkbrown file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-burgundy file:text-cream hover:file:bg-burgundy/90"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              className="border-burgundy text-burgundy hover:bg-burgundy/10"
            >
              Cancel
            </Button>
            <Button
              disabled={uploadMutation.isPending}
              className="bg-burgundy hover:bg-burgundy/90 text-cream"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
