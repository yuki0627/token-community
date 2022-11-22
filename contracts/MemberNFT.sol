// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemberNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    /**
     * @dev 
     * - _tokenIds
     */
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint _start;
    uint _end;

    modifier timerOver {
        require(block.timestamp <= _end, "The timer is over");
        _;
    }
    /**
     * @dev 
     * - 誰にどのURIでNFTをmintしたかを記録
     */
    event TokenURIChanged(address indexed to, uint256 indexed tokenId, string uri);

    constructor() ERC721("MemberNFT", "MEM") {}

    /**
     * @dev 
     * - このコントラクトをデプロイしたアドレスだけがmint可能 onlyOwner
     */
    function nftMint(address to, string calldata uri) external onlyOwner {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        emit TokenURIChanged(to, newTokenId, uri);
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    // TOOD: tokenに持たせる
    function start() public onlyOwner {
        _start = block.timestamp;
        _end = _start + 10; //10秒
    }

    function getTimeLeft() public timerOver view returns(uint) {
        return _end - block.timestamp;
    }

    /**
     * @dev 
     * - オーバーライド
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev
     * - オーバーライド
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev
     * - オーバーライド
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev
     * - オーバーライド
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}