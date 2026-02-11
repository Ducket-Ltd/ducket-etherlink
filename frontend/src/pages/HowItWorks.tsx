import { Link } from 'react-router-dom';
import {
  Shield,
  Code,
  Wallet,
  Zap,
  Lock,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
// @ts-ignore - Github icon is deprecated but still works
import { Github } from 'lucide-react';
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

      {/* Smart Contract Guarantees Section */}
      <section className="container mx-auto px-4 py-12 bg-[#F5F0FF]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-4 text-center">
            Protocol-Level Guarantees
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Our Solidity smart contract deployed on Etherlink enforces these rules trustlessly.
            
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-[#E8E3F5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3D2870] flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1625] mb-1">Hardcoded Price Caps</h3>
                    <p className="text-sm text-gray-600">
                      Resale prices are bounded by an on-chain cap (e.g., 150% of mint price).
                      Transactions exceeding this threshold revert automatically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3D2870] flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1625] mb-1">Cryptographic Ownership</h3>
                    <p className="text-sm text-gray-600">
                      Only the wallet holding the NFT can execute transfers or listings.
                      Ownership is verified via on-chain state with every call.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3D2870] flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1625] mb-1">Per-Wallet Mint Limits</h3>
                    <p className="text-sm text-gray-600">
                      Configurable max mint per address prevents Sybil attacks and bot accumulation.
                      Enforced at the contract level before token minting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3D2870] flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1625] mb-1">Time-Locked Resale</h3>
                    <p className="text-sm text-gray-600">
                      Organizers can set a block timestamp before which resale is disabled.
                      Prevents immediate secondary market speculation post-mint.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            All logic executes on Etherlink's EVM. Contract source is verified and publicly auditable.
          </p>
        </div>
      </section>

      {/* Why Etherlink Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1625] mb-4 text-center">
            Why Etherlink?
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Etherlink is an EVM-compatible Layer 2 that brings Ethereum-grade smart contracts
            to the Tezos ecosystem — with faster finality, lower fees, and built-in fairness guarantees.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle className="text-lg">Sub-Second Finality</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Transactions confirm in under a second. No waiting, no uncertainty —
                your ticket purchase is instant and final.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-lg">Sub-Cent Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Gas costs under $0.001 per transaction. Buy, sell, and transfer
                tickets without worrying about fees eating into the price.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-lg">MEV Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Fair transaction ordering prevents front-running. Bots can't
                jump ahead in the queue to snag tickets before real fans.
              </CardContent>
            </Card>

            <Card className="border-[#E8E3F5]">
              <CardHeader>
                <Code className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-lg">EVM & Solidity</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                100% EVM-compatible. Write smart contracts in Solidity, use MetaMask,
                and leverage the entire Ethereum tooling ecosystem.
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
