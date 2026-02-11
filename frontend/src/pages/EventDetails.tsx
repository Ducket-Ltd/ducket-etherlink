import { useParams, Link } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Ticket,
  Shield,
  RefreshCw,
  Tag,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { getEventById, getTicketsRemaining, getResaleListingsForEvent, MOCK_EVENTS } from "@/lib/mockData";
import { formatDateTime, truncateAddress } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/wagmi";
import { ExplorerLink } from "@/components/shared/ExplorerLink";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Contract write hook
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isPurchasing = isWritePending || isConfirming;

  // Show success toast when confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast({
        title: "Purchase Successful!",
        description: "Your ticket has been minted. XTZ has been refunded (demo mode).",
      });
      setSelectedTier(null);
      setQuantity(1);
      setTxHash(undefined);
    }
  }, [isConfirmed, txHash, toast]);

  // Show error toast
  useEffect(() => {
    if (writeError) {
      toast({
        title: "Purchase Failed",
        description: writeError.message.includes("User rejected")
          ? "Transaction was cancelled"
          : "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
    }
  }, [writeError, toast]);

  const event = getEventById(id || "");

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#1a1625]">Event Not Found</h1>
        <Link to="/">
          <Button className="bg-[#3D2870] hover:bg-[#6B5B95]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const selectedTierData = event.ticketTiers.find((t) => t.id === selectedTier);

  const handlePurchase = async () => {
    if (!selectedTierData || !isConnected) return;

    // Calculate total price in wei (XTZ has 18 decimals like ETH)
    const totalPrice = selectedTierData.price * quantity;

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'purchaseTicket',
        args: [BigInt(selectedTierData.tokenId), BigInt(quantity)],
        value: parseEther(totalPrice.toString()),
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          toast({
            title: "Transaction Submitted",
            description: "Waiting for confirmation...",
          });
        },
      });
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  return (
    <main className="container py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#3D2870] mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Event Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-4 left-4">
              <Badge className="text-sm bg-[#3D2870]">{event.category}</Badge>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4 text-[#1a1625]">{event.name}</h1>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#3D2870]" />
                {formatDateTime(event.date)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#3D2870]" />
                {event.venue}, {event.city}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Rules */}
          <Card className="border-[#E8E3F5]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-[#1a1625]">
                <Shield className="h-5 w-5 mr-2 text-[#3D2870]" />
                Ticket Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-[#3D2870] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1a1625]">Resale</p>
                  <p className="text-sm text-gray-600">
                    {event.resaleEnabled
                      ? `Allowed up to ${event.maxResalePercentage}% of original price`
                      : "Not allowed for this event"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[#3D2870] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1a1625]">Transfer</p>
                  <p className="text-sm text-gray-600">
                    {event.transferEnabled
                      ? "Free transfers allowed"
                      : "Tickets are non-transferable"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resale Listings Section */}
          {event.resaleEnabled && (
            <ResaleListingsSection eventId={event.id} maxResalePercentage={event.maxResalePercentage} />
          )}
        </div>

        {/* Ticket Selection */}
        <div className="space-y-4">
          <Card className="sticky top-24 border-[#E8E3F5]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#1a1625]">
                <Ticket className="h-5 w-5 mr-2 text-[#3D2870]" />
                Select Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.ticketTiers.map((tier) => {
                const remaining = getTicketsRemaining(tier);
                const soldOut = remaining === 0;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedTier === tier.id
                        ? "border-[#3D2870] bg-[#F5F0FF]"
                        : "border-[#E8E3F5] hover:border-[#6B5B95]"
                    } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !soldOut && setSelectedTier(tier.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-[#1a1625]">{tier.name}</h4>
                        <p className="text-sm text-gray-600">
                          {tier.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <PriceDisplay xtzAmount={tier.price} size="sm" />
                        <p className="text-xs text-gray-500">
                          {soldOut ? "Sold out" : `${remaining} left`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator className="bg-[#E8E3F5]" />

              {/* Quantity selector */}
              {selectedTier && selectedTierData && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1a1625]">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-[#1a1625]">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]"
                      onClick={() =>
                        setQuantity(
                          Math.min(4, quantity + 1, getTicketsRemaining(selectedTierData))
                        )
                      }
                      disabled={
                        quantity >= 4 || quantity >= getTicketsRemaining(selectedTierData)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              {/* Total */}
              {selectedTierData && (
                <div className="flex items-center justify-between py-2">
                  <span className="font-semibold text-[#1a1625]">Total</span>
                  <PriceDisplay xtzAmount={selectedTierData.price * quantity} size="md" />
                </div>
              )}

              {/* Purchase button */}
              {isConnected ? (
                <Button
                  className="w-full bg-[#3D2870] hover:bg-[#6B5B95]"
                  size="lg"
                  disabled={!selectedTier || isPurchasing}
                  onClick={handlePurchase}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isConfirming ? "Confirming..." : "Submitting..."}
                    </>
                  ) : (
                    "Purchase Tickets"
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your wallet to purchase tickets
                  </p>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        className="w-full bg-[#3D2870] hover:bg-[#6B5B95]"
                        size="lg"
                        onClick={openConnectModal}
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}

              <p className="text-xs text-center text-gray-500">
                Powered by Etherlink blockchain
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// Resale Listings Section Component
function ResaleListingsSection({ eventId, maxResalePercentage }: { eventId: string; maxResalePercentage: number }) {
  const { isConnected } = useAccount();
  const resaleListings = getResaleListingsForEvent(eventId);

  if (resaleListings.length === 0) {
    return (
      <Card className="border-[#E8E3F5]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-[#1a1625]">
            <Tag className="h-5 w-5 mr-2 text-[#3D2870]" />
            Resale Marketplace
            <Badge className="ml-2 bg-[#F5F0FF] text-[#3D2870]">
              {maxResalePercentage}% cap
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            No tickets listed for resale yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E8E3F5]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-[#1a1625]">
          <Tag className="h-5 w-5 mr-2 text-[#3D2870]" />
          Resale Marketplace
          <Badge className="ml-2 bg-[#F5F0FF] text-[#3D2870]">
            {maxResalePercentage}% cap
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resaleListings.map((listing) => {
          const event = MOCK_EVENTS.find((e) => e.id === listing.eventId);
          const tier = event?.ticketTiers.find((t) => t.id === listing.tierId);
          const markup = Math.round(
            ((listing.listingPrice - listing.originalPrice) / listing.originalPrice) * 100
          );

          return (
            <div
              key={listing.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[#E8E3F5] hover:border-[#3D2870]/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">
                    {tier?.name || "Unknown"}
                  </Badge>
                  <span className="text-xs text-gray-500">#{listing.seatId}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Seller: {truncateAddress(listing.seller)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <PriceDisplay xtzAmount={listing.listingPrice} size="sm" />
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{markup}% from original
                  </div>
                </div>
                {isConnected ? (
                  <Button size="sm" className="bg-[#3D2870] hover:bg-[#6B5B95]">
                    Buy
                  </Button>
                ) : (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        size="sm"
                        className="bg-[#3D2870] hover:bg-[#6B5B95]"
                        onClick={openConnectModal}
                      >
                        Connect
                      </Button>
                    )}
                  </ConnectButton.Custom>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
