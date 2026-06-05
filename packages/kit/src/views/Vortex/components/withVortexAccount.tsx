import { AccountSelectorProviderMirror } from '@onekeyhq/kit/src/components/AccountSelector';
import { EAccountSelectorSceneName } from '@onekeyhq/shared/types';

import type { ComponentType } from 'react';

export function VortexAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountSelectorProviderMirror
      config={{ sceneName: EAccountSelectorSceneName.home, sceneUrl: '' }}
      enabledNum={[0]}
    >
      {children}
    </AccountSelectorProviderMirror>
  );
}

export function withVortexAccount<P extends object>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P> {
  function VortexAccountWrapper(props: P) {
    return (
      <VortexAccountProvider>
        <WrappedComponent {...props} />
      </VortexAccountProvider>
    );
  }
  return VortexAccountWrapper;
}
