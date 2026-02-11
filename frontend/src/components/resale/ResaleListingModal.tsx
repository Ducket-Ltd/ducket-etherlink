import { useState, useEffect } from 'react';
import { Tag, AlertCircle, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { ExplorerLink } from '@/components/shared/ExplorerLink';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { useXtzPrice } from '@/hooks/useXtzPrice';

interface ResaleListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  eventName: string;
  tierName: string;
  originalPrice: number; // in XTZ
  maxResalePercentage: number; // e.g., 150 for 150%
  onList: (price: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

export function ResaleListingModal({
  isOpen,
  onClose,
  ticketId,
  eventName,
  tierName,
  originalPrice,
  maxResalePercentage,
  onList,
}: ResaleListingModalProps) {
  const { convertXtzToFiat } = useXtzPrice();
  const maxPrice = (originalPrice * maxResalePercentage) / 100;
  const [listingPrice, setListingPrice] = useState(originalPrice);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setListingPrice(originalPrice);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, originalPrice]);

  const markup = ((listingPrice / originalPrice) * 100 - 100).toFixed(0);
  const isAtMax = listingPrice >= maxPrice;
  const isValidPrice = listingPrice >= originalPrice && listingPrice <= maxPrice;

  const handlePriceChange = (value: number[]) => {
    setListingPrice(Number(value[0].toFixed(2)));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value > maxPrice) {
        setListingPrice(maxPrice);
        setError(`Maximum price is ${maxPrice.toFixed(2)} XTZ (${maxResalePercentage}% cap)`);
      } else if (value < originalPrice) {
        setListingPrice(value);
        setError('Price cannot be below original price');
      } else {
        setListingPrice(value);
        setError(null);
      }
    }
  };

  const handleList = async () => {
    if (!isValidPrice) {
      setError('Please enter a valid price within the allowed range');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onList(listingPrice);
      if (result.success && result.txHash) {
        setSuccess({ txHash: result.txHash });
      } else {
        setError(result.error || 'Failed to list ticket. Please try again.');
      }
    } catch (err) {
      setError('Failed to list ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setListingPrice(originalPrice);
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#3D2870]" />
            List for Resale
          </DialogTitle>
          <DialogDescription>
            Set your resale price (max {maxResalePercentage}% of original).
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Listed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your ticket is now available in the resale marketplace.
              </p>
              <ExplorerLink txHash={success.txHash} className="text-sm" />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {/* Ticket Info */}
              <div className="bg-[#F5F0FF] rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Listing</p>
                <p className="font-semibold text-[#1a1625]">{eventName}</p>
                <p className="text-sm text-gray-500">{tierName} • #{ticketId}</p>
              </div>

              {/* Price Range Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Original Price</p>
                  <PriceDisplay xtzAmount={originalPrice} size="sm" />
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Max Resale ({maxResalePercentage}%)</p>
                  <PriceDisplay xtzAmount={maxPrice} size="sm" />
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Your Listing Price</Label>
                  {Number(markup) > 0 && (
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <TrendingUp className="h-3 w-3" />
                      +{markup}% markup
                    </span>
                  )}
                </div>
                <Slider
                  value={[listingPrice]}
                  onValueChange={handlePriceChange}
                  min={originalPrice}
                  max={maxPrice}
                  step={0.01}
                  className="py-2"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={listingPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min={originalPrice}
                    max={maxPrice}
                    className="font-mono"
                  />
                  <span className="text-gray-500 whitespace-nowrap">XTZ</span>
                </div>
                <p className="text-sm text-gray-500">
                  ≈ ${convertXtzToFiat(listingPrice).toFixed(2)} USD
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Max Price Warning */}
              {isAtMax && !error && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    You're listing at the maximum allowed price ({maxResalePercentage}% cap).
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleList}
                disabled={!isValidPrice || isLoading}
                className="bg-[#3D2870] hover:bg-[#6B5B95]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listing...
                  </>
                ) : (
                  <>
                    <Tag className="mr-2 h-4 w-4" />
                    List for {listingPrice.toFixed(2)} XTZ
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
