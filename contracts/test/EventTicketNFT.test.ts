import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { parseEther } from "viem";

describe("EventTicketNFT", function () {
  async function deployFixture() {
    const [owner, organizer, buyer1, buyer2, platformWallet] = await hre.viem.getWalletClients();

    const contract = await hre.viem.deployContract("EventTicketNFT", [platformWallet.account.address]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      contract,
      owner,
      organizer,
      buyer1,
      buyer2,
      platformWallet,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right platform wallet", async function () {
      const { contract, platformWallet } = await loadFixture(deployFixture);
      const wallet = await contract.read.platformWallet();
      expect(wallet.toLowerCase()).to.equal(platformWallet.account.address.toLowerCase());
    });

    it("Should grant admin role to deployer", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
      expect(await contract.read.hasRole([DEFAULT_ADMIN_ROLE, owner.account.address])).to.be.true;
    });
  });

  describe("Event Creation", function () {
    it("Should create an event", async function () {
      const { contract, organizer } = await loadFixture(deployFixture);

      const eventName = "Test Concert";
      const eventDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30); // 30 days from now
      const maxResalePercentage = 110n; // 110% max

      await contract.write.createEvent([eventName, eventDate, maxResalePercentage], {
        account: organizer.account,
      });

      const event = await contract.read.getEvent([0n]);
      expect(event.name).to.equal(eventName);
      expect(event.eventDate).to.equal(eventDate);
      expect(event.organizer.toLowerCase()).to.equal(organizer.account.address.toLowerCase());
      expect(event.maxResalePercentage).to.equal(maxResalePercentage);
    });

    it("Should reject invalid max resale percentage", async function () {
      const { contract, organizer } = await loadFixture(deployFixture);

      const eventName = "Test Concert";
      const eventDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

      await expect(
        contract.write.createEvent([eventName, eventDate, 50n], {
          account: organizer.account,
        })
      ).to.be.rejectedWith("Max resale must be >= 100%");

      await expect(
        contract.write.createEvent([eventName, eventDate, 250n], {
          account: organizer.account,
        })
      ).to.be.rejectedWith("Max resale must be <= 200%");
    });
  });

  describe("Ticket Tier Creation", function () {
    it("Should create a ticket tier", async function () {
      const { contract, organizer } = await loadFixture(deployFixture);

      // Create event first
      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      // Create tier
      const tierName = "VIP";
      const price = parseEther("0.1");
      const maxSupply = 100n;

      await contract.write.createTicketTier([0n, tierName, price, maxSupply], {
        account: organizer.account,
      });

      const tier = await contract.read.getTicketTier([0n]);
      expect(tier.eventId).to.equal(0n);
      expect(tier.name).to.equal(tierName);
      expect(tier.price).to.equal(price);
      expect(tier.maxSupply).to.equal(maxSupply);
      expect(tier.minted).to.equal(0n);
    });

    it("Should only allow organizer to create tiers", async function () {
      const { contract, organizer, buyer1 } = await loadFixture(deployFixture);

      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      await expect(
        contract.write.createTicketTier([0n, "VIP", parseEther("0.1"), 100n], {
          account: buyer1.account,
        })
      ).to.be.rejectedWith("Only organizer can create tiers");
    });
  });

  describe("Primary Ticket Sales", function () {
    it("Should mint tickets on primary sale", async function () {
      const { contract, owner, organizer, buyer1 } = await loadFixture(deployFixture);

      // Setup event and tier
      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const price = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", price, 100n], {
        account: organizer.account,
      });

      // Mint ticket
      const quantity = 2n;
      const totalPrice = price * quantity;

      await contract.write.mintTicket([0n, buyer1.account.address, quantity], {
        account: owner.account,
        value: totalPrice,
      });

      // Check balance
      const balance = await contract.read.balanceOf([buyer1.account.address, 0n]);
      expect(balance).to.equal(quantity);
    });

    it("Should enforce max supply", async function () {
      const { contract, owner, organizer, buyer1 } = await loadFixture(deployFixture);

      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const price = parseEther("0.1");
      const maxSupply = 5n;
      await contract.write.createTicketTier([0n, "General", price, maxSupply], {
        account: organizer.account,
      });

      // Try to mint more than max supply
      await expect(
        contract.write.mintTicket([0n, buyer1.account.address, 6n], {
          account: owner.account,
          value: price * 6n,
        })
      ).to.be.rejectedWith("Exceeds max supply");
    });

    it("Should distribute payment correctly", async function () {
      const { contract, owner, organizer, buyer1, platformWallet, publicClient } =
        await loadFixture(deployFixture);

      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const price = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", price, 100n], {
        account: organizer.account,
      });

      const platformBalanceBefore = await publicClient.getBalance({
        address: platformWallet.account.address,
      });
      const organizerBalanceBefore = await publicClient.getBalance({
        address: organizer.account.address,
      });

      await contract.write.mintTicket([0n, buyer1.account.address, 1n], {
        account: owner.account,
        value: price,
      });

      const platformBalanceAfter = await publicClient.getBalance({
        address: platformWallet.account.address,
      });
      const organizerBalanceAfter = await publicClient.getBalance({
        address: organizer.account.address,
      });

      // Platform should receive 2.5% fee
      const expectedFee = (price * 250n) / 10000n;
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(expectedFee);

      // Organizer should receive remaining amount
      const expectedOrganizerAmount = price - expectedFee;
      expect(organizerBalanceAfter - organizerBalanceBefore).to.equal(expectedOrganizerAmount);
    });
  });

  describe("Resale Marketplace", function () {
    it("Should list ticket for resale within price cap", async function () {
      const { contract, owner, organizer, buyer1 } = await loadFixture(deployFixture);

      // Setup and mint
      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const originalPrice = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", originalPrice, 100n], {
        account: organizer.account,
      });

      await contract.write.mintTicket([0n, buyer1.account.address, 1n], {
        account: owner.account,
        value: originalPrice,
      });

      // List for resale at max price (110%)
      const resalePrice = (originalPrice * 110n) / 100n;
      await contract.write.listForResale([0n, 0n, resalePrice], {
        account: buyer1.account,
      });

      const listing = await contract.read.getResaleListing([0n, 0n]);
      expect(listing.seller.toLowerCase()).to.equal(buyer1.account.address.toLowerCase());
      expect(listing.price).to.equal(resalePrice);
      expect(listing.active).to.be.true;
    });

    it("Should reject listing above price cap", async function () {
      const { contract, owner, organizer, buyer1 } = await loadFixture(deployFixture);

      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const originalPrice = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", originalPrice, 100n], {
        account: organizer.account,
      });

      await contract.write.mintTicket([0n, buyer1.account.address, 1n], {
        account: owner.account,
        value: originalPrice,
      });

      // Try to list above 110%
      const resalePrice = (originalPrice * 120n) / 100n;
      await expect(
        contract.write.listForResale([0n, 0n, resalePrice], {
          account: buyer1.account,
        })
      ).to.be.rejectedWith("Price exceeds resale cap");
    });

    it("Should allow buying resale ticket", async function () {
      const { contract, owner, organizer, buyer1, buyer2 } = await loadFixture(deployFixture);

      // Setup and mint
      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const originalPrice = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", originalPrice, 100n], {
        account: organizer.account,
      });

      await contract.write.mintTicket([0n, buyer1.account.address, 1n], {
        account: owner.account,
        value: originalPrice,
      });

      // List for resale
      const resalePrice = (originalPrice * 105n) / 100n;
      await contract.write.listForResale([0n, 0n, resalePrice], {
        account: buyer1.account,
      });

      // Buy resale ticket
      await contract.write.buyResaleTicket([0n, 0n], {
        account: buyer2.account,
        value: resalePrice,
      });

      // Check new owner
      const buyer2Balance = await contract.read.balanceOf([buyer2.account.address, 0n]);
      expect(buyer2Balance).to.equal(1n);

      const buyer1Balance = await contract.read.balanceOf([buyer1.account.address, 0n]);
      expect(buyer1Balance).to.equal(0n);

      // Listing should be inactive
      const listing = await contract.read.getResaleListing([0n, 0n]);
      expect(listing.active).to.be.false;
    });

    it("Should allow canceling resale listing", async function () {
      const { contract, owner, organizer, buyer1 } = await loadFixture(deployFixture);

      await contract.write.createEvent(
        ["Test Concert", BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), 110n],
        { account: organizer.account }
      );

      const originalPrice = parseEther("0.1");
      await contract.write.createTicketTier([0n, "General", originalPrice, 100n], {
        account: organizer.account,
      });

      await contract.write.mintTicket([0n, buyer1.account.address, 1n], {
        account: owner.account,
        value: originalPrice,
      });

      const resalePrice = (originalPrice * 105n) / 100n;
      await contract.write.listForResale([0n, 0n, resalePrice], {
        account: buyer1.account,
      });

      // Cancel listing
      await contract.write.cancelResaleListing([0n, 0n], {
        account: buyer1.account,
      });

      const listing = await contract.read.getResaleListing([0n, 0n]);
      expect(listing.active).to.be.false;
    });
  });
});
