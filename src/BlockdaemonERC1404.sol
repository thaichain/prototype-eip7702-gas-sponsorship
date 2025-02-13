// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IERC1404.sol";

contract BlockdaemonERC1404 is ERC20, IERC1404, Ownable {
    uint256 private constant _magnitude = 10 ** 18;
    uint256 private constant _minAmount = 10 * _magnitude;

    mapping (address => uint256) private _balances;
    uint256 private _totalSupply;

    mapping (uint8 => string) private _restrictionCodes;
    uint8 private constant NO_RESTRICTIONS = 0;
    uint8 private constant NOT_MINIMUM_AMOUNT = 1;
    uint8 private constant ZERO_ADDRESS = 10;
    uint8 private constant NOT_ENOUGH_FUNDS = 11;

    constructor() Ownable(msg.sender) ERC20("BlockdaemonERC1404", "BD1404") {
        // 10^9 * magnitude (10^18)
        _mint(msg.sender, 10 ** 9 * _magnitude);

        _restrictionCodes[NO_RESTRICTIONS] = "NO_RESTRICTIONS";
        _restrictionCodes[NOT_MINIMUM_AMOUNT] = "cannot send less than 10 tokens";
        _restrictionCodes[ZERO_ADDRESS] = "cannot send to the zero address";
        _restrictionCodes[NOT_ENOUGH_FUNDS] = "cannot send: not enough funds";
    }

    // ERC20 functions

    function _update(address sender, address recipient, uint256 amount) internal override {
        // mint
        if (sender == address(0)) {
            require(recipient != address(0), "ERC20: mint to the zero address");
            _totalSupply += amount;
            _balances[recipient] += amount;
            emit Transfer(address(0), recipient, amount);
        }

        // burn
        else if (recipient == address(0)) {
            require(sender != address(0), "ERC20: burn from the zero address");
            (bool success, uint256 newBalance) = Math.trySub(_balances[sender], amount);
            require(success, "Subtraction overflow");
            _balances[sender] = newBalance;
            (bool successTotal, uint256 newTotalSupply) = Math.trySub(_totalSupply, amount);
            require(successTotal, "Subtraction overflow");
            _totalSupply = newTotalSupply;
            emit Transfer(sender, address(0), amount);
        }

        // simple transfer
        else {
            require(detectTransferRestriction(sender,recipient,amount) == NO_RESTRICTIONS, "Transfer Restriction detected");
            (bool success, uint256 newBalance) = Math.trySub(_balances[sender], amount);
            require(success, "Subtraction overflow");
            _balances[sender] = newBalance;
            _balances[recipient] += amount;
            emit Transfer(sender, recipient, amount);
        }
    }

    function balanceOf(address account) public override view returns (uint256) {
        return _balances[account];
    }

    function totalSupply() public override view returns (uint256) {
        return _totalSupply;
    }

    function mint(address account, uint256 amount) public { // removed onlyOwner modifier to allow for testing
        super._mint(account, amount);
    }

    // ERC1404 functions

    function detectTransferRestriction(address sender, address recipient, uint256 amount) public view returns (uint8){
        if(_balances[sender] < amount){
            return NOT_ENOUGH_FUNDS;
        } else if (address(recipient) == address(0)) {
            return ZERO_ADDRESS;
        } else if (amount < _minAmount) {
            return NOT_MINIMUM_AMOUNT;
        } else {
            return NO_RESTRICTIONS;
        }
    }

    function minAmount() external pure returns (uint256){
        return _minAmount;
    }

    function messageForTransferRestriction(uint8 restrictionCode) external view returns (string memory){
        return _restrictionCodes[restrictionCode];
    }
}