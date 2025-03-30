import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  url?: string; // Optional custom URL, defaults to current URL
  title?: string; // Optional title for the toast
  variant?: 'default' | 'subtle' | 'icon';
  className?: string;
}

export function ShareButton({ 
  url, 
  title = 'Link copied to clipboard!', 
  variant = 'default',
  className = ''
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      toast({
        title,
        description: "Share this link with others to visit this page.",
        duration: 3000,
      });
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            className={`h-8 w-8 text-burgundy hover:text-gold hover:bg-cream/50 ${className}`}
            aria-label="Share this page"
          >
            <Share2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Share this page</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  if (variant === 'subtle') {
    return (
      <Button 
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={`text-burgundy hover:text-gold hover:bg-cream/50 ${className}`}
      >
        <Share2 size={16} className="mr-2" />
        Share
      </Button>
    );
  }
  
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`border-gold/30 bg-cream text-burgundy hover:bg-gold/10 ${className}`}
    >
      <Share2 size={16} className="mr-2" />
      Share
    </Button>
  );
}