// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LandRegistry is ERC721, AccessControlEnumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _transactionIds;

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    
    struct LandRecord {
        string location;
        uint256 area;
        string ipfsHash;
        address owner;
        bool isVerified;
        uint256 price;
        uint256 timestamp;
        string parcelId;
    }
    
    struct Transaction {
        uint256 transactionId;
        uint256 tokenId;
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
    }
    
    mapping(uint256 => LandRecord) public landRecords;
    mapping(uint256 => Transaction[]) public landTransactions;
    mapping(string => bool) public parcelIdExists;
    
    event LandMinted(uint256 indexed tokenId, address indexed owner, string location, string parcelId);
    event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event LandListed(uint256 indexed tokenId, uint256 price);
    event LandDelisted(uint256 indexed tokenId);
    
    constructor() ERC721("LandRegistryToken", "LAND") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }
    
    modifier landExists(uint256 tokenId) {
        require(_exists(tokenId), "Land does not exist");
        _;
    }
    
    modifier onlyLandOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the land owner");
        _;
    }
    
    function mintLand(
        address _owner,
        string memory _location,
        uint256 _area,
        string memory _ipfsHash,
        string memory _parcelId
    ) public onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(!parcelIdExists[_parcelId], "Parcel ID already exists");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(_owner, newTokenId);
        
        landRecords[newTokenId] = LandRecord({
            location: _location,
            area: _area,
            ipfsHash: _ipfsHash,
            owner: _owner,
            isVerified: true,
            price: 0,
            timestamp: block.timestamp,
            parcelId: _parcelId
        });
        
        parcelIdExists[_parcelId] = true;
        
        emit LandMinted(newTokenId, _owner, _location, _parcelId);
        return newTokenId;
    }
    
    function transferLand(address _to, uint256 _tokenId) public landExists(_tokenId) onlyLandOwner(_tokenId) {
        require(_to != address(0), "Invalid address");
        
        address from = msg.sender;
        safeTransferFrom(from, _to, _tokenId);
        
        landRecords[_tokenId].owner = _to;
        landRecords[_tokenId].timestamp = block.timestamp;
        
        _recordTransaction(_tokenId, from, _to, 0);
        
        if (landRecords[_tokenId].price > 0) {
            landRecords[_tokenId].price = 0;
            emit LandDelisted(_tokenId);
        }
        
        emit LandTransferred(_tokenId, from, _to, 0);
    }
    
    function listForSale(uint256 _tokenId, uint256 _price) public landExists(_tokenId) onlyLandOwner(_tokenId) {
        require(_price > 0, "Price must be greater than 0");
        landRecords[_tokenId].price = _price;
        emit LandListed(_tokenId, _price);
    }
    
    function delist(uint256 _tokenId) public landExists(_tokenId) onlyLandOwner(_tokenId) {
        landRecords[_tokenId].price = 0;
        emit LandDelisted(_tokenId);
    }
    
    function buyLand(uint256 _tokenId) public payable landExists(_tokenId) {
        LandRecord storage land = landRecords[_tokenId];
        address currentOwner = land.owner;
        
        require(msg.value >= land.price, "Insufficient funds sent");
        require(land.price > 0, "Land is not for sale");
        require(msg.sender != currentOwner, "Cannot buy your own land");
        
        (bool sent, ) = payable(currentOwner).call{value: land.price}("");
        require(sent, "Failed to send Ether");
        
        safeTransferFrom(currentOwner, msg.sender, _tokenId);
        
        land.owner = msg.sender;
        land.price = 0;
        land.timestamp = block.timestamp;
        
        _recordTransaction(_tokenId, currentOwner, msg.sender, land.price);
        
        if (msg.value > land.price) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - land.price}("");
            require(refundSent, "Refund failed");
        }
        
        emit LandTransferred(_tokenId, currentOwner, msg.sender, land.price);
    }
    
    function _recordTransaction(uint256 _tokenId, address _from, address _to, uint256 _price) internal {
        _transactionIds.increment();
        landTransactions[_tokenId].push(Transaction({
            transactionId: _transactionIds.current(),
            tokenId: _tokenId,
            from: _from,
            to: _to,
            price: _price,
            timestamp: block.timestamp
        }));
    }
    
    function getLandDetails(uint256 _tokenId) public view returns (
        string memory location,
        uint256 area,
        string memory ipfsHash,
        address owner,
        bool isVerified,
        uint256 price,
        uint256 timestamp,
        string memory parcelId
    ) {
        LandRecord storage land = landRecords[_tokenId];
        return (
            land.location,
            land.area,
            land.ipfsHash,
            land.owner,
            land.isVerified,
            land.price,
            land.timestamp,
            land.parcelId
        );
    }
    
    function getTransactionHistory(uint256 _tokenId) public view returns (Transaction[] memory) {
        return landTransactions[_tokenId];
    }
    
    function getLandsByOwner(address _owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory lands = new uint256[](balance);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == _owner) {
                lands[counter] = i;
                counter++;
            }
        }
        
        return lands;
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControlEnumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}