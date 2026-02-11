import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
import { ExplorerLink } from './ExplorerLink';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  eventName: string;
  tierName: string;
  onTransfer: (recipientAddress: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function TransferModal({
  isOpen,
  onClose,
  ticketId,
  eventName,
  tierName,
  onTransfer,
}: TransferModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  const handleTransfer = async () => {
    if (!isValidAddress(recipientAddress)) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onTransfer(recipientAddress);
      if (result.success && result.txHash) {
        setSuccess({ txHash: result.txHash });
      } else {
        setError(result.error || 'Transfer failed. Please try again.');
      }
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress('');
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
            <Send className="h-5 w-5 text-[#3D2870]" />
            Transfer Ticket
          </DialogTitle>
          <DialogDescription>
            Send this ticket to another wallet address.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transfer Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                Your ticket has been transferred successfully.
              </p>
              <ExplorerLink txHash={success.txHash} className="text-sm" />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="bg-[#F5F0FF] rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Transferring</p>
                <p className="font-semibold text-[#1a1625]">{eventName}</p>
                <p className="text-sm text-gray-500">{tierName} • #{ticketId}</p>
              </div>

              {/* Recipient Address Input */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Wallet Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => {
                    setRecipientAddress(e.target.value);
                    setError(null);
                  }}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Enter the Ethereum address of the person you want to send this ticket to.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Warning */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. Make sure the recipient address is correct.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!recipientAddress || isLoading}
                className="bg-[#3D2870] hover:bg-[#6B5B95]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
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
