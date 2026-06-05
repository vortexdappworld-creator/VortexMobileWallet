import { useCallback } from 'react';

import { useSignatureConfirm } from '@onekeyhq/kit/src/hooks/useSignatureConfirm';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';

import { VORTEX_NETWORK_ID } from '../lib/config';

import type { EncodedTx } from '../lib/txBuilders';
import type { IEncodedTxEvm } from '@onekeyhq/core/src/chains/evm/types';
import type { ISendTxOnSuccessData } from '@onekeyhq/shared/types/tx';

export type VortexSendOpts = {
  onSuccess?: (txid: string) => void;
  onFail?: (e: Error) => void;
};

export function useVortexSend() {
  const { activeAccount } = useActiveAccount({ num: 0 });
  const accountId = activeAccount?.account?.id ?? '';
  const fromAddress = activeAccount?.account?.address ?? '';
  const { navigationToTxConfirm } = useSignatureConfirm({
    accountId,
    networkId: VORTEX_NETWORK_ID,
  });

  return useCallback(
    async (tx: EncodedTx, opts?: VortexSendOpts) => {
      if (!accountId || !fromAddress) {
        opts?.onFail?.(new Error('No active OneKey account selected'));
        return;
      }
      const encodedTx: IEncodedTxEvm = {
        from: fromAddress,
        to: tx.to,
        value: tx.value,
        data: tx.data,
      };
      await navigationToTxConfirm({
        encodedTx,
        onSuccess: (data: ISendTxOnSuccessData[]) => {
          const txid = data[0]?.signedTx?.txid ?? '';
          opts?.onSuccess?.(txid);
        },
        onFail: opts?.onFail,
      });
    },
    [accountId, fromAddress, navigationToTxConfirm],
  );
}
