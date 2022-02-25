import { TransactionReceipt } from 'ethers/node_modules/@ethersproject/abstract-provider';

//Returns gas used in a transaction
export async function getGasUsed(receipt: TransactionReceipt) {
  console.log(receipt.gasUsed.toString(), 'gas used')
}
