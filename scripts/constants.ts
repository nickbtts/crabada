import { ethers } from 'hardhat'

//SETTINGS
export const SETTINGS = {
  //Delay between two api calls in milliseconds
  API_DELAY: 5 * 1000,
  //Strategy to apply
  LOTS_OF_MINES: 14,
  STRATEGY_WAIT_LOTS_OF_MINES: true, //Wait for more than "LOTS_OF_MINES" mines available to try to loot one in the middle
  STRATEGY_YOLO: false, //Check all mines constantly 
  //Your address
  USER_ADDRESS: '0x49806e26a35537769A6800d0f6631114F8703d7A',
  //The team you are looting with
	USER_TEAM_ID: '6313',
  //The factions your team has an advantage against
  FACTION_ADVANTAGES: ['ORE', 'FAERIES'],
  //If the gwei gets higher than this, the script will not run
  MAX_GAS_PRICE: ethers.utils.parseUnits('50', 'gwei'),
  //If the gwei *priority* gets higher than this, the script will not run
  MAX_GAS_PRIORITY: ethers.utils.parseUnits('10', 'gwei'),
  //The gwei amount the script will add to try to get prioritized
  GAS_PRIORITY_BONUS: ethers.utils.parseUnits('1', 'gwei'),
  //True if testing script locally
  DEBUG: true,
}

//GLOBALS
const MINES_REQ_BASE = 'https://idle-api.crabada.com/public/idle/mines'
const MINES_REQ_ARGS = [
  'can_loot=1',
  'looter_address=' + SETTINGS.USER_ADDRESS,
]
export const GLOBALS = {
  GAME_ADDRESS: '0x82a85407bd612f52577909f4a58bfc6873f14da8',
  MINES_REQUEST: MINES_REQ_BASE + '?' + MINES_REQ_ARGS.join('&'),
  GASLIMIT: 300000,
}
