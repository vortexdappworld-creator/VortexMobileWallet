import type { ComponentProps } from 'react';

import { useIntl } from 'react-intl';

import type { IKeyOfIcons } from '@onekeyhq/components';
import { ActionList } from '@onekeyhq/components';
import type { IDBWallet } from '@onekeyhq/kit-bg/src/dbs/local/types';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import platformEnv from '@onekeyhq/shared/src/platformEnv';
import accountUtils from '@onekeyhq/shared/src/utils/accountUtils';

import { useBackUpWallet } from '../../hooks/useBackUpWallet';

export function WalletBackupActions({
  wallet,
  children,
  onSelected,
  actionListProps,
  onClose,
  hideLiteCard: _ignoredHideLiteCard,
  hideKeyTag: _ignoredHideKeyTag,
  hidePhrase,
  hideCloud: _ignoredHideCloud,
}: // Vortex demo: hideLiteCard / hideKeyTag / hideCloud prop values are
// ignored; Lite, KeyTag, and the cloud (Google Drive / iCloud) options are
// unconditionally stripped from the actions sheet below.
{
  wallet: IDBWallet | undefined;
  children: React.ReactNode;
  onSelected?: () => void;
  onClose?: () => void;
  actionListProps?: Partial<ComponentProps<typeof ActionList>>;
  hideLiteCard?: boolean;
  hideKeyTag?: boolean;
  hidePhrase?: boolean;
  hideCloud?: boolean;
}) {
  const intl = useIntl();

  const {
    handleBackUpByPhrase,
    handleBackUpByCloud,
    supportCloudBackup,
    cloudBackupFeatureInfo,
  } = useBackUpWallet({ walletId: wallet?.id ?? '' });

  return (
    <ActionList
      title={intl.formatMessage({ id: ETranslations.global_backup })}
      items={[
        // Vortex demo: cloud backup (Google Drive / iCloud) option removed.
        undefined,
        !hidePhrase && {
          label: intl.formatMessage({
            id: ETranslations.manual_backup,
          }),
          icon: 'SignatureOutline' as IKeyOfIcons,
          onPress: () => {
            void handleBackUpByPhrase();
            onSelected?.();
          },
          onClose,
        },
        // Vortex demo: OneKey Lite and OneKey KeyTag backup options removed.
      ].filter(Boolean)}
      renderTrigger={children}
      {...actionListProps}
    />
  );
}
