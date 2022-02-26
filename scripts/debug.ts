import { ethers, network } from 'hardhat'
import { updateFeeData } from './utils'
import { SETTINGS } from './constants'

//Update fork to test locally
export async function updateFork() {
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

//Impersonate to test locally
export async function impersonateUser() {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [SETTINGS.USER_ADDRESS],
  });
}
