import { getBalance, readContract } from 'viem/actions';

import type { Address } from 'viem';

import { ERC20_ABI } from './abi/erc20';
import { PANCAKE_V2_ROUTER_ABI } from './abi/pancakeRouter';
import { publicClient } from './client';
import {
  DEFAULT_SLIPPAGE_BPS,
  PANCAKE_V2_ROUTER,
  WBNB_ADDRESS,
} from './config';

import type { SwapToken } from './config';

/** Read the user's balance for a swap token (native BNB or BEP20). */
export async function getTokenBalance(
  userAddress: Address,
  token: SwapToken,
): Promise<bigint> {
  if (token.isNative) {
    return getBalance(publicClient, { address: userAddress });
  }
  return (await readContract(publicClient, {
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  })) as bigint;
}

export function buildSwapPath(from: SwapToken, to: SwapToken): Address[] {
  const fromAddr = from.address;
  const toAddr = to.address;
  if (fromAddr.toLowerCase() === WBNB_ADDRESS.toLowerCase()) {
    return [WBNB_ADDRESS, toAddr];
  }
  if (toAddr.toLowerCase() === WBNB_ADDRESS.toLowerCase()) {
    return [fromAddr, WBNB_ADDRESS];
  }
  return [fromAddr, WBNB_ADDRESS, toAddr];
}

export async function getQuote(
  amountIn: bigint,
  from: SwapToken,
  to: SwapToken,
): Promise<bigint> {
  if (amountIn === 0n) return 0n;
  const path = buildSwapPath(from, to);
  const result = (await readContract(publicClient, {
    address: PANCAKE_V2_ROUTER,
    abi: PANCAKE_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountIn, path],
  })) as readonly bigint[];
  return result[result.length - 1];
}

export function applySlippage(
  amountOut: bigint,
  slippageBps: number = DEFAULT_SLIPPAGE_BPS,
): bigint {
  return (amountOut * BigInt(10_000 - slippageBps)) / 10_000n;
}
