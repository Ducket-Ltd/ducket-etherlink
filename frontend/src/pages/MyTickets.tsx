import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, MapPin, QrCode, ExternalLink } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

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

export default function MyTickets() {
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Ticket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
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
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Badge variant="outline" className="text-sm">
          {userTickets.length} ticket{userTickets.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {userTickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Tickets Yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse upcoming events and get your first NFT ticket!
            </p>
            <Link to="/">
              <Button>Browse Events</Button>
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
                className={`overflow-hidden ${isPast ? "opacity-60" : ""}`}
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
                        <Badge variant="secondary">Past Event</Badge>
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1">
                        {ticket.event!.name}
                      </h3>
                      <Badge variant="outline">{ticket.tier!.name}</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(ticket.event!.date)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {ticket.event!.venue}
                      </div>
                      <div className="flex items-center">
                        <Ticket className="h-4 w-4 mr-2" />
                        Seat: {ticket.seatId}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Show QR
                      </Button>
                      <Button variant="ghost" size="sm">
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
      <Card className="mt-8">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-2">About Your NFT Tickets</h3>
          <p className="text-sm text-muted-foreground">
            Your tickets are NFTs on the Etherlink blockchain. You can transfer them to
            another wallet, list them for resale (if the event allows), or hold them as
            collectibles after the event. View your tickets on the{" "}
            <a
              href={`https://testnet.explorer.etherlink.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Etherlink Explorer
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
