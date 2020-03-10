pragma solidity ^0.5.6;

import './MessageSigned.sol';
import '@openzeppelin/contracts/ownership/Ownable.sol';
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol";


contract DataToken is Ownable, ERC721, ERC721Metadata, ERC721Burnable, MessageSigned {

    mapping(uint256 => uint256) private tokenExpiresAt;

    event Minted (
        address indexed to,
        uint256 indexed tokenId,
        string metadata
    );

    constructor()
    ERC721Metadata("DATATOKEN", "DAT")
    public
    {
        Ownable.transferOwnership(msg.sender);
    }

    /**
     * @dev mintWithMetaData Mint new tokens for free (mint as you go).
     * @param to The address that will receive the minted tokens.
     * @param tokenId The token id to mint.
     * @param metadata A metadata attached to the minted token
     * @return A boolean that indicates if the operation was successful.
    */
    function mint(
        address to,
        uint256 tokenId,
        string memory metadata
    )
    public
    returns (bool)
    {
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadata);
        emit Minted(
            to,
            tokenId,
            metadata
        );
        return true;
    }

    function getHash(uint tokenId, uint price, string memory metadata) public view returns(bytes32) {
        return _hashData(tokenId, price, metadata);
    }

    function getMessageSigner(uint tokenId, 
                    uint price, 
                    string memory metadata,
                    bytes memory signature
            ) public returns(address) {
        return _getSigner(tokenId, price, metadata, signature);   
        }

    function _getSigner(uint _tokenId, 
                    uint _price, 
                    string memory _metadata, 
                    bytes memory _signature
            ) internal returns(address) {
        return _recoverAddress(_getSignHash(_hashData(_tokenId, _price, _metadata)), _signature);

    }

    function _hashData(uint _tokenId, 
                   uint _price, 
                   string memory _metadata) internal view returns (bytes32) {
            return keccak256(abi.encodePacked(_tokenId, _price, _metadata)); 
    }

}