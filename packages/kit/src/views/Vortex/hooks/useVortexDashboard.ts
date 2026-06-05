import { useMemo } from 'react';

import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';

import { readDashboard } from '../lib/reads';

import type { VortexDashboard } from '../lib/reads';
import type { Address } from 'viem';

export function useVortexDashboard(): {
  data: VortexDashboard | undefined;
  isLoading: boolean;
  reload: () => void;
  address: Address | undefined;
} {
  const { activeAccount } = useActiveAccount({ num: 0 });
  const address = activeAccount?.account?.address as Address | undefined;

  const res = usePromiseResult(
    async () => {
      if (!address) return undefined;
      return readDashboard(address);
    },
    [address],
    { watchLoading: true, pollingInterval: 15_000 },
  );

  return useMemo(
    () => ({
      data: res.result,
      isLoading: !!res.isLoading,
      reload: res.run,
      address,
    }),
    [res, address],
  );
}
