import { Link } from "react-router-dom";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, TrendingUp, Shield, Search, Loader2, RefreshCw } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mockData";
import { formatDate, truncateAddress } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/wagmi";
import { formatEther } from "viem";
import { useToast } from "@/hooks/use-toast";

// Number of events on the contract
const TOTAL_EVENTS = 11;

interface ResaleListing {
  ticketId: bigint;
  seller: string;
  price: bigint;
  eventId: number;
  tierId: number;
  seatIdentifier: string;
  originalPrice: bigint;
}

export default function Resale() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buyingTicketId, setBuyingTicketId] = useState<bigint | null>(null);

  // Contract write for buying
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Query all event tickets with caching
  const eventTicketQueries = Array.from({ length: TOTAL_EVENTS }, (_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getEventTickets" as const,
    args: [BigInt(i)],
  }));

  const { data: eventTicketsData } = useReadContracts({
    contracts: eventTicketQueries,
    query: {
      staleTime: 5 * 60_000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  // Collect all ticket IDs (memoized to prevent re-renders)
  const allTicketIds = useMemo(() => {
    const ids: bigint[] = [];
    if (eventTicketsData) {
      eventTicketsData.forEach((result) => {
        if (result.status === "success" && Array.isArray(result.result)) {
          ids.push(...(result.result as bigint[]));
        }
      });
    }
    return ids;
  }, [eventTicketsData]);

  // Query resale listings for all tickets (with caching)
  const resaleQueries = useMemo(() =>
    allTicketIds.map((ticketId) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "resaleListings" as const,
      args: [ticketId],
    })),
    [allTicketIds]
  );

  const { data: resaleData, refetch: refetchResale } = useReadContracts({
    contracts: resaleQueries,
    query: {
      enabled: allTicketIds.length > 0,
      staleTime: 5 * 60_000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  // Query ticket info for active listings (memoized)
  const activeTicketIds = useMemo(() => {
    return allTicketIds.filter((_, index) => {
      if (!resaleData || !resaleData[index]) return false;
      const result = resaleData[index];
      if (result.status !== "success") return false;
      const listing = result.result as [bigint, string, bigint, boolean];
      return listing[3]; // active flag
    });
  }, [allTicketIds, resaleData]);

  const ticketInfoQueries = useMemo(() =>
    activeTicketIds.map((ticketId) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getTicketInfo" as const,
      args: [ticketId],
    })),
    [activeTicketIds]
  );

  const { data: ticketInfoData, refetch: refetchTicketInfo } = useReadContracts({
    contracts: ticketInfoQueries,
    query: {
      enabled: activeTicketIds.length > 0,
      staleTime: 5 * 60_000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  // Build listings from data
  useEffect(() => {
    if (resaleData && ticketInfoData && activeTicketIds.length > 0) {
      const newListings: ResaleListing[] = [];

      activeTicketIds.forEach((ticketId, index) => {
        const resaleIndex = allTicketIds.indexOf(ticketId);
        const resaleResult = resaleData[resaleIndex];
        const infoResult = ticketInfoData[index];

        if (resaleResult?.status === "success" && infoResult?.status === "success") {
          const listing = resaleResult.result as [bigint, string, bigint, boolean];
          const info = infoResult.result as {
            eventId: bigint;
            tierId: bigint;
            seatIdentifier: string;
            originalPrice: bigint;
          };

          if (listing[3]) { // active
            newListings.push({
              ticketId,
              seller: listing[1],
              price: listing[2],
              eventId: Number(info.eventId),
              tierId: Number(info.tierId),
              seatIdentifier: info.seatIdentifier,
              originalPrice: info.originalPrice,
            });
          }
        }
      });

      setListings(newListings);
      setIsLoading(false);
    } else if (allTicketIds.length === 0 && eventTicketsData) {
      setListings([]);
      setIsLoading(false);
    }
  }, [resaleData, ticketInfoData, activeTicketIds, allTicketIds, eventTicketsData]);

  // Handle successful purchase
  useEffect(() => {
    if (isConfirmed && buyingTicketId) {
      toast({
        title: "Purchase Complete!",
        description: "The ticket has been transferred to your wallet.",
      });
      setBuyingTicketId(null);
      refetchResale();
    }
  }, [isConfirmed, buyingTicketId, toast, refetchResale]);

  const handleBuy = (ticketId: bigint, price: bigint) => {
    setBuyingTicketId(ticketId);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "buyResaleTicket",
      args: [ticketId],
      value: price,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchResale();
      await refetchTicketInfo();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enrich listings with mock event data for display
  const enrichedListings = listings.map((listing) => {
    const mockEvent = MOCK_EVENTS.find((e) => {
      const tier = e.ticketTiers.find((t) => t.tokenId === listing.tierId);
      return tier !== undefined;
    });
    const tier = mockEvent?.ticketTiers.find((t) => t.tokenId === listing.tierId);
    return { ...listing, event: mockEvent, tier };
  }).filter((l) => l.event && l.tier);

  // Filter by search
  const filteredListings = enrichedListings.filter(
    (listing) =>
      listing.event!.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.event!.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number(a.price - b.price);
      case "price-high":
        return Number(b.price - a.price);
      case "date":
        return a.event!.date.getTime() - b.event!.date.getTime();
      default:
        return Number(b.ticketId - a.ticketId); // Most recent by ticket ID
    }
  });

  if (isLoading) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D2870] mx-auto mb-4" />
          <p className="text-gray-600">Loading resale listings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#1a1625]">Resale Marketplace</h1>
          <p className="text-gray-600">
            Buy tickets from other fans at fair, capped prices
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 border-[#3D2870]/20 bg-[#F5F0FF]">
        <CardContent className="py-4 flex items-center gap-4">
          <Shield className="h-8 w-8 text-[#3D2870] flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-[#1a1625]">Price-Capped Resale</h3>
            <p className="text-sm text-gray-600">
              All resale prices are capped by the event organizer (typically 10-50%
              above original price). No scalping, guaranteed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#E8E3F5] focus:border-[#3D2870]"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] border-[#E8E3F5]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="date">Event Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {sortedListings.length === 0 ? (
        <Card className="border-[#E8E3F5]">
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold mb-2 text-[#1a1625]">No Listings Found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "Try a different search term"
                : "No tickets are currently listed for resale. Check back later!"}
            </p>
            <Link to="/">
              <Button variant="outline" className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]">
                Browse Primary Sales
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedListings.map((listing) => {
            const originalPriceNum = Number(formatEther(listing.originalPrice));
            const listingPriceNum = Number(formatEther(listing.price));
            const markup = Math.round(((listingPriceNum - originalPriceNum) / originalPriceNum) * 100);
            const isBuying = buyingTicketId === listing.ticketId && (isWritePending || isConfirming);
            const isOwnListing = address?.toLowerCase() === listing.seller.toLowerCase();

            return (
              <Card key={listing.ticketId.toString()} className="overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-colors">
                <div className="flex flex-col sm:flex-row">
                  {/* Event Image */}
                  <div className="sm:w-48 h-32 sm:h-auto relative">
                    <img
                      src={listing.event!.imageUrl}
                      alt={listing.event!.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Listing Details */}
                  <CardContent className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Link
                        to={`/event/${listing.event!.id}`}
                        className="font-semibold text-[#1a1625] hover:text-[#3D2870] transition-colors"
                      >
                        {listing.event!.name}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">
                          {listing.tier!.name}
                        </Badge>
                        <Badge className="bg-[#F5F0FF] text-[#3D2870]">
                          Seat: {listing.seatIdentifier}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-[#3D2870]" />
                          {formatDate(listing.event!.date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-[#3D2870]" />
                          {listing.event!.city}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Seller: {truncateAddress(listing.seller)}
                        {isOwnListing && <span className="ml-2 text-[#3D2870]">(You)</span>}
                      </p>
                    </div>

                    {/* Price & Buy */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#E8E3F5] sm:pl-4">
                      <div className="text-right">
                        <PriceDisplay xtzAmount={listingPriceNum} size="lg" />
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{markup}% from original
                        </div>
                      </div>
                      {isOwnListing ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          Your Listing
                        </Badge>
                      ) : isConnected ? (
                        <Button
                          size="sm"
                          className="bg-[#3D2870] hover:bg-[#6B5B95]"
                          onClick={() => handleBuy(listing.ticketId, listing.price)}
                          disabled={isBuying}
                        >
                          {isBuying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isConfirming ? "Confirming..." : "Buying..."}
                            </>
                          ) : (
                            "Buy Now"
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
                              Connect to Buy
                            </Button>
                          )}
                        </ConnectButton.Custom>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
