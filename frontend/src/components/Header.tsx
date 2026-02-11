import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Ticket, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAccount } from "wagmi";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Ducket</span>
          <span className="hidden sm:inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            on Etherlink
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Events
          </Link>
          <Link
            to="/resale"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Resale
          </Link>
          {isConnected && (
            <Link
              to="/my-tickets"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              My Tickets
            </Link>
          )}
        </nav>

        {/* Right side: Connect button + Mobile menu */}
        <div className="flex items-center gap-4">
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Events
                </Link>
                <Link
                  to="/resale"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Resale Market
                </Link>
                {isConnected && (
                  <Link
                    to="/my-tickets"
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    My Tickets
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
