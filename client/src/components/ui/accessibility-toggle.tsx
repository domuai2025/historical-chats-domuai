import React, { useState } from 'react';
import { 
  Eye, 
  Type, 
  ZoomIn, 
  Sparkles, 
  RefreshCw, 
  X,
  SquareAsterisk
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export function AccessibilityToggle() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { 
    settings, 
    toggleHighContrast, 
    toggleLargeText, 
    toggleReducedMotion, 
    resetSettings 
  } = useAccessibility();
  
  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-cream/60 bg-beige text-burgundy"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            aria-label="Accessibility settings"
            aria-expanded={isPanelOpen}
            aria-controls="accessibility-panel"
          >
            <SquareAsterisk size={16} />
            <span className="sr-only">Accessibility settings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Accessibility settings</p>
        </TooltipContent>
      </Tooltip>

      {isPanelOpen && (
        <div 
          id="accessibility-panel"
          className="absolute right-0 mt-2 w-64 p-4 rounded-md border border-gold/30 bg-cream shadow-md z-50"
          role="dialog"
          aria-labelledby="accessibility-heading"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 id="accessibility-heading" className="font-serif text-md text-burgundy">Accessibility</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-burgundy"
              onClick={() => setIsPanelOpen(false)}
              aria-label="Close accessibility panel"
            >
              <X size={15} />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4 text-burgundy" />
                <span className="text-sm text-darkbrown">High Contrast</span>
              </div>
              <Button
                variant={settings.highContrast ? "default" : "outline"}
                size="sm"
                onClick={toggleHighContrast}
                className={settings.highContrast 
                  ? "bg-burgundy text-cream h-7" 
                  : "bg-cream text-burgundy border-burgundy/30 h-7"}
                aria-pressed={settings.highContrast}
              >
                {settings.highContrast ? "On" : "Off"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Type className="mr-2 h-4 w-4 text-burgundy" />
                <span className="text-sm text-darkbrown">Larger Text</span>
              </div>
              <Button
                variant={settings.largeText ? "default" : "outline"}
                size="sm"
                onClick={toggleLargeText}
                className={settings.largeText 
                  ? "bg-burgundy text-cream h-7" 
                  : "bg-cream text-burgundy border-burgundy/30 h-7"}
                aria-pressed={settings.largeText}
              >
                {settings.largeText ? "On" : "Off"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-burgundy" />
                <span className="text-sm text-darkbrown">Reduce Motion</span>
              </div>
              <Button
                variant={settings.reducedMotion ? "default" : "outline"}
                size="sm"
                onClick={toggleReducedMotion}
                className={settings.reducedMotion 
                  ? "bg-burgundy text-cream h-7" 
                  : "bg-cream text-burgundy border-burgundy/30 h-7"}
                aria-pressed={settings.reducedMotion}
              >
                {settings.reducedMotion ? "On" : "Off"}
              </Button>
            </div>
            
            <div className="pt-2 border-t border-gold/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="w-full justify-center text-burgundy h-7"
                aria-label="Reset all accessibility settings"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}