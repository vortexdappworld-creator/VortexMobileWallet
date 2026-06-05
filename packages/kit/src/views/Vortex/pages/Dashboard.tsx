import { useMemo, useState } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  Icon,
  Page,
  ScrollView,
  SizableText,
  Skeleton,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { ETabVortexRoutes } from '@onekeyhq/shared/src/routes/tabVortex';

import { useVortexDashboard } from '../hooks/useVortexDashboard';
import { formatRateBps, formatUsdt } from '../lib/reads';

import type { VortexDeposit } from '../lib/reads';
import type { IKeyOfIcons } from '@onekeyhq/components';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const DEPOSITS_VISIBLE = 3;

const RANK_NAMES = ['', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const;

const RANK_THRESHOLDS = [
  { own: 0n, big: 0n, small: 0n },
  { own: 0n, big: 0n, small: 0n },
  { own: 0n, big: 10_000n * 10n ** 18n, small: 5_000n * 10n ** 18n },
  { own: 500n * 10n ** 18n, big: 50_000n * 10n ** 18n, small: 25_000n * 10n ** 18n },
  { own: 1_000n * 10n ** 18n, big: 100_000n * 10n ** 18n, small: 50_000n * 10n ** 18n },
  { own: 3_000n * 10n ** 18n, big: 250_000n * 10n ** 18n, small: 125_000n * 10n ** 18n },
  { own: 5_000n * 10n ** 18n, big: 500_000n * 10n ** 18n, small: 250_000n * 10n ** 18n },
  { own: 10_000n * 10n ** 18n, big: 1_000_000n * 10n ** 18n, small: 500_000n * 10n ** 18n },
] as const;

function shortAddress(addr: string | undefined) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ActionTile({
  icon,
  label,
  onPress,
  highlighted,
}: {
  icon: IKeyOfIcons;
  label: string;
  onPress: () => void;
  highlighted?: boolean;
}) {
  return (
    <Stack
      flex={1}
      flexBasis={0}
      alignItems="center"
      justifyContent="center"
      bg={highlighted ? '$bgPrimary' : '$bgStrong'}
      borderRadius="$4"
      pt="$2.5"
      pb="$2"
      px="$1"
      userSelect="none"
      pressStyle={{
        bg: highlighted ? '$bgPrimaryActive' : '$bgStrongActive',
      }}
      onPress={onPress}
    >
      <Icon
        name={icon}
        size="$6"
        color={highlighted ? '$iconInverse' : '$icon'}
      />
      <SizableText
        my="$1"
        textAlign="center"
        size="$bodySm"
        color={highlighted ? '$textInverse' : '$text'}
      >
        {label}
      </SizableText>
    </Stack>
  );
}

function StatCard({
  label,
  value,
  suffix = 'USDT',
  icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  suffix?: string;
  icon?: IKeyOfIcons;
  tone?: 'default' | 'success';
}) {
  return (
    <YStack
      flex={1}
      flexBasis={0}
      bg="$bgSubdued"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderSubdued"
      p="$3.5"
      gap="$1"
    >
      <XStack gap="$2" alignItems="center">
        {icon ? <Icon name={icon} size="$4" color="$iconSubdued" /> : null}
        <SizableText size="$bodySm" color="$textSubdued" numberOfLines={1}>
          {label}
        </SizableText>
      </XStack>
      <XStack gap="$1.5" alignItems="baseline" flexWrap="wrap">
        <SizableText
          size="$headingLg"
          color={tone === 'success' ? '$textSuccess' : '$text'}
          numberOfLines={1}
        >
          {value}
        </SizableText>
        <SizableText size="$bodySm" color="$textSubdued">
          {suffix}
        </SizableText>
      </XStack>
    </YStack>
  );
}

function ProgressBar({
  value,
  target,
}: {
  value: bigint;
  target: bigint;
}) {
  const pct =
    target === 0n
      ? 100
      : Math.min(
          100,
          Number((value * 1000n) / (target === 0n ? 1n : target)) / 10,
        );
  return (
    <Stack h={6} bg="$neutral4" borderRadius="$full" overflow="hidden">
      <Stack
        h={6}
        bg="$bgPrimary"
        borderRadius="$full"
        width={`${pct}%` as `${number}%`}
      />
    </Stack>
  );
}

function DashboardSkeleton() {
  return (
    <YStack p="$5" gap="$4">
      <Skeleton h={140} w="100%" borderRadius="$4" />
      <XStack gap="$3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={64} flex={1} borderRadius="$4" />
        ))}
      </XStack>
      <XStack gap="$3">
        <Skeleton h={88} flex={1} borderRadius="$3" />
        <Skeleton h={88} flex={1} borderRadius="$3" />
      </XStack>
      <XStack gap="$3">
        <Skeleton h={88} flex={1} borderRadius="$3" />
        <Skeleton h={88} flex={1} borderRadius="$3" />
      </XStack>
    </YStack>
  );
}

