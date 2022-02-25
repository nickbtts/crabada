//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Crabada {
	address public owner;

	function startGame(uint256 teamId) public {}
	function closeGame(uint256 gameId) public {}
	function settleGame(uint256 gameId) public {}
	function attack(uint256 gameId, uint256 attackTeamId) public {}
	function reinforceAttack(uint256 gameId, uint256 crabadaId, uint256 borrowPrice) public {}
	function reinforceDefense(uint256 gameId, uint256 crabadaId, uint256 borrowPrice) public {}
}
