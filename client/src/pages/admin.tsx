import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { fetchSubs, deleteSub, optimizeAllVideos, cleanupStorage } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeftIcon, Trash2Icon, PlayCircleIcon, FilmIcon, ZapIcon, SettingsIcon, ArchiveIcon, FolderIcon } from "lucide-react";

// Define types for the subs
interface Sub {
  id: number;
  name: string;
  title: string;
  videoUrl: string | null;
  [key: string]: any; // For any other properties
}

// Optimize Videos Button Component
function OptimizeVideosButton() {
  const { toast } = useToast();
  const [optimizationStarted, setOptimizationStarted] = useState(false);
  
  const optimizeMutation = useMutation({
    mutationFn: optimizeAllVideos,
    onSuccess: (data) => {
      toast({
        title: "Optimization Started",
        description: "Video optimization is running in the background. This may take several minutes.",
      });
      setOptimizationStarted(true);
      
      // Reset the button after 30 seconds
      setTimeout(() => {
        setOptimizationStarted(false);
      }, 30000);
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to start video optimization",
        variant: "destructive",
      });
      setOptimizationStarted(false);
    }
  });
  
  const handleOptimize = () => {
    optimizeMutation.mutate();
  };
  
  return (
    <Button 
      variant="default"
      size="lg"
      className="bg-burgundy hover:bg-burgundy/90 text-cream shadow-gold-sm w-full md:w-auto"
      onClick={handleOptimize}
      disabled={optimizeMutation.isPending || optimizationStarted}
    >
      {optimizeMutation.isPending ? (
        <>
          <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          Starting optimization...
        </>
      ) : optimizationStarted ? (
        <>
          <ZapIcon className="w-4 h-4 mr-2" />
          Optimization in progress...
        </>
      ) : (
        <>
          <ZapIcon className="w-4 h-4 mr-2" />
          Optimize All Videos
        </>
      )}
    </Button>
  );
}

// Cleanup Storage Button Component
function CleanupStorageButton() {
  const { toast } = useToast();
  const [cleanupStarted, setCleanupStarted] = useState(false);
  
  const cleanupMutation = useMutation({
    mutationFn: cleanupStorage,
    onSuccess: (data) => {
      toast({
        title: "Storage Cleanup Started",
        description: "Storage cleanup and maintenance is running in the background. This may take a few minutes.",
      });
      setCleanupStarted(true);
      
      // Reset the button after 20 seconds
      setTimeout(() => {
        setCleanupStarted(false);
      }, 20000);
    },
    onError: (error) => {
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to start storage cleanup",
        variant: "destructive",
      });
      setCleanupStarted(false);
    }
  });
  
  const handleCleanup = () => {
    cleanupMutation.mutate();
  };
  
  return (
    <Button 
      variant="default"
      size="lg"
      className="bg-burgundy hover:bg-burgundy/90 text-cream shadow-gold-sm w-full md:w-auto"
      onClick={handleCleanup}
      disabled={cleanupMutation.isPending || cleanupStarted}
    >
      {cleanupMutation.isPending ? (
        <>
          <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          Starting cleanup...
        </>
      ) : cleanupStarted ? (
        <>
          <ArchiveIcon className="w-4 h-4 mr-2" />
          Cleanup in progress...
        </>
      ) : (
        <>
          <FolderIcon className="w-4 h-4 mr-2" />
          Clean Up Storage
        </>
      )}
    </Button>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  const { data: subs = [], isLoading } = useQuery<Sub[]>({
    queryKey: ['/api/subs'],
    queryFn: fetchSubs
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subs'] });
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteClick = (subId: number) => {
    setSelectedSubId(subId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedSubId !== null) {
      deleteMutation.mutate(selectedSubId.toString());
    }
  };
  
  const handlePreviewClick = (videoUrl: string | null) => {
    if (videoUrl) {
      setVideoPreviewUrl(videoUrl);
      setPreviewDialogOpen(true);
    } else {
      toast({
        title: "No Video Available",
        description: "This sub does not have a video uploaded yet.",
      });
    }
  };
  
  const subsWithVideos = subs.filter((sub: Sub) => sub.videoUrl);
  
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center">
            <Link href="/">
              <a className="flex items-center text-burgundy hover:text-mutedred transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                <span>Back to Home</span>
              </a>
            </Link>
          </div>
          
          {/* Video Optimization Card */}
          <Card className="border-gold/30 shadow-vintage mb-8">
            <CardHeader className="bg-burgundy/5">
              <CardTitle className="text-2xl font-playfair text-burgundy">
                <div className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Video Optimization Tools
                </div>
              </CardTitle>
              <CardDescription className="text-darkbrown/70">
                Optimize video files to reduce size and improve playback performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-beige/50 rounded-md p-6 border border-gold/20 mb-6">
                <h3 className="text-lg font-medium text-darkbrown mb-3">Batch Video Optimization</h3>
                <p className="text-darkbrown/80 mb-4">
                  This process will optimize all uploaded videos to reduce file sizes while maintaining quality.
                  Optimization runs in the background and may take several minutes depending on the number and size of videos.
                </p>
                <OptimizeVideosButton />
              </div>
              
              <div className="bg-beige/50 rounded-md p-6 border border-gold/20">
                <h3 className="text-lg font-medium text-darkbrown mb-3">Storage Cleanup</h3>
                <p className="text-darkbrown/80 mb-4">
                  This process will clean up unused files, organize the uploads folder, and perform maintenance
                  to optimize storage usage. The process runs in the background.
                </p>
                <CleanupStorageButton />
              </div>
            </CardContent>
          </Card>
          

          {/* Video Management Card */}
          <Card className="border-gold/30 shadow-vintage mb-8">
            <CardHeader className="bg-burgundy/5">
              <CardTitle className="text-2xl font-playfair text-burgundy">
                <div className="flex items-center">
                  <FilmIcon className="w-5 h-5 mr-2" />
                  Video Management
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h2 className="text-xl font-playfair text-darkbrown mb-4">Uploaded Videos</h2>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-darkbrown">Loading videos...</p>
                </div>
              ) : subsWithVideos.length === 0 ? (
                <div className="bg-beige rounded-md p-6 text-center">
                  <p className="text-darkbrown/70 mb-2">No videos have been uploaded yet.</p>
                  <Link href="/">
                    <a className="text-burgundy hover:text-mutedred transition-colors">
                      Go to the home page to upload videos
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-playfair">Name</TableHead>
                        <TableHead className="font-playfair">Title</TableHead>
                        <TableHead className="font-playfair">Video</TableHead>
                        <TableHead className="font-playfair text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subsWithVideos.map((sub: Sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell>{sub.title}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-burgundy hover:text-burgundy/80 hover:bg-burgundy/10"
                              onClick={() => handlePreviewClick(sub.videoUrl)}
                            >
                              <PlayCircleIcon className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(sub.id)}
                            >
                              <Trash2Icon className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-cream">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-burgundy">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-burgundy text-burgundy hover:bg-burgundy/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Video Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="bg-cream max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-burgundy">Video Preview</DialogTitle>
          </DialogHeader>
          {videoPreviewUrl && (
            <div className="aspect-video">
              <video 
                src={videoPreviewUrl} 
                controls 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
