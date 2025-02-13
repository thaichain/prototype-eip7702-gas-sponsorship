pragma solidity ^0.8.27;
 
contract BatchCallDelegation {
  // TODO: add event emits

  struct Call {
    bytes data;
    address to;
    uint256 value;
  }
 
  function execute(Call[] calldata calls) external payable {
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
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
}