function shortDate(ts: bigint): string {
  if (ts === 0n) return '—';
  try {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function DepositRow({ d }: { d: VortexDeposit }) {
  const status = d.active
    ? { label: 'Active', tone: '$textSuccess' as const }
    : d.granted
    ? { label: 'Granted', tone: '$textInfo' as const }
    : { label: 'Closed', tone: '$textSubdued' as const };
  return (
    <YStack
      bg="$bgSubdued"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderSubdued"
      p="$3.5"
      gap="$1.5"
    >
      <XStack jc="space-between" ai="baseline">
        <XStack gap="$1.5" ai="baseline">
          <SizableText size="$bodyLgMedium">{formatUsdt(d.amount)}</SizableText>
          <SizableText size="$bodySm" color="$textSubdued">
            USDT
          </SizableText>
        </XStack>
        <SizableText size="$bodySmMedium" color={status.tone}>
          {status.label}
        </SizableText>
      </XStack>
      <XStack jc="space-between">
        <SizableText size="$bodySm" color="$textSubdued">
          Started
        </SizableText>
        <SizableText size="$bodySm">{shortDate(d.startTime)}</SizableText>
      </XStack>
      <XStack jc="space-between">
        <SizableText size="$bodySm" color="$textSubdued">
          Rewards paid
        </SizableText>
        <SizableText size="$bodySm">{formatUsdt(d.roiPaid)} USDT</SizableText>
      </XStack>
    </YStack>
  );
}

export default function Dashboard() {
  const nav = useAppNavigation();
  const { data, isLoading, reload, address } = useVortexDashboard();
  const [depositsExpanded, setDepositsExpanded] = useState(false);
  // Vortex tab has no native header (router sets headerShown=false on native),
  // so content would render under the status bar. Pad by safe-area top inset.
  const insets = useSafeAreaInsets();

  const totalPending = useMemo(() => {
    if (!data) return 0n;
    return data.pendingRoi + data.matchingBonus + data.referralBonus;
  }, [data]);

  // No connected account
  if (!address) {
    return (
      <Page>
        <Page.Body>
          <YStack
            flex={1}
            jc="center"
            ai="center"
            px="$8"
            gap="$3"
          >
            <Stack
              w={72}
              h={72}
              borderRadius="$full"
              bg="$bgStrong"
              ai="center"
              jc="center"
            >
              <Icon name="WalletOutline" size="$10" color="$iconSubdued" />
            </Stack>
            <SizableText size="$headingLg" textAlign="center">
              Select a BSC account
            </SizableText>
            <SizableText
              size="$bodyMd"
              color="$textSubdued"
              textAlign="center"
            >
              Open the account selector and pick or create an EVM account to
              view your Vortex dashboard.
            </SizableText>
          </YStack>
        </Page.Body>
      </Page>
    );
  }

  // Loading first paint
  if (!data && isLoading) {
    return (
      <Page>
        <Page.Body>
          <DashboardSkeleton />
        </Page.Body>
      </Page>
    );
  }

  // Not registered yet — empty state with primary CTA
  if (data && !data.isRegistered) {
    return (
      <Page>
        <Page.Body>
          <YStack
            flex={1}
            jc="center"
            ai="center"
            px="$8"
            gap="$4"
          >
            <Stack
              w={84}
              h={84}
              borderRadius="$full"
              bg="$bgPrimary"
              ai="center"
              jc="center"
              opacity={0.92}
            >
              <Icon name="DiamondSolid" size="$12" color="$iconInverse" />
            </Stack>
            <YStack gap="$2" ai="center" w="100%">
              <SizableText
                size="$heading2xl"
                textAlign="center"
                numberOfLines={2}
                w="100%"
              >
                Welcome to Vortex
              </SizableText>
              <SizableText
                size="$bodyLg"
                color="$textSubdued"
                textAlign="center"
              >
                Register on-chain once to start earning daily rewards on your
                USDT purchases.
              </SizableText>
            </YStack>
            <Button
              variant="primary"
              size="large"
              icon="PlusCircleOutline"
              w="100%"
              onPress={() => nav.navigate(ETabVortexRoutes.VortexRegister as any)}
            >
              Register
            </Button>
          </YStack>
        </Page.Body>
      </Page>
    );
  }

  // Normal dashboard
  const rankName = data ? RANK_NAMES[data.rank] || 'M—' : 'M—';
  const nextRank = data && data.rank < 7 ? data.rank + 1 : null;
  const nextThresholds = nextRank ? RANK_THRESHOLDS[nextRank] : null;

  return (
    <Page>
      <Page.Body>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack pt={insets.top + 12} px="$5" gap="$4" pb="$10">
          {/* Hero card */}
          <YStack
            bg="$bgSubdued"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderSubdued"
            p="$5"
            gap="$3"
          >
            <XStack jc="space-between" ai="flex-start">
              <YStack gap="$0.5" flex={1}>
                <SizableText size="$bodyMd" color="$textSubdued">
                  Pending payout
                </SizableText>
                <XStack gap="$2" ai="baseline">
                  <SizableText size="$heading4xl" fontWeight="800">
                    {data ? formatUsdt(totalPending) : '—'}
                  </SizableText>
                  <SizableText size="$bodyLg" color="$textSubdued">
                    USDT
                  </SizableText>
                </XStack>
              </YStack>
              <YStack gap="$1.5" ai="flex-end">
                <Badge badgeType="info" badgeSize="lg">
                  <Icon name="DiamondSolid" size="$3.5" color="$textInfo" />
                  <Badge.Text>{rankName}</Badge.Text>
                </Badge>
                {data ? (
                  <Badge badgeType="success" badgeSize="sm">
                    <Badge.Text>
                      {formatRateBps(data.todayRate)} / day
                    </Badge.Text>
                  </Badge>
                ) : null}
              </YStack>
            </XStack>

            <Stack h={1} bg="$borderSubdued" />

            <XStack gap="$2" ai="center">
              <Icon name="WalletOutline" size="$4" color="$iconSubdued" />
              <SizableText size="$bodyMd" color="$textSubdued" flex={1}>
                {shortAddress(address)}
              </SizableText>
              <Button
                size="small"
                variant="tertiary"
                icon="RefreshCcwOutline"
                onPress={reload}
                loading={isLoading}
              >
                Refresh
              </Button>
            </XStack>

            {data && data.referrer && data.referrer !== ZERO_ADDR ? (
              <XStack gap="$2" ai="center">
                <Icon
                  name="PeopleOutline"
                  size="$4"
                  color="$iconSubdued"
                />
                <SizableText size="$bodySm" color="$textSubdued">
                  Invited by {shortAddress(data.referrer)}
                </SizableText>
              </XStack>
            ) : null}
          </YStack>

          {/* Action bar */}
          <XStack gap="$3">
            <ActionTile
              icon="PlusCircleOutline"
              label="Purchase"
              highlighted
              onPress={() => nav.navigate(ETabVortexRoutes.VortexDeposit as any)}
            />
            <ActionTile
              icon="HandCoinsOutline"
              label="Claim"
              onPress={() => nav.navigate(ETabVortexRoutes.VortexClaim as any)}
            />
            <ActionTile
              icon="PeopleOutline"
              label="Refer"
              onPress={() =>
                nav.navigate(ETabVortexRoutes.VortexReferrals as any)
              }
            />
            <ActionTile
              icon="SwitchHorOutline"
              label="Swap"
              onPress={() => nav.navigate(ETabVortexRoutes.VortexSwap as any)}
            />
          </XStack>

          {/* Section: Earnings */}
          <YStack gap="$2">
            <SizableText size="$bodyMdMedium" color="$textSubdued">
              Earnings
            </SizableText>
            <XStack gap="$3">
              <StatCard
                label="Pending rewards"
                value={data ? formatUsdt(data.pendingRoi) : '—'}
                icon="CoinsAddOutline"
                tone={data && data.pendingRoi > 0n ? 'success' : 'default'}
              />
              <StatCard
                label="Matching bonus"
                value={data ? formatUsdt(data.matchingBonus) : '—'}
                icon="Layers3Outline"
                tone={data && data.matchingBonus > 0n ? 'success' : 'default'}
              />
            </XStack>
            <XStack gap="$3">
              <StatCard
                label="Referral bonus"
                value={data ? formatUsdt(data.referralBonus) : '—'}
                icon="PeopleOutline"
                tone={data && data.referralBonus > 0n ? 'success' : 'default'}
              />
              <StatCard
                label="USDT balance"
                value={data ? formatUsdt(data.usdtBalance) : '—'}
                icon="WalletOutline"
              />
            </XStack>
          </YStack>

          {/* Section: Position */}
          <YStack gap="$2">
            <SizableText size="$bodyMdMedium" color="$textSubdued">
              Position
            </SizableText>
            <XStack gap="$3">
              <StatCard
                label="Total purchased"
                value={data ? formatUsdt(data.totalDeposited) : '—'}
                icon="ChartLineOutline"
              />
              <StatCard
                label="Total claimed"
                value={
                  data
                    ? formatUsdt(
                        data.totalRoiClaimed +
                          data.totalMatchingClaimed +
                          data.totalReferralClaimed,
                      )
                    : '—'
                }
                icon="HandCoinsOutline"
              />
            </XStack>
          </YStack>

          {/* Section: Deposits */}
          {data && data.deposits.length > 0 ? (
            <YStack gap="$2">
              <XStack jc="space-between" ai="center">
                <SizableText size="$bodyMdMedium" color="$textSubdued">
                  Purchases
                </SizableText>
                <SizableText size="$bodySmMedium" color="$textSubdued">
                  {data.deposits.length}
                </SizableText>
              </XStack>
              <YStack gap="$2">
                {(depositsExpanded
                  ? data.deposits
                  : data.deposits.slice(0, DEPOSITS_VISIBLE)
                ).map((d, i) => (
                  <DepositRow key={i} d={d} />
                ))}
              </YStack>
              {data.deposits.length > DEPOSITS_VISIBLE ? (
                <Button
                  variant="tertiary"
                  size="small"
                  icon={
                    depositsExpanded
                      ? 'ChevronTopSmallOutline'
                      : 'ChevronDownSmallOutline'
                  }
                  onPress={() => setDepositsExpanded((v) => !v)}
                >
                  {depositsExpanded
                    ? 'Show less'
                    : `Show ${data.deposits.length - DEPOSITS_VISIBLE} more`}
                </Button>
              ) : null}
            </YStack>
          ) : null}

          {/* Section: Rank progress */}
          {data && data.rank > 0 && nextRank && nextThresholds ? (
            <YStack gap="$2">
              <SizableText size="$bodyMdMedium" color="$textSubdued">
                Next rank — {RANK_NAMES[nextRank]}
              </SizableText>
              <YStack
                bg="$bgSubdued"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderSubdued"
                p="$4"
                gap="$3"
              >
                <YStack gap="$1">
                  <XStack jc="space-between">
                    <SizableText size="$bodySm" color="$textSubdued">
                      Own deposit
                    </SizableText>
                    <SizableText size="$bodySmMedium">
                      {formatUsdt(data.ownDeposit)} / {formatUsdt(nextThresholds.own)} USDT
                    </SizableText>
                  </XStack>
                  <ProgressBar
                    value={data.ownDeposit}
                    target={nextThresholds.own}
                  />
                </YStack>
                <YStack gap="$1">
                  <XStack jc="space-between">
                    <SizableText size="$bodySm" color="$textSubdued">
                      Big leg
                    </SizableText>
                    <SizableText size="$bodySmMedium">
                      {formatUsdt(data.bigLeg)} / {formatUsdt(nextThresholds.big)} USDT
                    </SizableText>
                  </XStack>
                  <ProgressBar
                    value={data.bigLeg}
                    target={nextThresholds.big}
                  />
                </YStack>
                <YStack gap="$1">
                  <XStack jc="space-between">
                    <SizableText size="$bodySm" color="$textSubdued">
                      Small leg
                    </SizableText>
                    <SizableText size="$bodySmMedium">
                      {formatUsdt(data.smallLeg)} / {formatUsdt(nextThresholds.small)} USDT
                    </SizableText>
                  </XStack>
                  <ProgressBar
                    value={data.smallLeg}
                    target={nextThresholds.small}
                  />
                </YStack>
              </YStack>
            </YStack>
          ) : null}
        </YStack>
        </ScrollView>
      </Page.Body>
    </Page>
  );
}
