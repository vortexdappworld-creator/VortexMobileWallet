import { memo, useCallback, useEffect } from 'react';

import { useIntl } from 'react-intl';

import { Button, Illustration, SizableText, YStack } from '@onekeyhq/components';
import { useBackUpWallet } from '@onekeyhq/kit/src/hooks/useBackUpWallet';
import { useAccountOverviewActions } from '@onekeyhq/kit/src/states/jotai/contexts/accountOverview';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import {
  EAppEventBusNames,
  appEventBus,
} from '@onekeyhq/shared/src/eventBus/appEventBus';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { EHomeTab } from '@onekeyhq/shared/types';

// Vortex demo: cloud backup (Google Drive / iCloud) and alternative methods
// (OneKey Lite, OneKey KeyTag) hidden. Only manual recovery-phrase backup is
// offered, so the "More backup options" sheet is gone too.
function NotBackedUp() {
  const intl = useIntl();
  const {
    activeAccount: { wallet, account, network },
  } = useActiveAccount({
    num: 0,
  });

  const { updateAccountOverviewState } = useAccountOverviewActions().current;

  const { handleBackUpByPhrase } = useBackUpWallet({
    walletId: wallet?.id ?? '',
  });

  const handlePrimaryBackup = useCallback(() => {
    void handleBackUpByPhrase();
  }, [handleBackUpByPhrase]);

  useEffect(() => {
    updateAccountOverviewState({
      isRefreshing: false,
      initialized: true,
    });
    appEventBus.emit(EAppEventBusNames.TabListStateUpdate, {
      isRefreshing: false,
      type: EHomeTab.ALL,
      accountId: account?.id ?? '',
      networkId: network?.id ?? '',
    });
  }, [account?.id, network?.id, updateAccountOverviewState]);

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      mx="$5"
      py="$10"
      $gtMd={{
        py: '$20',
      }}
      borderTopWidth={1}
      borderTopColor="$neutral3"
    >
      <Illustration name="WalletBackup" ml="$-1" size={180} />

      {/* Title + description */}
      <YStack gap="$2" alignItems="center" mb="$12">
        <SizableText size="$heading2xl" textAlign="center">
          {intl.formatMessage({ id: ETranslations.wallet_backup_prompt })}
        </SizableText>
        <SizableText size="$bodyLg" color="$textSubdued" textAlign="center">
          {intl.formatMessage({ id: ETranslations.wallet_no_backup_desc })}
        </SizableText>
      </YStack>

      <YStack gap="$4" w="100%" $gtMd={{ w: 280 }}>
        <Button
          variant="primary"
          size="large"
          onPress={handlePrimaryBackup}
          testID="home-not-backed-up-primary-backup"
        >
          {intl.formatMessage({ id: ETranslations.manual_backup })}
        </Button>
      </YStack>
    </YStack>
  );
}

export default memo(NotBackedUp);
