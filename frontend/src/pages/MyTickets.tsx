import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, MapPin, QrCode, ExternalLink, Tag, Send } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { TransferModal } from "@/components/shared/TransferModal";
import { ResaleListingModal } from "@/components/resale/ResaleListingModal";
import { useToast } from "@/hooks/use-toast";

// Mock user's tickets - in production this would come from on-chain data
const MOCK_USER_TICKETS = [
  {
    id: "ticket-1",
    eventId: "1",
    tierId: "1-ga",
    seatId: "GA-0042",
    purchaseDate: new Date("2025-01-15"),
  },
  {
    id: "ticket-2",
    eventId: "2",
    tierId: "2-weekend",
    seatId: "WKD-0123",
    purchaseDate: new Date("2025-01-20"),
  },
];

interface SelectedTicket {
  id: string;
  eventName: string;
  tierName: string;
  originalPrice: number;
  maxResalePercentage: number;
}

export default function MyTickets() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [resaleModalOpen, setResaleModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null);

  const handleTransfer = async (recipientAddress: string) => {
    // Simulate transfer - in production this would call the smart contract
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Transfer Complete",
      description: "Your ticket has been transferred successfully.",
    });
    return { success: true, txHash: "0x" + Math.random().toString(16).slice(2) };
  };

  const handleListForResale = async (price: number) => {
    // Simulate listing - in production this would call the smart contract
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Listed for Resale",
      description: `Your ticket is now listed for ${price.toFixed(2)} XTZ.`,
    });
    return { success: true, txHash: "0x" + Math.random().toString(16).slice(2) };
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

  const userTickets = MOCK_USER_TICKETS.map((ticket) => {
    const event = MOCK_EVENTS.find((e) => e.id === ticket.eventId);
    const tier = event?.ticketTiers.find((t) => t.id === ticket.tierId);
    return { ...ticket, event, tier };
  }).filter((t) => t.event && t.tier);

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1a1625]">My Tickets</h1>
        <Badge variant="outline" className="text-sm border-[#3D2870] text-[#3D2870]">
          {userTickets.length} ticket{userTickets.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {userTickets.length === 0 ? (
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
          {userTickets.map((ticket) => {
            const isPast = ticket.event!.date < new Date();

            return (
              <Card
                key={ticket.id}
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
                        Seat: {ticket.seatId}
                      </div>
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
                      {ticket.event!.transferEnabled && !isPast && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
                          onClick={() => {
                            setSelectedTicket({
                              id: ticket.seatId,
                              eventName: ticket.event!.name,
                              tierName: ticket.tier!.name,
                              originalPrice: ticket.tier!.price,
                              maxResalePercentage: ticket.event!.maxResalePercentage,
                            });
                            setTransferModalOpen(true);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Transfer
                        </Button>
                      )}
                      {ticket.event!.resaleEnabled && !isPast && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]"
                          onClick={() => {
                            setSelectedTicket({
                              id: ticket.seatId,
                              eventName: ticket.event!.name,
                              tierName: ticket.tier!.name,
                              originalPrice: ticket.tier!.price,
                              maxResalePercentage: ticket.event!.maxResalePercentage,
                            });
                            setResaleModalOpen(true);
                          }}
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          List for Resale
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-[#3D2870] hover:bg-[#F5F0FF]">
                        <ExternalLink className="h-4 w-4" />
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
            collectibles after the event. View your tickets on the{" "}
            <a
              href={`https://shadownet.explorer.etherlink.com/address/${address}`}
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
