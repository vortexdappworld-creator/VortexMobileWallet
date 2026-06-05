import { useMemo, useState } from 'react';

import {
  Badge,
  Icon,
  Page,
  ScrollView,
  SizableText,
  Skeleton,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';

import { useReferralTree } from '../hooks/useReferralTree';
import { formatUsdt, readDirectReferrals, readTreeNode } from '../lib/reads';

import type { VortexTreeNode } from '../lib/reads';
import type { Address } from 'viem';

function shortAddress(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const RANK_NAMES = ['', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const;

const lower = (a: string) => a.toLowerCase();

function NodeCard({
  label,
  address,
  rank,
  primary,
  secondary,
  isRoot,
  isBigLeg,
  childrenCount,
  isExpanded,
  onToggle,
}: {
  label?: string;
  address: string;
  rank: number;
  primary: { label: string; value: bigint };
  secondary?: { label: string; value: bigint };
  isRoot?: boolean;
  isBigLeg?: boolean;
  childrenCount: number;
  isExpanded: boolean;
  onToggle?: () => void;
}) {
  const rankName = RANK_NAMES[rank] || 'M—';
  return (
    <YStack
      bg={isBigLeg ? '$bgInfoSubdued' : '$bgSubdued'}
      borderRadius="$3"
      borderWidth={isRoot ? 2 : 1}
      borderColor={
        isRoot
          ? '$borderActive'
          : isBigLeg
          ? '$borderInfoSubdued'
          : '$borderSubdued'
      }
      p="$3.5"
      gap="$1.5"
    >
      <XStack jc="space-between" ai="center">
        <XStack gap="$2" ai="center" flex={1}>
          <Icon name="WalletOutline" size="$4" color="$icon" />
          <YStack flex={1} gap="$0.5">
            <SizableText size="$bodyMdMedium" numberOfLines={1}>
              {label ?? shortAddress(address)}
            </SizableText>
            {label ? (
              <SizableText
                size="$bodySm"
                color="$textSubdued"
                numberOfLines={1}
              >
                {shortAddress(address)}
              </SizableText>
            ) : null}
          </YStack>
        </XStack>
        <XStack gap="$1.5" ai="center">
          {rank > 0 ? (
            <Badge badgeType="info" badgeSize="sm">
              <Badge.Text>{rankName}</Badge.Text>
            </Badge>
          ) : null}
          {onToggle ? (
            <Stack
              w="$7"
              h="$7"
              borderRadius="$full"
              bg="$bgStrong"
              ai="center"
              jc="center"
              pressStyle={{ bg: '$bgStrongActive' }}
              onPress={onToggle}
            >
              <Icon
                name={
                  isExpanded ? 'MinusSmallOutline' : 'PlusSmallOutline'
                }
                size="$4"
                color="$icon"
              />
            </Stack>
          ) : null}
        </XStack>
      </XStack>

      <XStack gap="$3">
        <YStack flex={1} gap="$0.5">
          <SizableText size="$bodySm" color="$textSubdued">
            {primary.label}
          </SizableText>
          <SizableText size="$bodyMdMedium">
            {formatUsdt(primary.value)} USDT
          </SizableText>
        </YStack>
        {secondary ? (
          <YStack flex={1} gap="$0.5">
            <SizableText size="$bodySm" color="$textSubdued">
              {secondary.label}
            </SizableText>
            <SizableText size="$bodyMdMedium">
              {formatUsdt(secondary.value)} USDT
            </SizableText>
          </YStack>
        ) : null}
      </XStack>

      {childrenCount > 0 ? (
        <SizableText size="$bodySm" color="$textSubdued">
          {childrenCount} {childrenCount === 1 ? 'referral' : 'referrals'}
        </SizableText>
      ) : null}
    </YStack>
  );
}

function Subtree({
  addr,
  depth,
  isBigLeg,
  nodes,
  expanded,
  onExpand,
  onCollapse,
}: {
  addr: Address;
  depth: number;
  isBigLeg: boolean;
  nodes: Map<string, VortexTreeNode>;
  expanded: Set<string>;
  onExpand: (a: Address) => void;
  onCollapse: (a: Address) => void;
}) {
  const node = nodes.get(lower(addr));
  const indent = Math.min(depth, 4) * 16;
  if (!node) {
    return (
      <Stack pl={indent}>
        <Skeleton h={88} w="100%" borderRadius="$3" />
      </Stack>
    );
  }
  const isExpanded = expanded.has(lower(addr));
  return (
    <YStack pl={indent} gap="$2">
      <NodeCard
        address={node.address}
        rank={node.rank}
        primary={{ label: 'Own purchase', value: node.deposit }}
        secondary={{ label: 'Team volume', value: node.teamVolume }}
        isBigLeg={isBigLeg}
        childrenCount={node.children.length}
        isExpanded={isExpanded}
        onToggle={
          node.children.length > 0
            ? () =>
                isExpanded ? onCollapse(node.address) : onExpand(node.address)
            : undefined
        }
      />
      {isExpanded
        ? node.children.map((c) => (
            <Subtree
              key={c}
              addr={c}
              depth={depth + 1}
              isBigLeg={isBigLeg}
              nodes={nodes}
              expanded={expanded}
              onExpand={onExpand}
              onCollapse={onCollapse}
            />
          ))
        : null}
    </YStack>
  );
}

export default function NetworkTree() {
  const { activeAccount } = useActiveAccount({ num: 0 });
  const addr = activeAccount?.account?.address as Address | undefined;

  const refs = usePromiseResult(
    async () => (addr ? readDirectReferrals(addr) : []),
    [addr],
    { watchLoading: true },
  );
  const directRefs = (refs.result ?? []) as Address[];

  const rootNode = usePromiseResult(
    async () => (addr ? readTreeNode(addr) : undefined),
    [addr],
    { watchLoading: true },
  );

  const { nodes, expanded, loading, error, expand, collapse } = useReferralTree(
    addr,
    directRefs,
  );

  const [rootExpanded, setRootExpanded] = useState(true);

  // Big-leg = direct referral with the highest teamVolume.
  const bigLegAddr = useMemo(() => {
    let best: string | null = null;
    let max = 0n;
    for (const r of directRefs) {
      const n = nodes.get(lower(r));
      if (!n) continue;
      if (n.teamVolume > max) {
        max = n.teamVolume;
        best = lower(r);
      }
    }
    return best;
  }, [directRefs, nodes]);

  if (!addr) {
    return (
      <Page>
        <Page.Body>
          <YStack flex={1} jc="center" ai="center" px="$8" gap="$3">
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
          </YStack>
        </Page.Body>
      </Page>
    );
  }

  if (refs.isLoading && directRefs.length === 0) {
    return (
      <Page>
        <Page.Body>
          <YStack p="$5" gap="$3">
            <Skeleton h={120} w="100%" borderRadius="$3" />
            <Skeleton h={88} w="100%" borderRadius="$3" />
            <Skeleton h={88} w="100%" borderRadius="$3" />
            <Skeleton h={88} w="100%" borderRadius="$3" />
          </YStack>
        </Page.Body>
      </Page>
    );
  }

  if (directRefs.length === 0) {
    return (
      <Page>
        <Page.Body>
          <YStack flex={1} jc="center" ai="center" px="$8" gap="$3">
            <Stack
              w={72}
              h={72}
              borderRadius="$full"
              bg="$bgStrong"
              ai="center"
              jc="center"
            >
              <Icon name="PeopleOutline" size="$10" color="$iconSubdued" />
            </Stack>
            <SizableText size="$headingLg" textAlign="center">
              No referrals yet
            </SizableText>
            <SizableText
              size="$bodyMd"
              color="$textSubdued"
              textAlign="center"
            >
              Share your invite link from the Refer tab. Your network will
              appear here once people register under you.
            </SizableText>
          </YStack>
        </Page.Body>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header headerTitle="Network" />
      <Page.Body>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <YStack p="$5" gap="$3" pb="$10">
            {error ? (
              <XStack
                bg="$bgCriticalSubdued"
                borderRadius="$3"
                p="$3"
                gap="$2"
                ai="center"
              >
                <Icon name="ErrorOutline" size="$4" color="$iconCritical" />
                <SizableText size="$bodySm" color="$textCritical" flex={1}>
                  {error}
                </SizableText>
              </XStack>
            ) : null}

            {/* Root (you) */}
            <NodeCard
              label="You"
              address={addr}
              rank={rootNode.result?.rank ?? 0}
              primary={{
                label: 'Network volume',
                value: rootNode.result?.teamVolume ?? 0n,
              }}
              secondary={
                rootNode.result
                  ? {
                      label: 'Own purchase',
                      value: rootNode.result.deposit,
                    }
                  : undefined
              }
              isRoot
              childrenCount={directRefs.length}
              isExpanded={rootExpanded}
              onToggle={() => setRootExpanded((v) => !v)}
            />

            {rootExpanded ? (
              <YStack gap="$2">
                {loading && nodes.size === 0
                  ? directRefs.map((r) => (
                      <Stack key={r} pl={16}>
                        <Skeleton h={88} w="100%" borderRadius="$3" />
                      </Stack>
                    ))
                  : directRefs.map((r) => (
                      <Subtree
                        key={r}
                        addr={r}
                        depth={1}
                        isBigLeg={lower(r) === bigLegAddr}
                        nodes={nodes}
                        expanded={expanded}
                        onExpand={expand}
                        onCollapse={collapse}
                      />
                    ))}
              </YStack>
            ) : null}

            <XStack
              bg="$bgInfoSubdued"
              borderRadius="$3"
              p="$3"
              gap="$2"
              ai="flex-start"
            >
              <Icon name="InfoCircleOutline" size="$4" color="$iconInfo" />
              <SizableText size="$bodySm" color="$textInfo" flex={1}>
                Tap + to expand a branch. The highlighted node is your big leg
                (largest team volume).
              </SizableText>
            </XStack>
          </YStack>
        </ScrollView>
      </Page.Body>
    </Page>
  );
}
