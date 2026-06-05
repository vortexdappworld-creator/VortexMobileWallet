export enum ETabVortexRoutes {
  TabVortex = 'TabVortex',
  VortexDashboard = 'VortexDashboard',
  VortexRegister = 'VortexRegister',
  VortexDeposit = 'VortexDeposit',
  VortexClaim = 'VortexClaim',
  VortexReferrals = 'VortexReferrals',
  VortexNetwork = 'VortexNetwork',
  VortexSwap = 'VortexSwap',
}

export type ITabVortexParamList = {
  [ETabVortexRoutes.TabVortex]: undefined;
  [ETabVortexRoutes.VortexDashboard]: undefined;
  [ETabVortexRoutes.VortexRegister]: { referrer?: string } | undefined;
  [ETabVortexRoutes.VortexDeposit]: undefined;
  [ETabVortexRoutes.VortexClaim]: undefined;
  [ETabVortexRoutes.VortexReferrals]: undefined;
  [ETabVortexRoutes.VortexNetwork]: undefined;
  [ETabVortexRoutes.VortexSwap]: undefined;
};
