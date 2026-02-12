import { useParams, Link, useNavigate } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from "wagmi";
import { parseEther, formatEther } from "viem";
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
} from "lucide-react";
import { getEventById, getTicketsRemaining, MOCK_EVENTS } from "@/lib/mockData";
import { formatDateTime, truncateAddress } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/wagmi";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
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

  // Show success toast when confirmed and redirect to My Tickets
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast({
        title: "Purchase Successful!",
        description: "Your ticket has been minted. XTZ has been refunded (demo mode).",
      });
      setSelectedTier(null);
      setQuantity(1);
      setTxHash(undefined);
      // Redirect to My Tickets with timestamp to identify new tickets
      navigate("/my-tickets", { state: { purchaseTimestamp: Math.floor(Date.now() / 1000) } });
    }
  }, [isConfirmed, txHash, toast, navigate]);

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
            <ResaleListingsSection
              eventId={event.id}
              maxResalePercentage={event.maxResalePercentage}
              ticketTiers={event.ticketTiers}
            />
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

// Resale Listings Section Component - Fetches on-chain data
interface ResaleListingsSectionProps {
  eventId: string;
  maxResalePercentage: number;
  ticketTiers: Array<{ id: string; tokenId: number; name: string; price: number }>;
}

interface OnChainResaleListing {
  ticketId: bigint;
  seller: string;
  price: bigint;
  originalPrice: bigint;
  seatIdentifier: string;
  tierId: number;
  tierName: string;
}

function ResaleListingsSection({ eventId, maxResalePercentage, ticketTiers }: ResaleListingsSectionProps) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [buyingTicketId, setBuyingTicketId] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Get contract eventId by querying the first tier
  const firstTierTokenId = ticketTiers[0]?.tokenId ?? 0;

  // Query ticket tier to get the contract's eventId
  const { data: tierData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTicketTier",
    args: [BigInt(firstTierTokenId)],
  });

  const contractEventId = tierData?.eventId ?? BigInt(0);

  // Get all tickets for this event
  const { data: eventTickets, isLoading: isLoadingTickets } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getEventTickets",
    args: [contractEventId],
    query: {
      enabled: !!tierData,
    },
  });

  // Query resale listings for all tickets
  const resaleQueries = (eventTickets || []).map((ticketId: bigint) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "resaleListings" as const,
    args: [ticketId],
  }));

  const { data: resaleResults, isLoading: isLoadingResale } = useReadContracts({
    contracts: resaleQueries,
    query: {
      enabled: (eventTickets || []).length > 0,
    },
  });

  // Query ticket info for listed tickets
  const ticketInfoQueries = (eventTickets || []).map((ticketId: bigint) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTicketInfo" as const,
    args: [ticketId],
  }));

  const { data: ticketInfoResults } = useReadContracts({
    contracts: ticketInfoQueries,
    query: {
      enabled: (eventTickets || []).length > 0,
    },
  });

  // Contract write for buying resale tickets
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle buy success
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast({
        title: "Purchase Successful!",
        description: "You've purchased a resale ticket. XTZ has been refunded (demo mode).",
      });
      setBuyingTicketId(null);
      setTxHash(undefined);
    }
  }, [isConfirmed, txHash, toast]);

  // Build active listings from results
  const activeListings: OnChainResaleListing[] = [];
  if (resaleResults && ticketInfoResults && eventTickets) {
    resaleResults.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const [ticketId, seller, price, active] = result.result as [bigint, string, bigint, boolean];
        if (active && ticketInfoResults[index]?.status === "success") {
          const ticketInfo = ticketInfoResults[index].result as {
            eventId: bigint;
            tierId: bigint;
            seatIdentifier: string;
            originalPrice: bigint;
          };
          const tier = ticketTiers.find((t) => t.tokenId === Number(ticketInfo.tierId));
          activeListings.push({
            ticketId,
            seller,
            price,
            originalPrice: ticketInfo.originalPrice,
            seatIdentifier: ticketInfo.seatIdentifier,
            tierId: Number(ticketInfo.tierId),
            tierName: tier?.name || "Unknown",
          });
        }
      }
    });
  }

  const handleBuyResale = (ticketId: bigint, price: bigint) => {
    setBuyingTicketId(ticketId);
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "buyResaleTicket",
        args: [ticketId],
        value: price,
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
          toast({
            title: "Transaction Submitted",
            description: "Waiting for confirmation...",
          });
        },
        onError: (error) => {
          setBuyingTicketId(null);
          toast({
            title: "Purchase Failed",
            description: error.message.includes("User rejected")
              ? "Transaction was cancelled"
              : "Failed to purchase ticket. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isLoading = isLoadingTickets || isLoadingResale;

  if (isLoading) {
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
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#3D2870] mr-2" />
            <span className="text-gray-600">Loading resale listings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeListings.length === 0) {
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
        {activeListings.map((listing) => {
          const listingPriceXtz = Number(formatEther(listing.price));
          const originalPriceXtz = Number(formatEther(listing.originalPrice));
          const markup = Math.round(((listingPriceXtz - originalPriceXtz) / originalPriceXtz) * 100);
          const isBuying = buyingTicketId === listing.ticketId && (isWritePending || isConfirming);

          return (
            <div
              key={listing.ticketId.toString()}
              className="flex items-center justify-between p-3 rounded-lg border border-[#E8E3F5] hover:border-[#3D2870]/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">
                    {listing.tierName}
                  </Badge>
                  <span className="text-xs text-gray-500">#{listing.seatIdentifier}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Seller: {truncateAddress(listing.seller)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <PriceDisplay xtzAmount={listingPriceXtz} size="sm" />
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{markup}% from original
                  </div>
                </div>
                {isConnected ? (
                  <Button
                    size="sm"
                    className="bg-[#3D2870] hover:bg-[#6B5B95]"
                    disabled={isBuying}
                    onClick={() => handleBuyResale(listing.ticketId, listing.price)}
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        {isConfirming ? "Confirming..." : "Buying..."}
                      </>
                    ) : (
                      "Buy"
                    )}
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
