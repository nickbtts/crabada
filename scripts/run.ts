//Libraries
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import fetch from 'node-fetch'
//Modules
import { SETTINGS, GLOBALS } from './constants'
import { customFormatUnits, fee_data, updateFeeData, getGasUsed } from './utils'
import { chooseStrat } from './strategies'
import { updateFork, impersonateUser } from './debug'

//Try to loot a mine
export async function attackMine(game_id: string): Promise<Boolean> {
  if (SETTINGS.DEBUG) {
    await updateFork()
    await impersonateUser()
  }
  try {
    const signer = await ethers.getSigner(SETTINGS.USER_ADDRESS)
    const tx = await contract.connect(signer).attack(
      parseInt(game_id),
      SETTINGS.USER_TEAM_ID,
      {
        // gasPrice: fee_data.gasPrice,
        gasLimit: GLOBALS.GASLIMIT,
        maxFeePerGas: fee_data.maxFeePerGas,
        maxPriorityFeePerGas: fee_data.maxPriorityFeePerGas.add(SETTINGS.GAS_PRIORITY_BONUS),
      }
    )
    const receipt = await tx.wait()
    getGasUsed(receipt)
    console.log('Attacked!')
    return true
  } catch (e) {
    if (e.message.includes('GAME:')) console.log('\x1b[31m', e.message, '\x1b[0m')
    else console.log(e)
    return false
  }
}

//Loop Crabada's API to get ongoing Mines to try to loot them
async function getCurrentMines() {
  let response, first_json_response, json_response
  let first_request: boolean = true

  response = await fetch(GLOBALS.MINES_REQUEST)
  first_json_response = await response.json()
  first_json_response = JSON.stringify(first_json_response)
  while (true) {
    const time = Date.now()
    await updateFeeData()
    response = await fetch(GLOBALS.MINES_REQUEST)
    json_response = await response.json()
    if (first_request && first_json_response == JSON.stringify(json_response)) first_request = false
    else {
      if (json_response.error_code) {
        console.log('ERROR CODE:', json_response.error_code)
        console.log('ERROR MESSAGE:', json_response.message)
        return
      }
      else if (await chooseStrat(json_response.result)) return
    }
    // Delay next API call
    await new Promise(resolve => setTimeout(resolve, Math.max(SETTINGS.API_DELAY - (Date.now() - time), 0)));
  }
}

let contract: Contract

async function main() {
  await updateFeeData()
  console.log('AVAX balance:', customFormatUnits(await ethers.provider.getBalance(SETTINGS.USER_ADDRESS), 'ether', 2))
  console.log('Current gas price (gwei):', parseFloat(ethers.utils.formatUnits(fee_data.gasPrice, 'gwei')).toFixed(2))
  contract = await ethers.getContractAt('Crabada', GLOBALS.GAME_ADDRESS)
  console.log('Connected to Crabada contract at:', contract.address)
  await getCurrentMines()
}

main()
.then(() => process.exit(0))
.catch(e => {
  console.error(e)
  process.exit(1)
})
