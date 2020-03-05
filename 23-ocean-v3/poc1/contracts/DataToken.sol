pragma solidity ^0.5.6;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol";


contract DataToken is Ownable, ERC721, ERC721Metadata {

    mapping(uint256 => uint256) private tokenExpiresAt;

    event Minted (
        address indexed to,
        uint256 indexed tokenId,
        string metadata,
        uint256 expireAt
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
        uint256 expireAt,
        string memory metadata
    )
    public
    returns (bool)
    {
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadata);
        _setTokenExpireAt(tokenId, expireAt);
        emit Minted(
            to,
            tokenId,
            metadata,
            expireAt
        );
        return true;
    }

    function _setTokenExpireAt(
        uint256 tokenId,
        uint256 expireAt
    )
    private
    {
        require(
        // change this to safeMath
            (expireAt + block.number) > block.number,
            'ERC721: Invalid tokenId expiration date'
        );
        tokenExpiresAt[tokenId] = expireAt + block.number;
    }

    function getTokenExpiredAt(
        uint256 tokenId
    )
    external
    view
    returns(uint256)
    {
        return tokenExpiresAt[tokenId];
    }

    function isExpiredToken(
        uint256 tokenId
    )
    external
    view
    returns(bool)
    {
        if(block.number >= tokenExpiresAt[tokenId]){
            return true;
        }
        return false;
    }
}