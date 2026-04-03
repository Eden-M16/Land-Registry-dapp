// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LandRegistry is ERC721, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    Counters.Counter private _tokenIds;

    struct Land {
        uint256 id;
        string location;
        uint256 area;
        string parcelId;
        address owner;
        uint256 listedPrice;
        bool isListed;
        uint256 timestamp;
    }

    struct Transaction {
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Land) public lands;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => Transaction[]) private _transactionHistory;

    event LandRegistered(uint256 indexed tokenId, address indexed owner, string location, uint256 area);
    event LandListed(uint256 indexed tokenId, uint256 price);
    event LandDelisted(uint256 indexed tokenId);
    event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event LandSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);

    constructor(address adminWallet) ERC721("LandChain", "LAND") {
        require(adminWallet != address(0), "Invalid admin wallet");
        _grantRole(DEFAULT_ADMIN_ROLE, adminWallet);
        _grantRole(REGISTRAR_ROLE, adminWallet);
    }

    modifier onlyRegistrar() {
        require(hasRole(REGISTRAR_ROLE, msg.sender), "Only registrar can call");
        _;
    }

    function registerLand(
        address to,
        string memory location,
        uint256 area,
        string memory parcelId,
        string memory tokenURI
    ) public onlyRegistrar returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(location).length > 0, "Location required");
        require(area > 0, "Area must be > 0");
        require(bytes(parcelId).length > 0, "Parcel ID required");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        lands[newTokenId] = Land({
            id: newTokenId,
            location: location,
            area: area,
            parcelId: parcelId,
            owner: to,
            listedPrice: 0,
            isListed: false,
            timestamp: block.timestamp
        });

        _transactionHistory[newTokenId].push(Transaction({
            from: address(0),
            to: to,
            price: 0,
            timestamp: block.timestamp
        }));

        emit LandRegistered(newTokenId, to, location, area);
        return newTokenId;
    }

    function listForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");
        lands[tokenId].listedPrice = price;
        lands[tokenId].isListed = true;
        emit LandListed(tokenId, price);
    }

    function delistLand(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        lands[tokenId].listedPrice = 0;
        lands[tokenId].isListed = false;
        emit LandDelisted(tokenId);
    }

    function buyLand(uint256 tokenId) public payable {
        Land storage land = lands[tokenId];
        require(land.isListed, "Land not for sale");
        require(msg.value >= land.listedPrice, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy own land");

        address seller = ownerOf(tokenId);
        uint256 price = land.listedPrice;

        payable(seller).transfer(msg.value);
        _transfer(seller, msg.sender, tokenId);

        land.owner = msg.sender;
        land.isListed = false;
        land.listedPrice = 0;

        _transactionHistory[tokenId].push(Transaction({
            from: seller,
            to: msg.sender,
            price: price,
            timestamp: block.timestamp
        }));

        emit LandSold(tokenId, seller, msg.sender, msg.value);
    }

    function transferLand(uint256 tokenId, address newOwner) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid address");

        address from = msg.sender;
        _transfer(from, newOwner, tokenId);
        lands[tokenId].owner = newOwner;

        _transactionHistory[tokenId].push(Transaction({
            from: from,
            to: newOwner,
            price: 0,
            timestamp: block.timestamp
        }));

        emit LandTransferred(tokenId, msg.sender, newOwner);
    }

    function getLandDetails(uint256 tokenId) public view returns (
        uint256 id,
        string memory location,
        uint256 area,
        string memory parcelId,
        address owner,
        uint256 listedPrice,
        bool isListed,
        uint256 timestamp
    ) {
        Land memory land = lands[tokenId];
        return (
            land.id,
            land.location,
            land.area,
            land.parcelId,
            land.owner,
            land.listedPrice,
            land.isListed,
            land.timestamp
        );
    }

    function getTransactionHistory(uint256 tokenId) public view returns (Transaction[] memory) {
        return _transactionHistory[tokenId];
    }

    function getLandsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory result = new uint256[](totalTokens);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                result[count] = i;
                count++;
            }
        }
        
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }

    function getListedLands() public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory result = new uint256[](totalTokens);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && lands[i].isListed) {
                result[count] = i;
                count++;
            }
        }
        
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }

    function isRegistrar(address account) public view returns (bool) {
        return hasRole(REGISTRAR_ROLE, account);
    }

    function totalLands() public view returns (uint256) {
        return _tokenIds.current();
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}