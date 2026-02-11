// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventTicketNFT
 * @dev ERC1155 NFT contract for event tickets with resale price caps
 * Each token ID represents a different ticket tier for an event
 */
contract EventTicketNFT is ERC1155, AccessControl, ERC1155Supply, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    struct Event {
        string name;
        uint256 eventDate;
        address organizer;
        uint16 maxResalePercentage; // e.g., 110 = 110% (10% markup max)
        bool exists;
    }

    struct TicketTier {
        uint256 eventId;
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 minted;
        bool exists;
    }

    struct ResaleListing {
        address seller;
        uint256 price;
        bool active;
    }

    // Event ID counter
    uint256 private _eventIdCounter;

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketTier) public ticketTiers;
    mapping(uint256 => mapping(uint256 => uint256)) public originalPrices; // tokenId => ticketNumber => price
    mapping(uint256 => mapping(uint256 => ResaleListing)) public resaleListings; // tokenId => ticketNumber => listing
    mapping(uint256 => mapping(address => uint256)) public purchaseLimits; // tokenId => buyer => count

    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    address public platformWallet;

    // Events
    event EventCreated(uint256 indexed eventId, string name, address organizer);
    event TicketTierCreated(uint256 indexed tokenId, uint256 indexed eventId, string name, uint256 price);
    event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 ticketNumber, uint256 price);
    event TicketListedForResale(uint256 indexed tokenId, uint256 ticketNumber, address indexed seller, uint256 price);
    event TicketResold(uint256 indexed tokenId, uint256 ticketNumber, address indexed from, address indexed to, uint256 price);
    event ResaleListingCancelled(uint256 indexed tokenId, uint256 ticketNumber);

    constructor(address _platformWallet) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        platformWallet = _platformWallet;
    }

    /**
     * @dev Create a new event
     */
    function createEvent(
        string memory name,
        uint256 eventDate,
        uint16 maxResalePercentage
    ) external returns (uint256) {
        require(maxResalePercentage >= 100, "Max resale must be >= 100%");
        require(maxResalePercentage <= 200, "Max resale must be <= 200%");

        uint256 eventId = _eventIdCounter++;
        events[eventId] = Event({
            name: name,
            eventDate: eventDate,
            organizer: msg.sender,
            maxResalePercentage: maxResalePercentage,
            exists: true
        });

        _grantRole(ORGANIZER_ROLE, msg.sender);

        emit EventCreated(eventId, name, msg.sender);
        return eventId;
    }

    /**
     * @dev Create a new ticket tier for an event
     */
    function createTicketTier(
        uint256 eventId,
        string memory name,
        uint256 price,
        uint256 maxSupply
    ) external returns (uint256) {
        require(events[eventId].exists, "Event does not exist");
        require(msg.sender == events[eventId].organizer, "Only organizer can create tiers");

        uint256 tokenId = _tokenIdCounter++;
        ticketTiers[tokenId] = TicketTier({
            eventId: eventId,
            name: name,
            price: price,
            maxSupply: maxSupply,
            minted: 0,
            exists: true
        });

        emit TicketTierCreated(tokenId, eventId, name, price);
        return tokenId;
    }

    /**
     * @dev Mint tickets (primary sale)
     */
    function mintTicket(
        uint256 tokenId,
        address to,
        uint256 quantity
    ) external payable nonReentrant onlyRole(MINTER_ROLE) {
        TicketTier storage tier = ticketTiers[tokenId];
        require(tier.exists, "Ticket tier does not exist");
        require(tier.minted + quantity <= tier.maxSupply, "Exceeds max supply");

        uint256 totalPrice = tier.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint the tickets
        _mint(to, tokenId, quantity, "");

        // Record original prices for resale cap enforcement
        for (uint256 i = 0; i < quantity; i++) {
            originalPrices[tokenId][tier.minted + i] = tier.price;
            emit TicketMinted(tokenId, to, tier.minted + i, tier.price);
        }

        tier.minted += quantity;

        // Distribute payment (platform fee + organizer)
        uint256 fee = (totalPrice * platformFee) / 10000;
        uint256 organizerAmount = totalPrice - fee;

        (bool sentFee, ) = platformWallet.call{value: fee}("");
        require(sentFee, "Failed to send platform fee");

        Event storage eventData = events[tier.eventId];
        (bool sentOrganizer, ) = eventData.organizer.call{value: organizerAmount}("");
        require(sentOrganizer, "Failed to send to organizer");

        // Refund excess payment
        if (msg.value > totalPrice) {
            (bool refunded, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(refunded, "Failed to refund excess");
        }
    }

    /**
     * @dev List ticket for resale
     */
    function listForResale(
        uint256 tokenId,
        uint256 ticketNumber,
        uint256 price
    ) external {
        require(balanceOf(msg.sender, tokenId) > 0, "You don't own this ticket");

        TicketTier storage tier = ticketTiers[tokenId];
        Event storage eventData = events[tier.eventId];

        uint256 originalPrice = originalPrices[tokenId][ticketNumber];
        uint256 maxPrice = (originalPrice * eventData.maxResalePercentage) / 100;

        require(price <= maxPrice, "Price exceeds resale cap");
        require(!resaleListings[tokenId][ticketNumber].active, "Already listed");

        resaleListings[tokenId][ticketNumber] = ResaleListing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit TicketListedForResale(tokenId, ticketNumber, msg.sender, price);
    }

    /**
     * @dev Buy ticket from resale market
     */
    function buyResaleTicket(
        uint256 tokenId,
        uint256 ticketNumber
    ) external payable nonReentrant {
        ResaleListing storage listing = resaleListings[tokenId][ticketNumber];
        require(listing.active, "Ticket not listed for resale");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as sold
        listing.active = false;

        // Transfer the ticket
        _safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Distribute payment
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;

        (bool sentFee, ) = platformWallet.call{value: fee}("");
        require(sentFee, "Failed to send platform fee");

        (bool sentSeller, ) = seller.call{value: sellerAmount}("");
        require(sentSeller, "Failed to send to seller");

        // Refund excess
        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            require(refunded, "Failed to refund excess");
        }

        emit TicketResold(tokenId, ticketNumber, seller, msg.sender, price);
    }

    /**
     * @dev Cancel resale listing
     */
    function cancelResaleListing(uint256 tokenId, uint256 ticketNumber) external {
        ResaleListing storage listing = resaleListings[tokenId][ticketNumber];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");

        listing.active = false;
        emit ResaleListingCancelled(tokenId, ticketNumber);
    }

    /**
     * @dev Update URI for all tokens
     */
    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        platformWallet = newWallet;
    }

    /**
     * @dev Get event details
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].exists, "Event does not exist");
        return events[eventId];
    }

    /**
     * @dev Get ticket tier details
     */
    function getTicketTier(uint256 tokenId) external view returns (TicketTier memory) {
        require(ticketTiers[tokenId].exists, "Tier does not exist");
        return ticketTiers[tokenId];
    }

    /**
     * @dev Check if ticket is listed for resale
     */
    function getResaleListing(uint256 tokenId, uint256 ticketNumber)
        external
        view
        returns (ResaleListing memory)
    {
        return resaleListings[tokenId][ticketNumber];
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
