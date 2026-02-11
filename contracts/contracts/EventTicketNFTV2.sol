// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// DEMO MODE: Auto-refund enabled for Fortify Labs evaluation.
// In production, funds are held in escrow until post-event settlement.
// See "Production Migration" section in docs for the full escrow model.

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EventTicketNFTV2
 * @author Ducket
 * @notice Multi-event NFT ticketing with per-event rules, seat management, and resale controls
 * @dev ERC1155 with enhanced event configuration, wallet limits, transfer restrictions, and demo mode
 */
contract EventTicketNFTV2 is ERC1155, AccessControl, ERC1155Supply, ReentrancyGuard {
    using Strings for uint256;

    // ============================================================================
    // ROLES
    // ============================================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // ============================================================================
    // STRUCTS
    // ============================================================================

    /**
     * @notice Event configuration with per-event rules
     * @dev Struct is packed for gas optimization
     */
    struct EventConfig {
        address organizer;              // Event creator/manager
        uint16 maxResalePercentage;     // 100-200 (100 = face value, 150 = 50% markup)
        bool resaleEnabled;             // Can tickets be listed for resale?
        bool transferEnabled;           // Can tickets be transferred?
        bool paused;                    // Emergency pause flag
        bool cancelled;                 // Event cancelled flag
        bool exists;                    // Existence check
        string name;                    // Event name
        uint256 eventDate;              // Unix timestamp of event
        uint256 maxTicketsPerWallet;    // 0 = unlimited
        uint256 totalSupply;            // Max tickets across all tiers
        uint256 mintedCount;            // Total minted for this event
        uint256 resaleLockUntil;        // No resale before this timestamp
        uint256 createdAt;              // Creation timestamp
    }

    /**
     * @notice Ticket tier (token type) for an event
     */
    struct TicketTier {
        uint256 eventId;                // Parent event
        string name;                    // Tier name (e.g., "VIP", "General")
        string seatPrefix;              // Auto-generated seat prefix (e.g., "GA-", "VIP-")
        uint256 price;                  // Price in wei
        uint256 maxSupply;              // Max tickets for this tier
        uint256 minted;                 // Minted count for this tier
        bool exists;                    // Existence check
    }

    /**
     * @notice Individual ticket metadata
     */
    struct TicketInfo {
        uint256 eventId;                // Parent event
        uint256 tierId;                 // Token ID of the tier
        string seatIdentifier;          // Unique seat (e.g., "GA-0001", "SEC-A-R1-S5")
        uint256 originalPrice;          // Purchase price
        uint256 purchaseTimestamp;      // When purchased
        address originalPurchaser;      // First buyer
        address currentOwner;           // Current owner
        bool exists;                    // Existence check
    }

    /**
     * @notice Resale listing
     */
    struct ResaleListing {
        uint256 ticketId;               // Global ticket ID
        address seller;                 // Current owner listing
        uint256 price;                  // Asking price
        bool active;                    // Is listing active?
    }

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    // Counters
    uint256 private _eventIdCounter;
    uint256 private _tokenIdCounter;        // Tier token IDs
    uint256 private _ticketIdCounter;       // Individual ticket IDs

    // Primary mappings
    mapping(uint256 => EventConfig) public events;
    mapping(uint256 => TicketTier) public ticketTiers;
    mapping(uint256 => TicketInfo) public ticketInfos;
    mapping(uint256 => ResaleListing) public resaleListings;

    // Tracking mappings
    mapping(uint256 => mapping(address => uint256)) public eventPurchases;      // eventId => wallet => count
    mapping(uint256 => mapping(string => uint256)) public seatRegistry;         // eventId => seatId => ticketId
    mapping(uint256 => uint256[]) private _eventTickets;                        // eventId => ticketIds[]
    mapping(address => mapping(uint256 => uint256[])) private _userEventTickets; // user => eventId => ticketIds[]
    mapping(uint256 => address) public ticketOwners;                            // ticketId => current owner

    // Organizer verification
    mapping(address => bool) public verifiedOrganizers;

    // Platform settings
    address public platformWallet;
    uint256 public platformFeePrimary = 250;        // 2.5% in basis points
    uint256 public platformFeeResale = 250;         // 2.5% in basis points
    uint256 public maxEventSupply = 100000;         // Platform-wide max per event
    uint256 public maxTicketsPerTransaction = 10;   // Max per mint call
    bool public globalPause = false;                // Emergency global pause
    bool public demoMode = true;                    // Demo mode: auto-refund purchases

    // ============================================================================
    // EVENTS
    // ============================================================================

    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 totalSupply
    );

    event EventUpdated(uint256 indexed eventId);
    event EventPaused(uint256 indexed eventId, bool paused);
    event EventCancelled(uint256 indexed eventId);

    event TicketTierCreated(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        string name,
        uint256 price,
        uint256 maxSupply
    );

    event TicketMinted(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address buyer,
        string seatIdentifier,
        uint256 price
    );

    event TicketTransferred(
        uint256 indexed ticketId,
        address indexed from,
        address indexed to
    );

    event TicketListedForResale(
        uint256 indexed ticketId,
        address indexed seller,
        uint256 price
    );

    event TicketResold(
        uint256 indexed ticketId,
        address indexed from,
        address indexed to,
        uint256 price
    );

    event ResaleListingCancelled(uint256 indexed ticketId);
    event OrganizerVerified(address indexed organizer, bool verified);
    event GlobalPauseSet(bool paused);
    event DemoModeSet(bool enabled);
    event DemoRefund(address indexed recipient, uint256 amount);

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    modifier onlyOrganizer(uint256 eventId) {
        require(events[eventId].organizer == msg.sender, "Not organizer");
        _;
    }

    modifier onlyOrganizerOrPlatform(uint256 eventId) {
        require(
            events[eventId].organizer == msg.sender ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(events[eventId].exists, "Event not found");
        _;
    }

    modifier eventActive(uint256 eventId) {
        require(!events[eventId].paused, "Event paused");
        require(!events[eventId].cancelled, "Event cancelled");
        require(!globalPause, "Platform paused");
        _;
    }

    modifier tierExists(uint256 tokenId) {
        require(ticketTiers[tokenId].exists, "Tier not found");
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize the contract
     * @param _platformWallet Address to receive platform fees
     */
    constructor(address _platformWallet) ERC1155("") {
        require(_platformWallet != address(0), "Invalid platform wallet");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        platformWallet = _platformWallet;

        // Start ticketId at 1 so seatRegistry can use 0 to mean "no seat registered"
        _ticketIdCounter = 1;
    }

    // ============================================================================
    // EVENT MANAGEMENT
    // ============================================================================

    /**
     * @notice Create a new event
     * @param name Event name
     * @param eventDate Unix timestamp of the event
     * @param maxResalePercentage Max resale price as percentage (100-200)
     * @param maxTicketsPerWallet Max tickets one wallet can own (0 = unlimited)
     * @param totalSupply Total tickets available across all tiers
     * @param resaleEnabled Whether resale is allowed
     * @param transferEnabled Whether transfers are allowed
     * @return eventId The ID of the created event
     */
    function createEvent(
        string memory name,
        uint256 eventDate,
        uint16 maxResalePercentage,
        uint256 maxTicketsPerWallet,
        uint256 totalSupply,
        bool resaleEnabled,
        bool transferEnabled
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(eventDate > block.timestamp, "Event must be in future");
        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");
        require(totalSupply > 0 && totalSupply <= maxEventSupply, "Invalid supply");

        uint256 eventId = _eventIdCounter++;

        events[eventId] = EventConfig({
            organizer: msg.sender,
            maxResalePercentage: maxResalePercentage,
            resaleEnabled: resaleEnabled,
            transferEnabled: transferEnabled,
            paused: false,
            cancelled: false,
            exists: true,
            name: name,
            eventDate: eventDate,
            maxTicketsPerWallet: maxTicketsPerWallet,
            totalSupply: totalSupply,
            mintedCount: 0,
            resaleLockUntil: 0,
            createdAt: block.timestamp
        });

        emit EventCreated(eventId, name, msg.sender, totalSupply);
        return eventId;
    }

    /**
     * @notice Update event configuration
     * @dev Can only make rules LESS strict after tickets are sold
     * @param eventId Event to update
     * @param maxResalePercentage New max resale (must be >= current)
     * @param maxTicketsPerWallet New wallet limit (must be >= current, 0 = unlimited)
     * @param resaleEnabled Enable resale (cannot disable once enabled)
     * @param transferEnabled Enable transfers (cannot disable once enabled)
     * @param resaleLockUntil New lock timestamp (must be <= current)
     */
    function updateEventConfig(
        uint256 eventId,
        uint16 maxResalePercentage,
        uint256 maxTicketsPerWallet,
        bool resaleEnabled,
        bool transferEnabled,
        uint256 resaleLockUntil
    ) external eventExists(eventId) onlyOrganizer(eventId) {
        EventConfig storage evt = events[eventId];

        // If tickets have been sold, can only make rules LESS strict
        if (evt.mintedCount > 0) {
            require(maxResalePercentage >= evt.maxResalePercentage, "Cannot decrease resale %");
            require(
                maxTicketsPerWallet == 0 ||
                (evt.maxTicketsPerWallet != 0 && maxTicketsPerWallet >= evt.maxTicketsPerWallet),
                "Cannot decrease wallet limit"
            );
            require(!evt.resaleEnabled || resaleEnabled, "Cannot disable resale");
            require(!evt.transferEnabled || transferEnabled, "Cannot disable transfers");
            require(resaleLockUntil <= evt.resaleLockUntil, "Cannot extend resale lock");
        }

        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");

        evt.maxResalePercentage = maxResalePercentage;
        evt.maxTicketsPerWallet = maxTicketsPerWallet;
        evt.resaleEnabled = resaleEnabled;
        evt.transferEnabled = transferEnabled;
        evt.resaleLockUntil = resaleLockUntil;

        emit EventUpdated(eventId);
    }

    /**
     * @notice Pause or unpause an event
     * @param eventId Event to pause/unpause
     * @param paused New pause state
     */
    function setEventPaused(uint256 eventId, bool paused)
        external
        eventExists(eventId)
        onlyOrganizerOrPlatform(eventId)
    {
        events[eventId].paused = paused;
        emit EventPaused(eventId, paused);
    }

    /**
     * @notice Cancel an event (only before any tickets sold)
     * @param eventId Event to cancel
     */
    function cancelEvent(uint256 eventId)
        external
        eventExists(eventId)
        onlyOrganizer(eventId)
    {
        require(events[eventId].mintedCount == 0, "Cannot cancel: tickets sold");
        events[eventId].cancelled = true;
        emit EventCancelled(eventId);
    }

    // ============================================================================
    // TICKET TIER MANAGEMENT
    // ============================================================================

    /**
     * @notice Create a ticket tier for an event
     * @param eventId Parent event
     * @param name Tier name (e.g., "VIP", "General")
     * @param seatPrefix Prefix for auto-generated seats (e.g., "GA-", "VIP-")
     * @param price Ticket price in wei
     * @param tierMaxSupply Max tickets for this tier
     * @return tokenId The token ID for this tier
     */
    function createTicketTier(
        uint256 eventId,
        string memory name,
        string memory seatPrefix,
        uint256 price,
        uint256 tierMaxSupply
    ) external eventExists(eventId) onlyOrganizer(eventId) returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(tierMaxSupply > 0, "Supply must be > 0");

        uint256 tokenId = _tokenIdCounter++;

        ticketTiers[tokenId] = TicketTier({
            eventId: eventId,
            name: name,
            seatPrefix: seatPrefix,
            price: price,
            maxSupply: tierMaxSupply,
            minted: 0,
            exists: true
        });

        emit TicketTierCreated(tokenId, eventId, name, price, tierMaxSupply);
        return tokenId;
    }

    // ============================================================================
    // PUBLIC PURCHASE (Demo)
    // ============================================================================

    /**
     * @notice Public purchase function - anyone can buy tickets directly
     * @dev This is for demo purposes. In production, purchases go through backend.
     * @param tokenId Tier token ID
     * @param quantity Number of tickets to purchase
     * @return ticketIds Array of purchased ticket IDs
     */
    function purchaseTicket(
        uint256 tokenId,
        uint256 quantity
    ) external payable nonReentrant tierExists(tokenId) returns (uint256[] memory) {
        require(quantity > 0 && quantity <= maxTicketsPerTransaction, "Invalid quantity");

        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Purchasing disabled");
        require(tier.minted + quantity <= tier.maxSupply, "Tier sold out");
        require(evt.mintedCount + quantity <= evt.totalSupply, "Event sold out");

        // Check wallet limit
        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][msg.sender] + quantity <= evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        // Check payment
        uint256 totalPrice = tier.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint ERC1155 tokens to the buyer
        _mint(msg.sender, tokenId, quantity, "");

        // Create individual ticket records
        uint256[] memory ticketIds = _createTicketRecords(
            tokenId, msg.sender, quantity, eventId, tier.seatPrefix, tier.price, tier.minted
        );

        tier.minted += quantity;
        evt.mintedCount += quantity;
        eventPurchases[eventId][msg.sender] += quantity;

        if (demoMode) {
            // Demo mode: refund the entire payment to the buyer
            (bool refunded, ) = msg.sender.call{value: msg.value}("");
            require(refunded, "Demo refund failed");
            emit DemoRefund(msg.sender, msg.value);
        } else {
            // Production: distribute payment to organizer
            _distributePayment(evt.organizer, totalPrice, platformFeePrimary);

            // Refund excess
            if (msg.value > totalPrice) {
                (bool refunded, ) = msg.sender.call{value: msg.value - totalPrice}("");
                require(refunded, "Refund failed");
            }
        }

        return ticketIds;
    }

    // ============================================================================
    // MINTING (Backend Only)
    // ============================================================================

    /**
     * @notice Mint tickets with auto-generated seat IDs (MINTER_ROLE only)
     * @param tokenId Tier token ID
     * @param to Recipient address
     * @param quantity Number of tickets to mint
     * @return ticketIds Array of minted ticket IDs
     */
    function mintTicket(
        uint256 tokenId,
        address to,
        uint256 quantity
    ) external payable nonReentrant onlyRole(MINTER_ROLE) tierExists(tokenId) returns (uint256[] memory) {
        require(quantity > 0 && quantity <= maxTicketsPerTransaction, "Invalid quantity");

        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted + quantity <= tier.maxSupply, "Tier sold out");
        require(evt.mintedCount + quantity <= evt.totalSupply, "Event sold out");

        // Check wallet limit
        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] + quantity <= evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        // Check payment
        uint256 totalPrice = tier.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint ERC1155 tokens
        _mint(to, tokenId, quantity, "");

        // Create individual ticket records
        uint256[] memory ticketIds = _createTicketRecords(
            tokenId, to, quantity, eventId, tier.seatPrefix, tier.price, tier.minted
        );

        tier.minted += quantity;
        evt.mintedCount += quantity;
        eventPurchases[eventId][to] += quantity;

        if (demoMode) {
            // Demo mode: refund the entire payment to the buyer
            (bool refunded, ) = msg.sender.call{value: msg.value}("");
            require(refunded, "Demo refund failed");
            emit DemoRefund(msg.sender, msg.value);
        } else {
            // Production: distribute payment to organizer
            _distributePayment(evt.organizer, totalPrice, platformFeePrimary);

            // Refund excess
            if (msg.value > totalPrice) {
                (bool refunded, ) = msg.sender.call{value: msg.value - totalPrice}("");
                require(refunded, "Refund failed");
            }
        }

        return ticketIds;
    }

    /**
     * @notice Mint a ticket with a specific seat identifier
     * @param tokenId Tier token ID
     * @param to Recipient address
     * @param seatIdentifier Custom seat ID (must be unique for event)
     * @return ticketId The minted ticket ID
     */
    function mintTicketWithSeat(
        uint256 tokenId,
        address to,
        string memory seatIdentifier
    ) external payable nonReentrant onlyRole(MINTER_ROLE) tierExists(tokenId) returns (uint256) {
        require(bytes(seatIdentifier).length > 0, "Seat ID required");

        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted < tier.maxSupply, "Tier sold out");
        require(evt.mintedCount < evt.totalSupply, "Event sold out");

        // Check seat uniqueness
        require(
            seatRegistry[eventId][seatIdentifier] == 0 ||
            !ticketInfos[seatRegistry[eventId][seatIdentifier]].exists,
            "Seat taken"
        );

        // Check wallet limit
        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] < evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        // Check payment
        require(msg.value >= tier.price, "Insufficient payment");

        // Mint ERC1155 token
        _mint(to, tokenId, 1, "");

        // Create ticket record
        uint256 ticketId = _ticketIdCounter++;

        ticketInfos[ticketId] = TicketInfo({
            eventId: eventId,
            tierId: tokenId,
            seatIdentifier: seatIdentifier,
            originalPrice: tier.price,
            purchaseTimestamp: block.timestamp,
            originalPurchaser: to,
            currentOwner: to,
            exists: true
        });

        seatRegistry[eventId][seatIdentifier] = ticketId;
        ticketOwners[ticketId] = to;
        _eventTickets[eventId].push(ticketId);
        _userEventTickets[to][eventId].push(ticketId);

        tier.minted++;
        evt.mintedCount++;
        eventPurchases[eventId][to]++;

        emit TicketMinted(ticketId, eventId, tokenId, to, seatIdentifier, tier.price);

        if (demoMode) {
            // Demo mode: refund the entire payment to the buyer
            (bool refunded, ) = msg.sender.call{value: msg.value}("");
            require(refunded, "Demo refund failed");
            emit DemoRefund(msg.sender, msg.value);
        } else {
            // Production: distribute payment
            _distributePayment(evt.organizer, tier.price, platformFeePrimary);

            // Refund excess
            if (msg.value > tier.price) {
                (bool refunded, ) = msg.sender.call{value: msg.value - tier.price}("");
                require(refunded, "Refund failed");
            }
        }

        return ticketId;
    }

    /**
     * @notice Batch mint tickets for multiple recipients
     * @param tokenIds Array of tier token IDs
     * @param recipients Array of recipient addresses
     * @param quantities Array of quantities per recipient
     */
    function mintBatch(
        uint256[] calldata tokenIds,
        address[] calldata recipients,
        uint256[] calldata quantities
    ) external payable nonReentrant onlyRole(MINTER_ROLE) {
        require(
            tokenIds.length == recipients.length &&
            recipients.length == quantities.length,
            "Array length mismatch"
        );
        require(tokenIds.length > 0, "Empty arrays");

        uint256 totalRequired = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ticketTiers[tokenIds[i]].exists, "Tier not found");
            totalRequired += ticketTiers[tokenIds[i]].price * quantities[i];
        }

        require(msg.value >= totalRequired, "Insufficient payment");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            // Call internal mint logic (simplified - creates tickets without individual payments)
            _mintInternal(tokenIds[i], recipients[i], quantities[i]);
        }

        if (demoMode) {
            // Demo mode: refund the entire payment
            (bool refunded, ) = msg.sender.call{value: msg.value}("");
            require(refunded, "Demo refund failed");
            emit DemoRefund(msg.sender, msg.value);
        } else {
            // Refund excess in production mode
            if (msg.value > totalRequired) {
                (bool refunded, ) = msg.sender.call{value: msg.value - totalRequired}("");
                require(refunded, "Refund failed");
            }
        }
    }

    // ============================================================================
    // RESALE MARKETPLACE
    // ============================================================================

    /**
     * @notice List a ticket for resale
     * @param ticketId Global ticket ID
     * @param price Asking price in wei
     */
    function listForResale(uint256 ticketId, uint256 price) external {
        TicketInfo storage ticket = ticketInfos[ticketId];
        require(ticket.exists, "Ticket not found");
        require(ticket.currentOwner == msg.sender, "Not ticket owner");

        EventConfig storage evt = events[ticket.eventId];
        require(evt.resaleEnabled, "Resale disabled");
        require(block.timestamp >= evt.resaleLockUntil, "Resale locked");
        require(!evt.paused && !evt.cancelled && !globalPause, "Event inactive");

        // Enforce price cap
        uint256 maxPrice = (ticket.originalPrice * evt.maxResalePercentage) / 100;
        require(price <= maxPrice, "Price exceeds cap");

        // Check not already listed
        require(!resaleListings[ticketId].active, "Already listed");

        // Must own the ERC1155 token
        require(balanceOf(msg.sender, ticket.tierId) > 0, "Token not owned");

        resaleListings[ticketId] = ResaleListing({
            ticketId: ticketId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit TicketListedForResale(ticketId, msg.sender, price);
    }

    /**
     * @notice Buy a ticket from resale market
     * @param ticketId Global ticket ID
     */
    function buyResaleTicket(uint256 ticketId) external payable nonReentrant {
        ResaleListing storage listing = resaleListings[ticketId];
        require(listing.active, "Not listed");

        TicketInfo storage ticket = ticketInfos[ticketId];
        EventConfig storage evt = events[ticket.eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Event inactive");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as sold
        listing.active = false;

        // Transfer ERC1155 token
        _safeTransferFrom(seller, msg.sender, ticket.tierId, 1, "");

        // Update ownership tracking
        ticket.currentOwner = msg.sender;
        ticketOwners[ticketId] = msg.sender;
        _userEventTickets[msg.sender][ticket.eventId].push(ticketId);

        if (demoMode) {
            // Demo mode: refund the entire payment to the buyer
            (bool refunded, ) = msg.sender.call{value: msg.value}("");
            require(refunded, "Demo refund failed");
            emit DemoRefund(msg.sender, msg.value);
        } else {
            // Production: pay the seller (minus platform fee)
            _distributePayment(seller, price, platformFeeResale);

            // Refund excess
            if (msg.value > price) {
                (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
                require(refunded, "Refund failed");
            }
        }

        emit TicketResold(ticketId, seller, msg.sender, price);
    }

    /**
     * @notice Cancel a resale listing
     * @param ticketId Global ticket ID
     */
    function cancelResaleListing(uint256 ticketId) external {
        ResaleListing storage listing = resaleListings[ticketId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");

        listing.active = false;
        emit ResaleListingCancelled(ticketId);
    }

    // ============================================================================
    // QUERY FUNCTIONS
    // ============================================================================

    /**
     * @notice Get all ticket IDs for an event
     * @param eventId Event ID
     * @return Array of ticket IDs
     */
    function getEventTickets(uint256 eventId) external view returns (uint256[] memory) {
        return _eventTickets[eventId];
    }

    /**
     * @notice Get user's tickets for a specific event
     * @param user User address
     * @param eventId Event ID
     * @return Array of ticket IDs
     */
    function getUserTicketsForEvent(address user, uint256 eventId)
        external view returns (uint256[] memory)
    {
        return _userEventTickets[user][eventId];
    }

    /**
     * @notice Get remaining purchase allowance for a wallet
     * @param eventId Event ID
     * @param user User address
     * @return Remaining tickets the user can purchase (type(uint256).max if unlimited)
     */
    function getRemainingAllowance(uint256 eventId, address user)
        external view returns (uint256)
    {
        EventConfig storage evt = events[eventId];
        if (evt.maxTicketsPerWallet == 0) {
            return type(uint256).max; // Unlimited
        }
        uint256 purchased = eventPurchases[eventId][user];
        if (purchased >= evt.maxTicketsPerWallet) {
            return 0;
        }
        return evt.maxTicketsPerWallet - purchased;
    }

    /**
     * @notice Check if a seat is available
     * @param eventId Event ID
     * @param seatIdentifier Seat ID to check
     * @return true if available
     */
    function isSeatAvailable(uint256 eventId, string memory seatIdentifier)
        external view returns (bool)
    {
        uint256 existingTicketId = seatRegistry[eventId][seatIdentifier];
        return existingTicketId == 0 || !ticketInfos[existingTicketId].exists;
    }

    /**
     * @notice Get event details
     * @param eventId Event ID
     * @return Event configuration
     */
    function getEvent(uint256 eventId) external view returns (EventConfig memory) {
        require(events[eventId].exists, "Event not found");
        return events[eventId];
    }

    /**
     * @notice Get ticket tier details
     * @param tokenId Token ID
     * @return Ticket tier configuration
     */
    function getTicketTier(uint256 tokenId) external view returns (TicketTier memory) {
        require(ticketTiers[tokenId].exists, "Tier not found");
        return ticketTiers[tokenId];
    }

    /**
     * @notice Get ticket info
     * @param ticketId Global ticket ID
     * @return Ticket information
     */
    function getTicketInfo(uint256 ticketId) external view returns (TicketInfo memory) {
        require(ticketInfos[ticketId].exists, "Ticket not found");
        return ticketInfos[ticketId];
    }

    // ============================================================================
    // PLATFORM ADMIN FUNCTIONS
    // ============================================================================

    /**
     * @notice Set platform fees
     * @param primaryFee Fee on primary sales (basis points, max 1000 = 10%)
     * @param resaleFee Fee on resales (basis points, max 1000 = 10%)
     */
    function setPlatformFees(uint256 primaryFee, uint256 resaleFee)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(primaryFee <= 1000 && resaleFee <= 1000, "Fee too high");
        platformFeePrimary = primaryFee;
        platformFeeResale = resaleFee;
    }

    /**
     * @notice Set platform wallet
     * @param wallet New platform wallet address
     */
    function setPlatformWallet(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wallet != address(0), "Invalid address");
        platformWallet = wallet;
    }

    /**
     * @notice Verify or unverify an organizer
     * @param organizer Organizer address
     * @param verified Verification status
     */
    function setOrganizerVerified(address organizer, bool verified)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        verifiedOrganizers[organizer] = verified;
        emit OrganizerVerified(organizer, verified);
    }

    /**
     * @notice Set global pause state
     * @param paused New pause state
     */
    function setGlobalPause(bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        globalPause = paused;
        emit GlobalPauseSet(paused);
    }

    /**
     * @notice Set demo mode (auto-refund on purchases)
     * @param enabled Enable or disable demo mode
     */
    function setDemoMode(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        demoMode = enabled;
        emit DemoModeSet(enabled);
    }

    /**
     * @notice Set platform limits
     * @param _maxEventSupply Max tickets per event
     * @param _maxTicketsPerTx Max tickets per transaction
     */
    function setPlatformLimits(uint256 _maxEventSupply, uint256 _maxTicketsPerTx)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        maxEventSupply = _maxEventSupply;
        maxTicketsPerTransaction = _maxTicketsPerTx;
    }

    /**
     * @notice Set token URI
     * @param newuri New base URI
     */
    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @dev Generate a seat ID from prefix and number
     */
    function _generateSeatId(string memory prefix, uint256 number)
        internal pure returns (string memory)
    {
        return string(abi.encodePacked(prefix, _padNumber(number, 4)));
    }

    /**
     * @dev Pad a number with leading zeros
     */
    function _padNumber(uint256 number, uint256 width)
        internal pure returns (string memory)
    {
        bytes memory buffer = new bytes(width);
        for (uint256 i = width; i > 0; i--) {
            buffer[i - 1] = bytes1(uint8(48 + (number % 10)));
            number /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Distribute payment between recipient and platform
     */
    function _distributePayment(address recipient, uint256 amount, uint256 feeRate) internal {
        uint256 fee = (amount * feeRate) / 10000;
        uint256 recipientAmount = amount - fee;

        if (fee > 0) {
            (bool sentFee, ) = platformWallet.call{value: fee}("");
            require(sentFee, "Platform fee failed");
        }

        if (recipientAmount > 0) {
            (bool sentRecipient, ) = recipient.call{value: recipientAmount}("");
            require(sentRecipient, "Payment failed");
        }
    }

    /**
     * @dev Create ticket records for minted tickets (reduces stack depth)
     */
    function _createTicketRecords(
        uint256 tokenId,
        address to,
        uint256 quantity,
        uint256 eventId,
        string memory seatPrefix,
        uint256 price,
        uint256 startingMintIndex
    ) internal returns (uint256[] memory) {
        uint256[] memory ticketIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; i++) {
            uint256 ticketId = _ticketIdCounter++;
            string memory seatId = _generateSeatId(seatPrefix, startingMintIndex + i);

            // Ensure seat is unique
            require(
                seatRegistry[eventId][seatId] == 0 ||
                !ticketInfos[seatRegistry[eventId][seatId]].exists,
                "Seat taken"
            );

            _storeTicketInfo(ticketId, eventId, tokenId, seatId, price, to);
            ticketIds[i] = ticketId;

            emit TicketMinted(ticketId, eventId, tokenId, to, seatId, price);
        }

        return ticketIds;
    }

    /**
     * @dev Store ticket info to reduce stack depth
     */
    function _storeTicketInfo(
        uint256 ticketId,
        uint256 eventId,
        uint256 tokenId,
        string memory seatId,
        uint256 price,
        address to
    ) internal {
        ticketInfos[ticketId] = TicketInfo({
            eventId: eventId,
            tierId: tokenId,
            seatIdentifier: seatId,
            originalPrice: price,
            purchaseTimestamp: block.timestamp,
            originalPurchaser: to,
            currentOwner: to,
            exists: true
        });

        seatRegistry[eventId][seatId] = ticketId;
        ticketOwners[ticketId] = to;
        _eventTickets[eventId].push(ticketId);
        _userEventTickets[to][eventId].push(ticketId);
    }

    /**
     * @dev Internal mint logic for batch operations
     */
    function _mintInternal(uint256 tokenId, address to, uint256 quantity) internal {
        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted + quantity <= tier.maxSupply, "Tier sold out");
        require(evt.mintedCount + quantity <= evt.totalSupply, "Event sold out");

        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] + quantity <= evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        _mint(to, tokenId, quantity, "");

        // Use helper to create ticket records
        _createTicketRecords(
            tokenId, to, quantity, eventId, tier.seatPrefix, tier.price, tier.minted
        );

        tier.minted += quantity;
        evt.mintedCount += quantity;
        eventPurchases[eventId][to] += quantity;

        if (!demoMode) {
            // Production: distribute payment to organizer
            _distributePayment(evt.organizer, tier.price * quantity, platformFeePrimary);
        }
        // Note: In demo mode, refund is handled at the mintBatch caller level
    }

    // ============================================================================
    // OVERRIDES
    // ============================================================================

    /**
     * @dev Override to check transfer restrictions
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        // Skip checks for minting (from == address(0))
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 tokenId = ids[i];
                if (ticketTiers[tokenId].exists) {
                    uint256 eventId = ticketTiers[tokenId].eventId;
                    EventConfig storage evt = events[eventId];

                    // Check if transfers are enabled (unless it's a resale)
                    // Note: Resale transfers are handled in buyResaleTicket
                    require(evt.transferEnabled || evt.resaleEnabled, "Transfers disabled");
                }
            }
        }

        super._update(from, to, ids, values);
    }

    /**
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
