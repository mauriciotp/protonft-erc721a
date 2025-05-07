// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "erc721a/contracts/ERC721A.sol";

contract ProtoNFT is ERC721A {
    address payable private _owner;

    constructor() ERC721A("ProtoNFT", "PNFT") {
        _owner = payable(msg.sender);
    }

    function mint(uint256 quantity) public payable {
        require(msg.value >= 0.01 ether, "Insufficient payment");
        _mint(msg.sender, quantity);
    }

    function burn(uint256 tokenId) external {
        super._burn(tokenId, true);
    }

    function withdraw() external {
        require(msg.sender == _owner, "You do not have permission");
        uint256 amount = address(this).balance;
        (bool success, ) = _owner.call{value: amount}("");
        require(success, "Withdraw failed.");
    }

    function _baseURI() internal pure override returns (string memory) {
        return
            "ipfs://bafybeif4hphlazamgc5buppqlk3glesfuadm7yw3gzpapokv2ahrqk5oby/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A) returns (string memory) {
        return string.concat(super.tokenURI(tokenId), ".json");
    }
}
