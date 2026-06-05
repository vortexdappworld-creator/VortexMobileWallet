import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import { Stack } from '@onekeyhq/components';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { EEnterMethod } from '@onekeyhq/shared/src/logger/scopes/discovery/scenes/dapp';
import type { IDApp } from '@onekeyhq/shared/types/discovery';

import { useWebSiteHandler } from '../../hooks/useWebSiteHandler';
import { DiscoveryTestIDs } from '../../testIDs';

import { DashboardSectionHeader } from './DashboardSectionHeader';
import { TrendingSectionItems } from './TrendingSectionItems';
import { VORTEX_BSCSCAN_TRENDING_ENTRY } from './_vortexBscscanEntry';
import { VORTEX_HOMEPAGE_TRENDING_ENTRY } from './_vortexHomepageEntry';

// BscScan tile points directly at our deployed Vortex contract, not the
// generic explorer homepage, so a tap lands the user on the right address.
const VORTEX_CONTRACT_ADDRESS = '0x729f8f6a6970cfc7acae555236a20751c1501f39';
const VORTEX_BSCSCAN_ENTRY_FOR_CONTRACT = {
  ...VORTEX_BSCSCAN_TRENDING_ENTRY,
  url: `https://bscscan.com/address/${VORTEX_CONTRACT_ADDRESS}`,
  description: 'Vortex contract on BscScan',
};

import type { IMatchDAppItemType } from '../../types';

interface ITrendingSectionProps {
  data: IDApp[];
  isLoading: boolean;
}

export function TrendingSection({
  data = [],
  isLoading = false,
}: ITrendingSectionProps) {
  const intl = useIntl();
  const handleWebSite = useWebSiteHandler();
  // Vortex demo: strip "OneKey Perps" and BenPay from the upstream trending
  // feed, then prepend the Vortex homepage and the Vortex-contract BscScan
  // tile so the customer's links sit at the top of Discover.
  const dataSource = useMemo<IDApp[]>(() => {
    const filtered = (data ?? []).filter((d) => {
      const name = (d.name ?? '').toLowerCase();
      const url = (d.url ?? '').toLowerCase();
      if (name === 'onekey perps' || url.includes('perp.onekey')) return false;
      if (name === 'benpay' || url.includes('benpay')) return false;
      return true;
    });
    return [
      VORTEX_HOMEPAGE_TRENDING_ENTRY,
      VORTEX_BSCSCAN_ENTRY_FOR_CONTRACT,
      ...filtered,
    ];
  }, [data]);

  const handleOpenWebSite = useCallback(
    ({ dApp, webSite }: IMatchDAppItemType) => {
      handleWebSite({
        webSite,
        dApp,
        enterMethod: EEnterMethod.trending,
      });
    },
    [handleWebSite],
  );

  return (
    <Stack minHeight="$40" testID={DiscoveryTestIDs.trendingSection}>
      <DashboardSectionHeader>
        <DashboardSectionHeader.Heading selected>
          {intl.formatMessage({
            id: ETranslations.market_trending,
          })}
        </DashboardSectionHeader.Heading>
      </DashboardSectionHeader>

      <TrendingSectionItems
        isLoading={isLoading}
        dataSource={dataSource}
        handleOpenWebSite={handleOpenWebSite}
      />
    </Stack>
  );
}
