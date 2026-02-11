import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
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
import { Calendar, MapPin, TrendingUp, Shield, Search } from "lucide-react";
import { MOCK_EVENTS, formatXTZ } from "@/lib/mockData";
import { formatDate, truncateAddress } from "@/lib/utils";
import { useState } from "react";

// Mock resale listings
const MOCK_RESALE_LISTINGS = [
  {
    id: "resale-1",
    eventId: "1",
    tierId: "1-vip",
    ticketId: 42,
    seatId: "VIP-0042",
    originalPrice: 2.0,
    listingPrice: 2.2,
    seller: "0x1234567890abcdef1234567890abcdef12345678",
    listedAt: new Date("2025-02-01"),
  },
  {
    id: "resale-2",
    eventId: "1",
    tierId: "1-ga",
    ticketId: 156,
    seatId: "GA-0156",
    originalPrice: 0.5,
    listingPrice: 0.55,
    seller: "0xabcdef1234567890abcdef1234567890abcdef12",
    listedAt: new Date("2025-02-03"),
  },
  {
    id: "resale-3",
    eventId: "2",
    tierId: "2-weekend",
    ticketId: 89,
    seatId: "WKD-0089",
    originalPrice: 2.2,
    listingPrice: 2.4,
    seller: "0x9876543210fedcba9876543210fedcba98765432",
    listedAt: new Date("2025-02-05"),
  },
  {
    id: "resale-4",
    eventId: "3",
    tierId: "3-premium",
    ticketId: 23,
    seatId: "PREM-0023",
    originalPrice: 3.5,
    listingPrice: 3.8,
    seller: "0xfedcba9876543210fedcba9876543210fedcba98",
    listedAt: new Date("2025-02-07"),
  },
];

export default function Resale() {
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Enrich listings with event data
  const listings = MOCK_RESALE_LISTINGS.map((listing) => {
    const event = MOCK_EVENTS.find((e) => e.id === listing.eventId);
    const tier = event?.ticketTiers.find((t) => t.id === listing.tierId);
    return { ...listing, event, tier };
  }).filter((l) => l.event && l.tier);

  // Filter by search
  const filteredListings = listings.filter(
    (listing) =>
      listing.event!.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.event!.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.listingPrice - b.listingPrice;
      case "price-high":
        return b.listingPrice - a.listingPrice;
      case "date":
        return a.event!.date.getTime() - b.event!.date.getTime();
      default: // recent
        return b.listedAt.getTime() - a.listedAt.getTime();
    }
  });

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#1a1625]">Resale Marketplace</h1>
        <p className="text-gray-600">
          Buy tickets from other fans at fair, capped prices
        </p>
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
                : "Check back later for new listings"}
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
            const markup = Math.round(
              ((listing.listingPrice - listing.originalPrice) /
                listing.originalPrice) *
                100
            );

            return (
              <Card key={listing.id} className="overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-colors">
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
                        to={`/event/${listing.eventId}`}
                        className="font-semibold text-[#1a1625] hover:text-[#3D2870] transition-colors"
                      >
                        {listing.event!.name}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">
                          {listing.tier!.name}
                        </Badge>
                        <Badge className="bg-[#F5F0FF] text-[#3D2870]">
                          Seat: {listing.seatId}
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
                      </p>
                    </div>

                    {/* Price & Buy */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#E8E3F5] sm:pl-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#3D2870]">
                          {formatXTZ(listing.listingPrice)}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{markup}% from original
                        </div>
                      </div>
                      {isConnected ? (
                        <Button size="sm" className="bg-[#3D2870] hover:bg-[#6B5B95]">
                          Buy Now
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
