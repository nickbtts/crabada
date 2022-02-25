import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { TransactionReceipt } from 'ethers/node_modules/@ethersproject/abstract-provider';

//Returns gas used in a transaction
export async function getGasUsed(receipt: TransactionReceipt) {
  console.log(receipt.gasUsed.toString(), 'gas used')
}

export function customFormatUnits(toConvert: BigNumber, unit: string, precision: number): string {
  return parseFloat(ethers.utils.formatUnits(toConvert, unit)).toFixed(precision)
}
