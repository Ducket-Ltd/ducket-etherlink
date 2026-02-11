import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
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
} from "lucide-react";
import { getEventById, formatXTZ, getTicketsRemaining } from "@/lib/mockData";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const event = getEventById(id || "");

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Link to="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const selectedTierData = event.ticketTiers.find((t) => t.id === selectedTier);

  const handlePurchase = async () => {
    if (!selectedTierData) return;

    setIsPurchasing(true);

    // Simulate purchase - in production this would call the smart contract
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Purchase Successful!",
      description: `You've purchased ${quantity}x ${selectedTierData.name} ticket(s)`,
    });

    setIsPurchasing(false);
    setSelectedTier(null);
    setQuantity(1);
  };

  return (
    <main className="container py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
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
              <Badge className="text-sm">{event.category}</Badge>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>

            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {formatDateTime(event.date)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {event.venue}, {event.city}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Ticket Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Resale</p>
                  <p className="text-sm text-muted-foreground">
                    {event.resaleEnabled
                      ? `Allowed up to ${event.maxResalePercentage}% of original price`
                      : "Not allowed for this event"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    {event.transferEnabled
                      ? "Free transfers allowed"
                      : "Tickets are non-transferable"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Selection */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
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
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !soldOut && setSelectedTier(tier.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{tier.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {tier.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatXTZ(tier.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {soldOut ? "Sold out" : `${remaining} left`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator />

              {/* Quantity selector */}
              {selectedTier && selectedTierData && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
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
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    {formatXTZ(selectedTierData.price * quantity)}
                  </span>
                </div>
              )}

              {/* Purchase button */}
              {isConnected ? (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedTier || isPurchasing}
                  onClick={handlePurchase}
                >
                  {isPurchasing ? "Processing..." : "Purchase Tickets"}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect your wallet to purchase tickets
                  </p>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button className="w-full" size="lg" onClick={openConnectModal}>
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Powered by Etherlink blockchain
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
