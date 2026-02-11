import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import { MOCK_EVENTS, formatXTZ, isEventSoldOut } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

export default function Home() {
  return (
    <main className="container py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          NFT Tickets on{" "}
          <span className="text-primary">Etherlink</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Secure, verifiable event tickets powered by blockchain technology.
          No scalping, no fraud, just fair access to the events you love.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            <Ticket className="h-4 w-4 mr-2" />
            Anti-Scalping Protection
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Resale Price Caps
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Instant Transfers
          </Badge>
        </div>
      </section>

      {/* Events Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_EVENTS.map((event) => {
            const soldOut = isEventSoldOut(event);
            const lowestPrice = Math.min(...event.ticketTiers.map((t) => t.price));

            return (
              <Link key={event.id} to={`/event/${event.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge>{event.category}</Badge>
                    </div>
                    {soldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Sold Out
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {event.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.city}, {event.country}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">From </span>
                      <span className="font-semibold">{formatXTZ(lowestPrice)}</span>
                    </div>
                    {event.resaleEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Resale OK
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-16 py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">
          Why NFT Tickets?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Verifiable Ownership</h3>
            <p className="text-sm text-muted-foreground">
              Every ticket is a unique NFT on Etherlink, proving authentic ownership.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Fair Resale</h3>
            <p className="text-sm text-muted-foreground">
              Price caps prevent scalping while allowing legitimate resales.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Instant & Cheap</h3>
            <p className="text-sm text-muted-foreground">
              Etherlink's fast finality and low fees make ticketing seamless.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
