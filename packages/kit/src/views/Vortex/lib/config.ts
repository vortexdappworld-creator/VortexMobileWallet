import type { Address } from 'viem';

export const VORTEX_NETWORK_ID = 'evm--56' as const;

export const VORTEX_CONTRACT_ADDRESS: Address =
  '0x729f8f6a6970cfc7acae555236a20751c1501f39';

export const USDT_ADDRESS: Address =
  '0x55d398326f99059fF775485246999027B3197955';

export const PANCAKE_V2_ROUTER: Address =
  '0x10ED43C718714eb63d5aA57B78B54704E256024E';

export const WBNB_ADDRESS: Address =
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

export const BSC_RPCS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-rpc.publicnode.com',
] as const;

export const DEFAULT_SLIPPAGE_BPS = 50;
export const SWAP_DEADLINE_SECONDS = 60 * 10;

export type SwapToken = {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  isNative?: boolean;
  /** Trustwallet CDN logo URL (same source as the web frontend). */
  logo: string;
};

const TW_BSC = (addr: string) =>
  `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/smartchain/assets/${addr}/logo.png`;
const BNB_LOGO =
  'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/binance/info/logo.png';

// Mirrors the web frontend's swap catalog in `frontend/src/config/swap.ts`.
export const SWAP_TOKENS: SwapToken[] = [
  {
    symbol: 'BNB',
    name: 'BNB',
    address: WBNB_ADDRESS,
    decimals: 18,
    isNative: true,
    logo: BNB_LOGO,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: USDT_ADDRESS,
    decimals: 18,
    logo: TW_BSC('0x55d398326f99059fF775485246999027B3197955'),
  },
  {
    symbol: 'BTCB',
    name: 'Bitcoin BEP20',
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18,
    logo: TW_BSC('0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum Token',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    logo: TW_BSC('0x2170Ed0880ac9A755fd29B2688956BD959F933F8'),
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    address: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF',
    decimals: 18,
    logo: TW_BSC('0x570A5D26f7765Ecb712C0924E4De545B89fD43dF'),
  },
  {
    symbol: 'XRP',
    name: 'XRP Token',
    address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
    decimals: 18,
    logo: TW_BSC('0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE'),
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    decimals: 8,
    logo: TW_BSC('0xbA2aE424d960c26247Dd6c32edC70B295c744C43'),
  },
];
