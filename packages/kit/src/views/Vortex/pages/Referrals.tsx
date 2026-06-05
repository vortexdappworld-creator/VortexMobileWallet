import { useCallback } from 'react';

import { Share } from 'react-native';

import {
  Button,
  Icon,
  Page,
  ScrollView,
  SizableText,
  Skeleton,
  Stack,
  XStack,
  YStack,
  useClipboard,
} from '@onekeyhq/components';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import { ETabVortexRoutes } from '@onekeyhq/shared/src/routes/tabVortex';

import { readDirectReferrals } from '../lib/reads';

import type { Address } from 'viem';

function shortAddress(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function Referrals() {
  const nav = useAppNavigation();
  const { activeAccount } = useActiveAccount({ num: 0 });
  const addr = activeAccount?.account?.address as Address | undefined;
  const { result, isLoading } = usePromiseResult(
    async () => (addr ? readDirectReferrals(addr) : []),
    [addr],
    { watchLoading: true },
  );

  const inviteLink = addr ? `https://vortexdapp.world/?ref=${addr}` : '';

  const { copyText } = useClipboard();

  const onCopyAddress = useCallback(() => {
    if (!addr) return;
    copyText(addr);
  }, [addr, copyText]);

  const onShareLink = useCallback(async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Join Vortex — earn USDT rewards on BSC: ${inviteLink}`,
        url: inviteLink,
      });
    } catch {
      // user cancelled
    }
  }, [inviteLink]);

  const referrals = result ?? [];

  return (
    <Page>
      <Page.Header headerTitle="Referrals" />
      <Page.Body>
        <ScrollView>
          <YStack p="$5" gap="$4">
            {/* Invite hero */}
            <YStack
              bg="$bgSubdued"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderSubdued"
              p="$5"
              gap="$3"
            >
              <XStack gap="$3" ai="center">
                <Stack
                  w="$10"
                  h="$10"
                  borderRadius="$3"
                  bg="$bgPrimary"
                  ai="center"
                  jc="center"
                >
                  <Icon
                    name="PeopleOutline"
                    size="$6"
                    color="$iconInverse"
                  />
                </Stack>
                <YStack flex={1} gap="$0.5">
                  <SizableText size="$bodyMdMedium">
                    Invite friends
                  </SizableText>
                  <SizableText size="$bodySm" color="$textSubdued">
                    Earn 5% of every direct referral's purchase, plus a
                    matching bonus across 15 levels.
                  </SizableText>
                </YStack>
              </XStack>

              <YStack
                bg="$bgStrong"
                borderRadius="$3"
                p="$3"
                gap="$1"
              >
                <SizableText size="$bodySm" color="$textSubdued">
                  Your address
                </SizableText>
                <SizableText size="$bodyMdMedium" numberOfLines={1}>
                  {addr ?? '—'}
                </SizableText>
              </YStack>

              <XStack gap="$2.5">
                <Button
                  flex={1}
                  variant="secondary"
                  size="medium"
                  icon="Copy3Outline"
                  onPress={onCopyAddress}
                  disabled={!addr}
                >
                  Copy
                </Button>
                <Button
                  flex={1}
                  variant="primary"
                  size="medium"
                  icon="ShareOutline"
                  onPress={onShareLink}
                  disabled={!addr}
                >
                  Share
                </Button>
              </XStack>
            </YStack>

            {/* Direct referrals section */}
            <YStack gap="$2">
              <XStack jc="space-between" ai="center">
                <SizableText size="$bodyMdMedium" color="$textSubdued">
                  Direct referrals
                </SizableText>
                <XStack gap="$2" ai="center">
                  <SizableText size="$bodySmMedium" color="$textSubdued">
                    {referrals.length}
                  </SizableText>
                  {referrals.length > 0 ? (
                    <Button
                      size="small"
                      variant="tertiary"
                      iconAfter="ChevronRightSmallOutline"
                      onPress={() =>
                        nav.navigate(ETabVortexRoutes.VortexNetwork as any)
                      }
                    >
                      Network
                    </Button>
                  ) : null}
                </XStack>
              </XStack>

              {isLoading && referrals.length === 0 ? (
                <YStack gap="$2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} h={56} w="100%" borderRadius="$3" />
                  ))}
                </YStack>
              ) : referrals.length === 0 ? (
                <YStack
                  bg="$bgSubdued"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$borderSubdued"
                  py="$8"
                  px="$5"
                  ai="center"
                  gap="$2"
                >
                  <Icon
                    name="PeopleOutline"
                    size="$8"
                    color="$iconSubdued"
                  />
                  <SizableText
                    size="$bodyMd"
                    color="$textSubdued"
                    textAlign="center"
                  >
                    No direct referrals yet.{'\n'}Share your link to start
                    earning the 5% bonus.
                  </SizableText>
                </YStack>
              ) : (
                <YStack gap="$2">
                  {referrals.map((a) => (
                    <XStack
                      key={a}
                      bg="$bgSubdued"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="$borderSubdued"
                      p="$3.5"
                      gap="$3"
                      ai="center"
                    >
                      <Stack
                        w="$8"
                        h="$8"
                        borderRadius="$full"
                        bg="$bgStrong"
                        ai="center"
                        jc="center"
                      >
                        <Icon
                          name="WalletOutline"
                          size="$5"
                          color="$icon"
                        />
                      </Stack>
                      <SizableText
                        size="$bodyMdMedium"
                        flex={1}
                        numberOfLines={1}
                      >
                        {shortAddress(a)}
                      </SizableText>
                      <Icon
                        name="ChevronRightSmallOutline"
                        size="$4"
                        color="$iconSubdued"
                      />
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </Page.Body>
    </Page>
  );
}
