// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    /// @dev Tokenの名前
    string private _name;

    /// @dev Tokenのシンボル
    string private _symbol;

    /// @dev Tokenの総供給数
    uint256 constant _totalSupply = 1000;

    /// @dev TokenBankが預かっているTokenの総数
    uint256 private _bankTotalDeposit;

    /// @dev TokenBankのオーナー
    address public owner;

    /// @dev アカウントアドレスごとのToken残高
    mapping(address => uint256) private _balances;

    /// @dev TokenBankが預かっているToken残高
    mapping(address => uint256) private _tokenBankBalances;

    /// @dev Token移転時のイベント
    event TokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /// @dev Token預入時のイベント
    event TokenDeposit(
        address indexed from,
        uint256 amount
    );

    /// @dev Token引き出し時のイベント
    event TokenWithdraw(
        address indexed from,
        uint256 amount
    );
}