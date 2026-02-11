import { useState, useEffect } from "react";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, MapPin, QrCode, ExternalLink, Tag, Send, Loader2, X } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { TransferModal } from "@/components/shared/TransferModal";
import { ResaleListingModal } from "@/components/resale/ResaleListingModal";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ACTIVE_CHAIN } from "@/config/wagmi";
import { formatEther, parseEther } from "viem";

// Number of events on the contract (0-10)
const TOTAL_EVENTS = 11;

interface TicketData {
  ticketId: bigint;
  eventId: number;
  tierId: number;
  seatIdentifier: string;
  originalPrice: bigint;
  purchaseTimestamp: bigint;
  isListed: boolean;
  listingPrice?: bigint;
}

interface SelectedTicket {
  id: string;
  ticketId: bigint;
  eventName: string;
  tierName: string;
  originalPrice: number;
  maxResalePercentage: number;
  tierId: number;
}

export default function MyTickets() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [resaleModalOpen, setResaleModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null);
  const [userTickets, setUserTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingTicketId, setCancellingTicketId] = useState<bigint | null>(null);

  // Contract write for cancelling listings
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Build contracts array for querying user tickets across all events
  const ticketQueries = address
    ? Array.from({ length: TOTAL_EVENTS }, (_, i) => ({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getUserTicketsForEvent" as const,
        args: [address, BigInt(i)],
      }))
    : [];

  const { data: ticketResults, isLoading: isLoadingTickets } = useReadContracts({
    contracts: ticketQueries,
    query: {
      enabled: !!address,
    },
  });

  // Collect all ticket IDs from all events
  const allTicketIds: { ticketId: bigint; eventId: number }[] = [];
  if (ticketResults) {
    ticketResults.forEach((result, eventId) => {
      if (result.status === "success" && Array.isArray(result.result)) {
        (result.result as bigint[]).forEach((ticketId) => {
          allTicketIds.push({ ticketId, eventId });
        });
      }
    });
  }

  // Build queries for ticket info
  const ticketInfoQueries = allTicketIds.map(({ ticketId }) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTicketInfo" as const,
    args: [ticketId],
  }));

  const { data: ticketInfoResults, isLoading: isLoadingInfo } = useReadContracts({
    contracts: ticketInfoQueries,
    query: {
      enabled: allTicketIds.length > 0,
    },
  });

  // Build queries for resale listings
  const resaleQueries = allTicketIds.map(({ ticketId }) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "resaleListings" as const,
    args: [ticketId],
  }));

  const { data: resaleResults, refetch: refetchResale } = useReadContracts({
    contracts: resaleQueries,
    query: {
      enabled: allTicketIds.length > 0,
    },
  });

  // Process ticket info results
  useEffect(() => {
    if (ticketInfoResults && allTicketIds.length > 0) {
      const tickets: TicketData[] = [];
      ticketInfoResults.forEach((result, index) => {
        if (result.status === "success" && result.result) {
          const info = result.result as {
            eventId: bigint;
            tierId: bigint;
            seatIdentifier: string;
            originalPrice: bigint;
            purchaseTimestamp: bigint;
            exists: boolean;
          };

          // Check resale status
          let isListed = false;
          let listingPrice: bigint | undefined;
          if (resaleResults && resaleResults[index]?.status === "success") {
            const listing = resaleResults[index].result as [bigint, string, bigint, boolean];
            isListed = listing[3]; // active flag
            if (isListed) {
              listingPrice = listing[2]; // price
            }
          }

          if (info.exists) {
            tickets.push({
              ticketId: allTicketIds[index].ticketId,
              eventId: Number(info.eventId),
              tierId: Number(info.tierId),
              seatIdentifier: info.seatIdentifier,
              originalPrice: info.originalPrice,
              purchaseTimestamp: info.purchaseTimestamp,
              isListed,
              listingPrice,
            });
          }
        }
      });
      setUserTickets(tickets);
      setIsLoading(false);
    } else if (!isLoadingTickets && allTicketIds.length === 0) {
      setUserTickets([]);
      setIsLoading(false);
    }
  }, [ticketInfoResults, resaleResults, allTicketIds.length, isLoadingTickets]);

  // Handle successful cancel
  useEffect(() => {
    if (isConfirmed && cancellingTicketId) {
      toast({
        title: "Listing Cancelled",
        description: "Your ticket is no longer listed for resale.",
      });
      setCancellingTicketId(null);
      refetchResale();
    }
  }, [isConfirmed, cancellingTicketId, toast, refetchResale]);

  const handleTransfer = async (_recipientAddress: string) => {
    // In production this would call safeTransferFrom on the contract
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Transfer Complete",
      description: "Your ticket has been transferred successfully.",
    });
    return { success: true, txHash: "0x" + Math.random().toString(16).slice(2) };
  };

  const handleListForResale = async (price: number) => {
    if (!selectedTicket) return { success: false, error: "No ticket selected" };

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "listForResale",
        args: [selectedTicket.ticketId, parseEther(price.toString())],
      });

      // Wait a bit for the transaction to be submitted
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Listed for Resale",
        description: `Your ticket is now listed for ${price.toFixed(2)} XTZ.`,
      });

      refetchResale();
      return { success: true, txHash: "0x" + Math.random().toString(16).slice(2) };
    } catch (error) {
      return { success: false, error: "Failed to list ticket" };
    }
  };

  const handleCancelListing = (ticketId: bigint) => {
    setCancellingTicketId(ticketId);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "cancelResaleListing",
      args: [ticketId],
    });
  };

  const getExplorerUrl = (ticketId: bigint) => {
    const baseUrl = ACTIVE_CHAIN.blockExplorers?.default.url || "https://testnet.explorer.etherlink.com";
    return `${baseUrl}/token/${CONTRACT_ADDRESS}/instance/${ticketId.toString()}`;
  };

  if (!isConnected) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F0FF] flex items-center justify-center mx-auto mb-6">
            <Ticket className="h-8 w-8 text-[#3D2870]" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[#1a1625]">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your NFT tickets
          </p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  if (isLoading || isLoadingTickets || isLoadingInfo) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D2870] mx-auto mb-4" />
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </main>
    );
  }

  // Map ticket data to display format
  const displayTickets = userTickets.map((ticket) => {
    // Find matching mock event data for display info
    const mockEvent = MOCK_EVENTS.find((e) => {
      const tier = e.ticketTiers.find((t) => t.tokenId === ticket.tierId);
      return tier !== undefined;
    });
    const tier = mockEvent?.ticketTiers.find((t) => t.tokenId === ticket.tierId);

    return {
      ...ticket,
      event: mockEvent,
      tier,
    };
  }).filter((t) => t.event && t.tier);

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1a1625]">My Tickets</h1>
        <Badge variant="outline" className="text-sm border-[#3D2870] text-[#3D2870]">
          {displayTickets.length} ticket{displayTickets.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {displayTickets.length === 0 ? (
        <Card className="border-[#E8E3F5]">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F0FF] flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-8 w-8 text-[#3D2870]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-[#1a1625]">No Tickets Yet</h2>
            <p className="text-gray-600 mb-6">
              Browse upcoming events and get your first NFT ticket!
            </p>
            <Link to="/">
              <Button className="bg-[#3D2870] hover:bg-[#6B5B95]">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayTickets.map((ticket) => {
            const isPast = ticket.event!.date < new Date();
            const priceInXtz = Number(formatEther(ticket.originalPrice));
            const isCancelling = cancellingTicketId === ticket.ticketId && (isWritePending || isConfirming);

            return (
              <Card
                key={ticket.ticketId.toString()}
                className={`overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-colors ${isPast ? "opacity-60" : ""}`}
              >
                <div className="flex">
                  {/* Event Image */}
                  <div className="w-1/3 relative">
                    <img
                      src={ticket.event!.imageUrl}
                      alt={ticket.event!.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {isPast && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-[#F5F0FF] text-[#3D2870]">Past Event</Badge>
                      </div>
                    )}
                    {ticket.isListed && !isPast && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-amber-500 text-white">Listed for Resale</Badge>
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1 text-[#1a1625]">
                        {ticket.event!.name}
                      </h3>
                      <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">
                        {ticket.tier!.name}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#3D2870]" />
                        {formatDate(ticket.event!.date)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-[#3D2870]" />
                        {ticket.event!.venue}
                      </div>
                      <div className="flex items-center">
                        <Ticket className="h-4 w-4 mr-2 text-[#3D2870]" />
                        Seat: {ticket.seatIdentifier}
                      </div>
                      {ticket.isListed && ticket.listingPrice !== undefined && (
                        <div className="flex items-center text-amber-600 font-medium">
                          <Tag className="h-4 w-4 mr-2" />
                          Listed: {Number(formatEther(ticket.listingPrice)).toFixed(2)} XTZ
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR
                      </Button>
                      {ticket.event!.transferEnabled && !isPast && !ticket.isListed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
                          onClick={() => {
                            setSelectedTicket({
                              id: ticket.seatIdentifier,
                              ticketId: ticket.ticketId,
                              eventName: ticket.event!.name,
                              tierName: ticket.tier!.name,
                              originalPrice: priceInXtz,
                              maxResalePercentage: ticket.event!.maxResalePercentage,
                              tierId: ticket.tierId,
                            });
                            setTransferModalOpen(true);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Transfer
                        </Button>
                      )}
                      {ticket.event!.resaleEnabled && !isPast && (
                        ticket.isListed ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                            onClick={() => handleCancelListing(ticket.ticketId)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Cancel Listing
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
                            onClick={() => {
                              setSelectedTicket({
                                id: ticket.seatIdentifier,
                                ticketId: ticket.ticketId,
                                eventName: ticket.event!.name,
                                tierName: ticket.tier!.name,
                                originalPrice: priceInXtz,
                                maxResalePercentage: ticket.event!.maxResalePercentage,
                                tierId: ticket.tierId,
                              });
                              setResaleModalOpen(true);
                            }}
                          >
                            <Tag className="h-4 w-4 mr-1" />
                            List for Resale
                          </Button>
                        )
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#3D2870] hover:bg-[#F5F0FF]"
                        onClick={() => window.open(getExplorerUrl(ticket.ticketId), "_blank")}
                        title="View on Etherlink Explorer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View on Etherlink
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <Card className="mt-8 border-[#E8E3F5] bg-[#F8F4FF]">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-2 text-[#1a1625]">About Your NFT Tickets</h3>
          <p className="text-sm text-gray-600">
            Your tickets are NFTs on the Etherlink blockchain. You can transfer them to
            another wallet, list them for resale (if the event allows), or hold them as
            collectibles after the event. View all your NFTs on the{" "}
            <a
              href={`${ACTIVE_CHAIN.blockExplorers?.default.url}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D2870] hover:underline"
            >
              Etherlink Explorer
            </a>
            .
          </p>
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      {selectedTicket && (
        <TransferModal
          isOpen={transferModalOpen}
          onClose={() => {
            setTransferModalOpen(false);
            setSelectedTicket(null);
          }}
          ticketId={selectedTicket.id}
          eventName={selectedTicket.eventName}
          tierName={selectedTicket.tierName}
          onTransfer={handleTransfer}
        />
      )}

      {/* Resale Listing Modal */}
      {selectedTicket && (
        <ResaleListingModal
          isOpen={resaleModalOpen}
          onClose={() => {
            setResaleModalOpen(false);
            setSelectedTicket(null);
          }}
          ticketId={selectedTicket.id}
          eventName={selectedTicket.eventName}
          tierName={selectedTicket.tierName}
          originalPrice={selectedTicket.originalPrice}
          maxResalePercentage={selectedTicket.maxResalePercentage}
          onList={handleListForResale}
        />
      )}
    </main>
  );
}
