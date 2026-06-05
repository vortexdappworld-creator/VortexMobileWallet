import { createPublicClient, fallback, http } from 'viem';
import { bsc } from 'viem/chains';

import { BSC_RPCS } from './config';

export const publicClient = createPublicClient({
  chain: bsc,
  transport: fallback(BSC_RPCS.map((url) => http(url))),
});
