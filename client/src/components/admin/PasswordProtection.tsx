import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PasswordProtectionProps {
  targetRoute: string;
  correctPassword: string;
}

export default function PasswordProtection({ targetRoute, correctPassword }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple client-side password check
    // Note: In a production app, this should be handled server-side
    if (password === correctPassword) {
      // Store in session storage to maintain login for the session
      sessionStorage.setItem('adminAuthenticated', 'true');
      setLocation(targetRoute);
      toast({
        title: "Authentication successful",
        description: "Welcome to the admin panel",
      });
    } else {
      setIsSubmitting(false);
      toast({
        title: "Authentication failed",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-lg border border-gold/30 shadow-vintage p-6">
        <h1 className="text-2xl font-playfair text-burgundy mb-6 text-center">Admin Authentication</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="border-gold/30 focus:border-burgundy focus:ring-burgundy/20"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-burgundy hover:bg-burgundy/90 text-cream"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                Verifying...
              </>
            ) : "Access Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Helper function to check if the user is authenticated
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('adminAuthenticated') === 'true';
}