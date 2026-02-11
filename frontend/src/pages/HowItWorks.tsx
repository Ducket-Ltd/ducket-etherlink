import { Link } from 'react-router-dom';
import {
  Shield,
  Code,
  Wallet,
  Zap,
  Lock,
  Clock,
  DollarSign,
  ExternalLink,
  Github,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractExplorerLink } from '@/components/shared/ExplorerLink';

const GITHUB_URL = 'https://github.com/ducket-ltd/ducket-etherlink';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1625] mb-6">
            Under the Hood
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ducket uses blockchain technology to create verifiable, non-counterfeitable tickets
            with enforced resale caps. Here's how it works.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ContractExplorerLink className="text-base font-medium" />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#3D2870] transition-colors"
            >
              <Github className="h-5 w-5" />
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* NFT Tickets Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-8 text-center">
            Every Ticket is an NFT on Etherlink
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Shield className="h-10 w-10 text-[#3D2870] mb-2" />
                <CardTitle className="text-lg">Verified Ownership</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Your ticket is an ERC-1155 NFT stored in your wallet. No one can
                duplicate it or claim it's theirs — ownership is cryptographically proven.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Wallet className="h-10 w-10 text-[#3D2870] mb-2" />
                <CardTitle className="text-lg">Non-Custodial</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                We never hold your tickets. They live in your wallet (MetaMask,
                Rainbow, etc.) and only you can transfer or sell them.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Lock className="h-10 w-10 text-[#3D2870] mb-2" />
                <CardTitle className="text-lg">Counterfeit-Proof</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Each ticket has a unique on-chain ID that can be verified at the venue.
                Fake tickets are mathematically impossible.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resale Caps Section */}
      <section className="container mx-auto px-4 py-12 bg-[#F5F0FF]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-4 text-center">
            Resale Caps Enforced by Code
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Unlike policy-based resale limits that can be ignored, Ducket's price caps
            are enforced at the smart contract level. It's physically impossible to
            list a ticket above the cap.
          </p>

          <Card className="border-[#E8E3F5] bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-[#3D2870]" />
                <CardTitle className="text-base font-mono">Solidity Smart Contract</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`function listForResale(uint256 ticketId, uint256 price) external {
    require(ownerOf(ticketId) == msg.sender, "Not ticket owner");

    // Price cap is enforced here - cannot exceed 150% of original
    require(
        price <= (originalPrice[ticketId] * resaleCapPercent) / 100,
        "Exceeds resale cap"
    );

    isListed[ticketId] = true;
    resalePrice[ticketId] = price;

    emit TicketListedForResale(msg.sender, ticketId, price);
}`}
              </pre>
              <p className="text-sm text-gray-500 mt-4">
                This code runs on every resale listing. If the price exceeds the cap,
                the transaction is rejected by the blockchain itself — no exceptions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Etherlink Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-8 text-center">
            Why Etherlink?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle className="text-lg">Sub-Second Confirmations</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Tickets are confirmed in under a second. No waiting 15 seconds like
                Ethereum mainnet — your purchase is instant.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-lg">Sub-Cent Transaction Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Buying a ticket costs less than $0.001 in gas fees. You'll never
                pay more in fees than the ticket is worth.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-lg">MEV Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Etherlink's architecture prevents front-running. Bots can't jump
                ahead of you in line to snag tickets first.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-lg">EVM Compatible</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Built on the same technology as Ethereum. Your MetaMask wallet
                works out of the box — no new tools to learn.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Mode Section */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-r from-[#3D2870] to-[#6B5B95] text-white rounded-xl mx-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Demo Mode: Risk-Free Testing
          </h2>
          <p className="text-white/90 mb-6">
            This demo version auto-refunds your XTZ after each purchase. You get to
            keep the NFT ticket and test the full flow without spending any money.
          </p>
          <p className="text-sm text-white/70">
            In production, funds are held in escrow until after the event for
            buyer protection and organizer settlement.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-4">
            Ready to Try It?
          </h2>
          <p className="text-gray-600 mb-8">
            Browse events, connect your wallet, and purchase a ticket.
            Experience blockchain ticketing with zero risk.
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="bg-[#3D2870] hover:bg-[#6B5B95] text-white"
            >
              Browse Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
