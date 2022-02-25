import { network } from 'hardhat';
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { customFormatUnits, getGasUsed } from './utils';
import fetch from 'node-fetch';

// SETTINGS
const FACTION_ADVANTAGES = ['ORE', 'FAERIES'] // The factions your team has an advantage against
const USER_TEAM_ID = '6313' // The team you are looting with
const USER_ADDRESS = '0x49806e26a35537769A6800d0f6631114F8703d7A' // Your address
const MAX_GAS_PRICE = ethers.utils.parseUnits('100', 'gwei') // If the gwei gets higher than this, the script will not run
const MAX_GAS_PRIORITY = ethers.utils.parseUnits('10', 'gwei') // If the gwei *priority* gets higher than this, the script will not run
const GAS_PRIORITY_BONUS = ethers.utils.parseUnits('1', 'gwei') // The gwei amount the script will add to try to get prioritized

// GLOBALS
const GAME_ADDRESS = '0x82a85407bd612f52577909f4a58bfc6873f14da8'
const MINES_REQ_BASE = 'https://idle-api.crabada.com/public/idle/mines'
const MINES_REQ_ARGS = [
  'can_loot=1',
  'looter_address=' + USER_ADDRESS,
]
const MINES_REQUEST = MINES_REQ_BASE + '?' + MINES_REQ_ARGS.join('&')
const gasLimit = 300000
let contract: Contract
let fee_data

//Update "gasPrice" and exit if it is too high
async function updateFeeData() {
  fee_data = await ethers.provider.getFeeData()
  // console.log('gasPrice:', ethers.utils.formatUnits(fee_data.gasPrice, 'gwei'))
  // console.log('maxFeePerGas:', ethers.utils.formatUnits(fee_data.maxFeePerGas, 'gwei'))
  // console.log('maxPriorityFeePerGas:', ethers.utils.formatUnits(fee_data.maxPriorityFeePerGas, 'gwei'))
  if (fee_data.gasPrice.gt(MAX_GAS_PRICE)) {
    console.log('Gas price too high! (', customFormatUnits(fee_data.gasPrice, 'gwei', 2), 'gwei)')
    process.exit(1)
  }
  else if ((fee_data.maxPriorityFeePerGas.add(GAS_PRIORITY_BONUS)).gt(MAX_GAS_PRIORITY)) {
    console.log('Gas priority too high! (', customFormatUnits(fee_data.maxPriorityFeePerGas.add(GAS_PRIORITY_BONUS), 'gwei', 2), 'gwei)')
    process.exit(1)
  }
}

//Impersonate to test locally
async function impersonateUser() {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [USER_ADDRESS],
  });
}

//Update fork to test locally
async function updateFork() {
  const hardhat_latest_block = (await ethers.provider.getBlockNumber())
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        chainId: 43114,
        forking: {
          jsonRpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
          blockNumber: hardhat_latest_block,
        },
      },
    ],
  });
  await updateFeeData()
}

//Try to loot a mine
async function attackMine(game_id: string): Promise<Boolean> {
  // await updateFork()
  // await impersonateUser()
  try {
    const signer = await ethers.getSigner(USER_ADDRESS)
    const tx = await contract.connect(signer).attack(
      parseInt(game_id),
      USER_TEAM_ID,
      {
        // gasPrice: fee_data.gasPrice,
        gasLimit: gasLimit,
        maxFeePerGas: fee_data.maxFeePerGas,
        maxPriorityFeePerGas: fee_data.maxPriorityFeePerGas.add(GAS_PRIORITY_BONUS),
      }
    )
    const receipt = await tx.wait()
    getGasUsed(receipt)
    console.log('Attacked!')
    return true
  } catch (e) {
    if (e.message.includes('GAME:')) console.log(e.message)
    else console.log(e)
    return false
  }
}

//Test all mines for looting
//Returns true if looted, else false
async function loopMines(result): Promise<Boolean> {
  let mine: number = result.data.length - 1;
  if (mine >= 0) console.log('-----\nChecking', mine + 1, 'mines...')
  while (mine >= 0) {
    if (FACTION_ADVANTAGES.includes(result.data[mine].faction)) {
      // console.log('Type advantage!')
      // console.log('Mine defense_point:', result.data[mine].defense_point)
      if (await attackMine(result.data[mine].game_id)) return true
    }
    --mine
  }
  return false
}

//Loop Crabada's API to get ongoing Mines to try to loot them asap
async function getCurrentMines() {
  let response, first_json_response, json_response
  let first_request: boolean = true

  response = await fetch(MINES_REQUEST)
  first_json_response = await response.json()
  first_json_response = JSON.stringify(first_json_response)
  while (true) {
    await updateFeeData()
    response = await fetch(MINES_REQUEST)
    json_response = await response.json()
    if (first_request && first_json_response == JSON.stringify(json_response)) first_request = false
    else {
      if (json_response.error_code) {
        console.log('ERROR CODE:', json_response.error_code)
        console.log('ERROR MESSAGE:', json_response.message)
        return
      }
      if (await loopMines(json_response.result)) return
    }
  }
}

async function main() {
  await updateFeeData()
  console.log('Current gas price:', parseFloat(ethers.utils.formatUnits(fee_data.gasPrice, 'gwei')).toFixed(2))
  contract = await ethers.getContractAt('Crabada', GAME_ADDRESS)
  console.log('Connected to Crabada contract at:', contract.address)
  await getCurrentMines()
}

main()
.then(() => process.exit(0))
.catch(e => {
  console.error(e)
  process.exit(1)
})
