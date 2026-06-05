import { encodeFunctionData, maxUint256 } from 'viem';

import type { Address, Hex } from 'viem';

import { ERC20_ABI } from './abi/erc20';
import { PANCAKE_V2_ROUTER_ABI } from './abi/pancakeRouter';
import { VORTEX_ABI } from './abi/vortex';
import {
  PANCAKE_V2_ROUTER,
  USDT_ADDRESS,
  VORTEX_CONTRACT_ADDRESS,
} from './config';

export type EncodedTx = { to: Address; data: Hex; value: Hex };

const ZERO: Hex = '0x0';

export function buildRegister(referrer: Address): EncodedTx {
  return {
    to: VORTEX_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: VORTEX_ABI,
      functionName: 'register',
      args: [referrer],
    }),
    value: ZERO,
  };
}

export function buildDeposit(amount: bigint): EncodedTx {
  return {
    to: VORTEX_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: VORTEX_ABI,
      functionName: 'deposit',
      args: [amount],
    }),
    value: ZERO,
  };
}

export function buildClaimRoi(): EncodedTx {
  return {
    to: VORTEX_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: VORTEX_ABI,
      functionName: 'claimRoi',
      args: [],
    }),
    value: ZERO,
  };
}

export function buildClaimMatching(): EncodedTx {
  return {
    to: VORTEX_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: VORTEX_ABI,
      functionName: 'claimMatchingBonus',
      args: [],
    }),
    value: ZERO,
  };
}

export function buildClaimReferral(): EncodedTx {
  return {
    to: VORTEX_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: VORTEX_ABI,
      functionName: 'claimReferralBonus',
      args: [],
    }),
    value: ZERO,
  };
}

export function buildApproveUsdt(amount: bigint = maxUint256): EncodedTx {
  return {
    to: USDT_ADDRESS,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [VORTEX_CONTRACT_ADDRESS, amount],
    }),
    value: ZERO,
  };
}

export function buildApprovePancake(
  token: Address,
  amount: bigint = maxUint256,
): EncodedTx {
  return {
    to: token,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PANCAKE_V2_ROUTER, amount],
    }),
    value: ZERO,
  };
}

export function buildSwapExactTokensForTokens(
  amountIn: bigint,
  amountOutMin: bigint,
  path: readonly Address[],
  to: Address,
  deadline: bigint,
): EncodedTx {
  return {
    to: PANCAKE_V2_ROUTER,
    data: encodeFunctionData({
      abi: PANCAKE_V2_ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, path as readonly `0x${string}`[], to, deadline],
    }),
    value: ZERO,
  };
}

export function buildSwapExactEthForTokens(
  amountIn: bigint,
  amountOutMin: bigint,
  path: readonly Address[],
  to: Address,
  deadline: bigint,
): EncodedTx {
  return {
    to: PANCAKE_V2_ROUTER,
    data: encodeFunctionData({
      abi: PANCAKE_V2_ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [amountOutMin, path as readonly `0x${string}`[], to, deadline],
    }),
    value: `0x${amountIn.toString(16)}` as Hex,
  };
}

export function buildSwapExactTokensForEth(
  amountIn: bigint,
  amountOutMin: bigint,
  path: readonly Address[],
  to: Address,
  deadline: bigint,
): EncodedTx {
  return {
    to: PANCAKE_V2_ROUTER,
    data: encodeFunctionData({
      abi: PANCAKE_V2_ROUTER_ABI,
      functionName: 'swapExactTokensForETH',
      args: [amountIn, amountOutMin, path as readonly `0x${string}`[], to, deadline],
    }),
    value: ZERO,
  };
}
