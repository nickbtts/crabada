import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { TransactionReceipt } from 'ethers/node_modules/@ethersproject/abstract-provider';
import { SETTINGS } from './constants'

export let fee_data

//Returns gas used in a transaction
export async function getGasUsed(receipt: TransactionReceipt) {
  console.log(receipt.gasUsed.toString(), 'gas used')
}

export function customFormatUnits(toConvert: BigNumber, unit: string, precision: number): string {
  return parseFloat(ethers.utils.formatUnits(toConvert, unit)).toFixed(precision)
}

//Update "gasPrice" and exit if it is too high
export async function updateFeeData() {
  fee_data = await ethers.provider.getFeeData()
  if (fee_data.gasPrice.gt(SETTINGS.MAX_GAS_PRICE)) {
    console.log('Gas price too high! (', customFormatUnits(fee_data.gasPrice, 'gwei', 2), 'gwei)')
    process.exit(1)
  }
  else if ((fee_data.maxPriorityFeePerGas.add(SETTINGS.GAS_PRIORITY_BONUS)).gt(SETTINGS.MAX_GAS_PRIORITY)) {
    console.log('Gas priority too high! (', customFormatUnits(fee_data.maxPriorityFeePerGas.add(SETTINGS.GAS_PRIORITY_BONUS), 'gwei', 2), 'gwei)')
    process.exit(1)
  }
}
