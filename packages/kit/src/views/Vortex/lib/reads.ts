import { readContract } from 'viem/actions';

import type { Address } from 'viem';

import { ERC20_ABI } from './abi/erc20';
import { VORTEX_ABI } from './abi/vortex';
import { publicClient } from './client';
import { USDT_ADDRESS, VORTEX_CONTRACT_ADDRESS } from './config';

export function formatUsdt(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = wei % 10n ** 18n;
  const fracRounded = (frac + 5n * 10n ** 13n) / 10n ** 14n;
  if (fracRounded >= 10_000n) {
    return `${whole + 1n}.0000`;
  }
  return `${whole}.${fracRounded.toString().padStart(4, '0')}`;
}

export function safeBigInt(input: string, decimals: number): bigint {
  if (!input) return 0n;
  if (!/^\d+(?:\.\d*)?$/.test(input)) return 0n;
  const [whole, frac = ''] = input.split('.');
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(padded || '0');
}

// Daily ROI rate is returned in basis points (e.g. 75n => 0.75%).
export function formatRateBps(bps: bigint): string {
  const value = Number(bps) / 100;
  return `${value.toFixed(2)}%`;
}

export type VortexDeposit = {
  amount: bigint;
  startTime: bigint;
  lastClaimTime: bigint;
  roiPaid: bigint;
  active: boolean;
  granted: boolean;
};

export type VortexDashboard = {
  isRegistered: boolean;
  referrer: Address;
  todayRate: bigint;
  pendingRoi: bigint;
  matchingBonus: bigint;
  referralBonus: bigint;
  totalRoiClaimed: bigint;
  totalMatchingClaimed: bigint;
  totalReferralClaimed: bigint;
  totalDeposited: bigint;
  rank: number;
  ownDeposit: bigint;
  bigLeg: bigint;
  smallLeg: bigint;
  depositCount: number;
  deposits: VortexDeposit[];
  usdtBalance: bigint;
  usdtAllowance: bigint;
};

export async function readDashboard(addr: Address): Promise<VortexDashboard> {
  const c = { address: VORTEX_CONTRACT_ADDRESS, abi: VORTEX_ABI } as const;
  const [
    isRegistered,
    referrer,
    todayRate,
    pendingRoi,
    matchingBonus,
    referralBonus,
    totalRoiClaimed,
    totalMatchingClaimed,
    totalReferralClaimed,
    totalDeposited,
    rankRes,
    depositCount,
    depositsRaw,
    usdtBalance,
    usdtAllowance,
  ] = await Promise.all([
    readContract(publicClient, { ...c, functionName: 'isRegistered', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'referrer', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'todayRate', args: [] }),
    readContract(publicClient, { ...c, functionName: 'pendingRoi', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'matchingBonus', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'referralBonus', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'totalRoiClaimed', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'totalMatchingClaimed', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'totalReferralClaimed', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'totalDeposited', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'viewUserRank', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'depositCount', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'getUserDeposits', args: [addr] }),
    readContract(publicClient, {
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [addr],
    }),
    readContract(publicClient, {
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [addr, VORTEX_CONTRACT_ADDRESS],
    }),
  ]);
  const rankTuple = rankRes as readonly unknown[];
  const rank = Number(rankTuple[0]);
  const ownDeposit = (rankTuple[1] as bigint) ?? 0n;
  const bigLeg = (rankTuple[2] as bigint) ?? 0n;
  const smallLeg = (rankTuple[3] as bigint) ?? 0n;
  const deposits = ((depositsRaw as readonly unknown[]) ?? []).map((d) => {
    const r = d as any;
    return {
      amount: (r.amount ?? r[0] ?? 0n) as bigint,
      startTime: (r.startTime ?? r[1] ?? 0n) as bigint,
      lastClaimTime: (r.lastClaimTime ?? r[2] ?? 0n) as bigint,
      roiPaid: (r.roiPaid ?? r[3] ?? 0n) as bigint,
      active: Boolean(r.active ?? r[4] ?? false),
      granted: Boolean(r.granted ?? r[5] ?? false),
    } as VortexDeposit;
  });
  return {
    isRegistered: Boolean(isRegistered),
    referrer: referrer as Address,
    todayRate: todayRate as bigint,
    pendingRoi: pendingRoi as bigint,
    matchingBonus: matchingBonus as bigint,
    referralBonus: referralBonus as bigint,
    totalRoiClaimed: totalRoiClaimed as bigint,
    totalMatchingClaimed: totalMatchingClaimed as bigint,
    totalReferralClaimed: totalReferralClaimed as bigint,
    totalDeposited: totalDeposited as bigint,
    rank,
    ownDeposit,
    bigLeg,
    smallLeg,
    depositCount: Number(depositCount as bigint),
    deposits,
    usdtBalance: usdtBalance as bigint,
    usdtAllowance: usdtAllowance as bigint,
  };
}

export async function readDirectReferrals(addr: Address): Promise<Address[]> {
  const result = await readContract(publicClient, {
    address: VORTEX_CONTRACT_ADDRESS,
    abi: VORTEX_ABI,
    functionName: 'getDirectReferrals',
    args: [addr],
  });
  return result as Address[];
}

export type VortexTreeNode = {
  address: Address;
  rank: number;
  deposit: bigint;
  teamVolume: bigint;
  children: Address[];
};

export async function readTreeNode(addr: Address): Promise<VortexTreeNode> {
  const c = { address: VORTEX_CONTRACT_ADDRESS, abi: VORTEX_ABI } as const;
  const [rankRes, refs, vol] = await Promise.all([
    readContract(publicClient, { ...c, functionName: 'viewUserRank', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'getDirectReferrals', args: [addr] }),
    readContract(publicClient, { ...c, functionName: 'teamVolume', args: [addr] }),
  ]);
  const rt = rankRes as readonly unknown[];
  return {
    address: addr,
    rank: Number(rt[0]),
    deposit: (rt[1] as bigint) ?? 0n,
    teamVolume: (vol as bigint) ?? 0n,
    children: (refs as Address[]) ?? [],
  };
}

export async function readTreeNodes(addrs: Address[]): Promise<VortexTreeNode[]> {
  if (addrs.length === 0) return [];
  return Promise.all(addrs.map((a) => readTreeNode(a)));
}
