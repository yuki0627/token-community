// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

interface IMemberNFT {
    function balanceOf(address owner) external view returns (uint256);
}

contract OnChainNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => uint) public birthdays;
    IMemberNFT public imemberNFT;

    /**
     * @dev
     * - URI設定時に誰がどのtokenIdに何のURIを設定したか記録する
     */
    event TokenURIChanged(address indexed sender, uint256 indexed tokenId, string uri);

    constructor(address nftContract_) ERC721("OnChainNFT", "OCN") {
        imemberNFT = IMemberNFT(nftContract_);
    }

    function remainTime(uint256 tokenId) public view returns(uint) {
        uint life = birthdays[tokenId] + 7 minutes;
        if(block.timestamp > life) {
            return 0;
        } else {
            return life - block.timestamp;
        }
    }
    /**
     * @dev 
     * - 誰でもMint可能
     * - tokenIdをインクリメント _tokenIds.increment()
     * - 画像データメタデータを設定しURIを定義 imageData, metaData,uri     
     * - nftMint関数実行アドレス(=デプロイアドレス)にtokenIdを紐づけ _msgSender()
     * - mintの際にURIを設定 _setTokenURI（）
     * - EVENT発火 emit TokenURIChanged
     */
    function nftMint() public {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        string memory imageData = '\
            <svg viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">\
                <polygon points="50 175, 175 50, 300 175, 175 300" stroke="green" fill="yellow" />\
            </svg>\
        ';

        bytes memory metaData = abi.encodePacked(
            '{"name": "',
            'Alive # ',
            Strings.toString(newTokenId),
            '", "description": "life is short", ',
            '"image": "data:image/svg+xml;base64,',
            Base64.encode(bytes(imageData)),
            '"}'
        );

        string memory uri = string(abi.encodePacked("data:application/json;base64,",Base64.encode(metaData)));

        _mint(_msgSender(), newTokenId);
        _setTokenURI(newTokenId, uri);
        birthdays[newTokenId] = block.timestamp;

        emit TokenURIChanged(_msgSender(), newTokenId, uri);
    }

    function getNow() public view returns (uint256) {
        return block.timestamp;
    }

    function onOff() public view returns (uint256) {
        bytes32 rand = keccak256(abi.encodePacked(block.timestamp));
        return uint256(rand) % 2;
    }

    function memberNftCount(address targetAddress) public view returns (uint256) {
        return imemberNFT.balanceOf(targetAddress);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "nonexsitent token" );
        uint256 count = memberNftCount(ownerOf(tokenId));
        if(remainTime(tokenId) > 0 ){
            return super.tokenURI(tokenId);
        } else {
            // address imemberNFT.ownerOf(tokenId);
            string memory imageData = '\
                <svg viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">\
                    <polygon points="50 175, 175 50, 300 175, 175 300" stroke="green" fill="red" />\
                </svg>\
            ';

            bytes memory metaData = abi.encodePacked(
                '{"name": "',
                'Dead #  ',
                Strings.toString(block.timestamp),
                '", "count": "',
                Strings.toString(count),
                '", "description": "goodbye",',
                '"remain": "',
                Strings.toString(remainTime(tokenId)),
                '",',
                '"image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(imageData)),
                '"}'
            );
            string memory dead = string(abi.encodePacked("data:application/json;base64,",Base64.encode(metaData)));
            return dead;
        }
    }
}