import { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BANNER_DISMISSED_KEY = 'ducket-demo-banner-dismissed';

export function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const location = useLocation();

  useEffect(() => {
    // Check session storage on mount
    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  // Reset on route change (show banner again when navigating)
  useEffect(() => {
    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissed !== 'true') {
      setIsDismissed(false);
    }
  }, [location.pathname]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-[#3D2870] to-[#6B5B95] text-white py-2.5 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Ticket className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Demo Mode</strong> — Purchases are auto-refunded. You keep the NFT ticket + your XTZ.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
