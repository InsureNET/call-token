pragma solidity 0.5.8;

import { ERC1820Client } from "erc1820/contracts/ERC1820Client.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


contract Test is ERC1820Client {

    function tokensReceived(
        address operator, // solhint-disable no-unused-vars
        address from,
        address to,
        uint amount,
        bytes memory userData,
        bytes memory operatorData
    )  // solhint-enable no-unused-vars
    public
    {
        IERC20(msg.sender).transferFrom(from, to, amount);
    }

    function checkReentrancyTransferFrom(address _contract, address _from, address _to, uint256 _value) public {
        setInterface('ERC777TokensRecipient', address(this));
        IERC20(_contract).transferFrom(_from, _to, _value);
        setInterface('ERC777TokensRecipient', address(0));
    }

    function setInterface(string memory _ifaceName, address _ifaceAddr) public {
        setInterfaceImplementation(_ifaceName, _ifaceAddr);
    }

    // solhint-disable-next-line no-unused-vars
    function canImplementInterfaceForAddress(bytes32 interfaceHash, address addr) public view returns (bytes32) {
        return keccak256(abi.encodePacked("ERC1820_ACCEPT_MAGIC"));
    }
}
