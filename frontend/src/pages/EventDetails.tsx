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
                        <p className="font-bold text-[#3D2870]">{formatXTZ(tier.price)}</p>
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
                  <span className="font-bold text-lg text-[#3D2870]">
                    {formatXTZ(selectedTierData.price * quantity)}
                  </span>
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
                  {isPurchasing ? "Processing..." : "Purchase Tickets"}
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
