import { ETabVortexRoutes } from '@onekeyhq/shared/src/routes/tabVortex';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import type { ITabSubNavigatorConfig } from '@onekeyhq/components';

import { LazyLoadRootTabPage } from '../../../components/LazyLoadPage';
import { withVortexAccount } from '../../../views/Vortex/components/withVortexAccount';
import Claim from '../../../views/Vortex/pages/Claim';
import Deposit from '../../../views/Vortex/pages/Deposit';
import NetworkTree from '../../../views/Vortex/pages/NetworkTree';
import Referrals from '../../../views/Vortex/pages/Referrals';
import Register from '../../../views/Vortex/pages/Register';
import Swap from '../../../views/Vortex/pages/Swap';

const Vortex = LazyLoadRootTabPage(
  () => import(/* webpackPrefetch: true */ '../../../views/Vortex'),
);

export const vortexRouters: ITabSubNavigatorConfig<any, any>[] = [
  {
    name: ETabVortexRoutes.TabVortex,
    component: Vortex,
    rewrite: '/',
    headerShown: !platformEnv.isNative,
  },
  {
    name: ETabVortexRoutes.VortexRegister,
    component: withVortexAccount(Register),
    rewrite: '/register',
    headerShown: true,
  },
  {
    name: ETabVortexRoutes.VortexDeposit,
    component: withVortexAccount(Deposit),
    rewrite: '/deposit',
    headerShown: true,
  },
  {
    name: ETabVortexRoutes.VortexClaim,
    component: withVortexAccount(Claim),
    rewrite: '/claim',
    headerShown: true,
  },
  {
    name: ETabVortexRoutes.VortexReferrals,
    component: withVortexAccount(Referrals),
    rewrite: '/referrals',
    headerShown: true,
  },
  {
    name: ETabVortexRoutes.VortexNetwork,
    component: withVortexAccount(NetworkTree),
    rewrite: '/network',
    headerShown: true,
  },
  {
    name: ETabVortexRoutes.VortexSwap,
    component: withVortexAccount(Swap),
    rewrite: '/swap',
    headerShown: true,
  },
];
