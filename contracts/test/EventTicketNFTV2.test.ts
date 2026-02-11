import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { parseEther } from "viem";

// Required for hre.viem to be available
import "@nomicfoundation/hardhat-viem";

describe("EventTicketNFTV2", function () {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  async function deployFixture() {
    const [owner, organizer, buyer1, buyer2, buyer3, platformWallet] =
      await hre.viem.getWalletClients();

    const contract = await hre.viem.deployContract("EventTicketNFTV2", [
      platformWallet.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    // Grant MINTER_ROLE to owner
    const MINTER_ROLE = await contract.read.MINTER_ROLE();

    return {
      contract,
      owner,
      organizer,
      buyer1,
      buyer2,
      buyer3,
      platformWallet,
      publicClient,
      MINTER_ROLE,
    };
  }

  async function deployWithEventFixture() {
    const base = await deployFixture();
    const { contract, organizer } = base;

    // Create event 30 days in future
    const eventDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

    await contract.write.createEvent(
      [
        "Summer Music Festival",
        eventDate,
        120, // 20% max markup
        4n, // max 4 per wallet
        1000n, // total supply
        true, // resale enabled
        true, // transfer enabled
      ],
      { account: organizer.account }
    );

    return { ...base, eventDate };
  }

  async function deployWithTierFixture() {
    const base = await deployWithEventFixture();
    const { contract, organizer } = base;

    // Create GA tier
    await contract.write.createTicketTier(
      [
        0n, // eventId
        "General Admission",
        "GA-",
        parseEther("0.05"), // 0.05 XTZ
        500n, // max supply
      ],
      { account: organizer.account }
    );

    // Create VIP tier
    await contract.write.createTicketTier(
      [
        0n, // eventId
        "VIP",
        "VIP-",
        parseEther("0.15"), // 0.15 XTZ
        100n, // max supply
      ],
      { account: organizer.account }
    );

    return base;
  }

  async function deployWithMintedTicketsFixture() {
    const base = await deployWithTierFixture();
    const { contract, owner, buyer1 } = base;

    // Mint 2 GA tickets to buyer1
    await contract.write.mintTicket([0n, buyer1.account.address, 2n], {
      account: owner.account,
      value: parseEther("0.1"), // 2 * 0.05
    });

    return base;
  }

  // ============================================================================
  // DEPLOYMENT TESTS
  // ============================================================================

  describe("Deployment", function () {
    it("Should set the right platform wallet", async function () {
      const { contract, platformWallet } = await loadFixture(deployFixture);
      expect((await contract.read.platformWallet()).toLowerCase()).to.equal(
        platformWallet.account.address.toLowerCase()
      );
    });

    it("Should grant admin and minter role to deployer", async function () {
      const { contract, owner, MINTER_ROLE } = await loadFixture(deployFixture);
      const DEFAULT_ADMIN_ROLE =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      expect(
        await contract.read.hasRole([DEFAULT_ADMIN_ROLE, owner.account.address])
      ).to.be.true;
      expect(
        await contract.read.hasRole([MINTER_ROLE, owner.account.address])
      ).to.be.true;
    });

    it("Should set default platform fees to 2.5%", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.read.platformFeePrimary()).to.equal(250n);
      expect(await contract.read.platformFeeResale()).to.equal(250n);
    });

    it("Should reject zero address platform wallet", async function () {
      await expect(
        hre.viem.deployContract("EventTicketNFTV2", [
          "0x0000000000000000000000000000000000000000",
        ])
      ).to.be.rejectedWith("Invalid platform wallet");
    });
  });

  // ============================================================================
  // EVENT MANAGEMENT TESTS
  // ============================================================================

  describe("Event Management", function () {
    describe("createEvent", function () {
      it("Should create an event with all parameters", async function () {
        const { contract, organizer } = await loadFixture(deployFixture);

        const eventDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

        await contract.write.createEvent(
          ["Test Concert", eventDate, 150, 10n, 5000n, true, false],
          { account: organizer.account }
        );

        const event = await contract.read.getEvent([0n]);
        expect(event.name).to.equal("Test Concert");
        expect(event.eventDate).to.equal(eventDate);
        expect(event.organizer.toLowerCase()).to.equal(
          organizer.account.address.toLowerCase()
        );
        expect(event.maxResalePercentage).to.equal(150);
        expect(event.maxTicketsPerWallet).to.equal(10n);
        expect(event.totalSupply).to.equal(5000n);
        expect(event.resaleEnabled).to.be.true;
        expect(event.transferEnabled).to.be.false;
        expect(event.paused).to.be.false;
        expect(event.cancelled).to.be.false;
        expect(event.exists).to.be.true;
      });
    });
  });

  // ============================================================================
  // TICKET TIER TESTS
  // ============================================================================

  describe("Ticket Tier Management", function () {
    it("Should create a ticket tier with all parameters", async function () {
      const { contract, organizer } = await loadFixture(deployWithEventFixture);

      await contract.write.createTicketTier(
        [0n, "VIP", "VIP-", parseEther("0.2"), 50n],
        { account: organizer.account }
      );

      const tier = await contract.read.getTicketTier([0n]);
      expect(tier.eventId).to.equal(0n);
      expect(tier.name).to.equal("VIP");
      expect(tier.seatPrefix).to.equal("VIP-");
      expect(tier.price).to.equal(parseEther("0.2"));
      expect(tier.maxSupply).to.equal(50n);
      expect(tier.minted).to.equal(0n);
      expect(tier.exists).to.be.true;
    });
  });

  // ============================================================================
  // MINTING TESTS
  // ============================================================================

  describe("Minting", function () {
    describe("mintTicket (auto seat)", function () {
      it("Should mint tickets with auto-generated seat IDs", async function () {
        const { contract, owner, buyer1 } =
          await loadFixture(deployWithTierFixture);

        await contract.write.mintTicket([0n, buyer1.account.address, 2n], {
          account: owner.account,
          value: parseEther("0.1"), // 2 * 0.05
        });

        // Check ERC1155 balance
        const balance = await contract.read.balanceOf([
          buyer1.account.address,
          0n,
        ]);
        expect(balance).to.equal(2n);

        // Check individual ticket info (ticketIds start at 1)
        const ticket0 = await contract.read.getTicketInfo([1n]);
        expect(ticket0.seatIdentifier).to.equal("GA-0000");
        expect(ticket0.eventId).to.equal(0n);
        expect(ticket0.tierId).to.equal(0n);
        expect(ticket0.currentOwner.toLowerCase()).to.equal(
          buyer1.account.address.toLowerCase()
        );

        const ticket1 = await contract.read.getTicketInfo([2n]);
        expect(ticket1.seatIdentifier).to.equal("GA-0001");
      });

      it("Should enforce wallet limit", async function () {
        const { contract, owner, buyer1 } =
          await loadFixture(deployWithTierFixture);

        // Wallet limit is 4
        await contract.write.mintTicket([0n, buyer1.account.address, 4n], {
          account: owner.account,
          value: parseEther("0.2"),
        });

        // Try to mint one more
        await expect(
          contract.write.mintTicket([0n, buyer1.account.address, 1n], {
            account: owner.account,
            value: parseEther("0.05"),
          })
        ).to.be.rejectedWith("Wallet limit exceeded");
      });
    });
  });

  // ============================================================================
  // RESALE MARKETPLACE TESTS
  // ============================================================================

  describe("Resale Marketplace", function () {
    describe("listForResale", function () {
      it("Should list ticket within price cap", async function () {
        const { contract, buyer1 } =
          await loadFixture(deployWithMintedTicketsFixture);

        const originalPrice = parseEther("0.05");
        const maxResale = (originalPrice * 120n) / 100n; // 20% markup

        await contract.write.listForResale([1n, maxResale], {
          account: buyer1.account,
        });

        const listing = await contract.read.resaleListings([1n]);
        expect(listing[1].toLowerCase()).to.equal(
          buyer1.account.address.toLowerCase()
        );
        expect(listing[2]).to.equal(maxResale);
        expect(listing[3]).to.be.true;
      });

      it("Should reject listing above price cap", async function () {
        const { contract, buyer1 } =
          await loadFixture(deployWithMintedTicketsFixture);

        const originalPrice = parseEther("0.05");
        const aboveCap = (originalPrice * 130n) / 100n; // 30% markup, cap is 20%

        await expect(
          contract.write.listForResale([1n, aboveCap], {
            account: buyer1.account,
          })
        ).to.be.rejectedWith("Price exceeds cap");
      });
    });

    describe("buyResaleTicket", function () {
      it("Should allow buying resale ticket", async function () {
        const { contract, buyer1, buyer2 } =
          await loadFixture(deployWithMintedTicketsFixture);

        const resalePrice = parseEther("0.06");
        await contract.write.listForResale([1n, resalePrice], {
          account: buyer1.account,
        });

        await contract.write.buyResaleTicket([1n], {
          account: buyer2.account,
          value: resalePrice,
        });

        // Check ownership transfer
        expect(
          await contract.read.balanceOf([buyer2.account.address, 0n])
        ).to.equal(1n);
        expect(
          await contract.read.balanceOf([buyer1.account.address, 0n])
        ).to.equal(1n); // Still has the other ticket

        // Check ticket info updated
        const ticket = await contract.read.getTicketInfo([1n]);
        expect(ticket.currentOwner.toLowerCase()).to.equal(
          buyer2.account.address.toLowerCase()
        );

        // Listing should be inactive
        const listing = await contract.read.resaleListings([1n]);
        expect(listing[3]).to.be.false;
      });
    });
  });

  // ============================================================================
  // TRANSFER TESTS
  // ============================================================================

  describe("Transfers", function () {
    it("Should allow transfer when enabled", async function () {
      const { contract, buyer1, buyer2 } =
        await loadFixture(deployWithMintedTicketsFixture);

      await contract.write.safeTransferFrom(
        [buyer1.account.address, buyer2.account.address, 0n, 1n, "0x"],
        { account: buyer1.account }
      );

      expect(
        await contract.read.balanceOf([buyer2.account.address, 0n])
      ).to.equal(1n);
    });
  });

  // ============================================================================
  // PLATFORM ADMIN TESTS
  // ============================================================================

  describe("Platform Admin", function () {
    it("Should allow setting platform fees", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      await contract.write.setPlatformFees([300n, 500n], {
        account: owner.account,
      });

      expect(await contract.read.platformFeePrimary()).to.equal(300n);
      expect(await contract.read.platformFeeResale()).to.equal(500n);
    });

    it("Should reject fees over 10%", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      await expect(
        contract.write.setPlatformFees([1100n, 250n], {
          account: owner.account,
        })
      ).to.be.rejectedWith("Fee too high");
    });
  });
});
