pragma solidity ^0.8.27;
 
contract BatchCallDelegation {

  struct Call {
    bytes data;
    address to;
    uint256 value;
  }

  event Executed(address indexed to, uint256 value, bytes data);
 
  function execute(Call[] calldata calls) external payable {
    // consider allow-listing Gas Sponsor addresses
    // recover and verift wallet EOA from signature arg
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
      emit Executed(call.to, call.value, call.data);
    }
  }

  function deployContract(bytes memory bytecode) public payable returns (address) {
      address deployedAddress;
      assembly {
          deployedAddress := create(0, add(bytecode, 0x20), mload(bytecode))
      }
      require(deployedAddress != address(0), "Deployment failed");
      return deployedAddress;
  }

  receive() external payable {} // Might not want to be able to receive ETH
}