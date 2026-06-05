import { useMemo, useState } from 'react';

import {
  Button,
  Icon,
  Page,
  SizableText,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';

import { useVortexDashboard } from '../hooks/useVortexDashboard';
import { useVortexSend } from '../hooks/useVortexSend';
import { formatUsdt } from '../lib/reads';
import {
  buildClaimMatching,
  buildClaimReferral,
  buildClaimRoi,
} from '../lib/txBuilders';

import type { EncodedTx } from '../lib/txBuilders';
import type { IKeyOfIcons } from '@onekeyhq/components';

type ClaimKey = 'roi' | 'matching' | 'referral';

function ClaimCard({
  icon,
  title,
  description,
  amount,
  onPress,
  busy,
  disabled,
}: {
  icon: IKeyOfIcons;
  title: string;
  description: string;
  amount: string;
  onPress: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <YStack
      bg="$bgSubdued"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderSubdued"
      p="$4"
      gap="$3"
    >
      <XStack gap="$3" ai="center">
        <Stack
          w="$10"
          h="$10"
          borderRadius="$3"
          bg="$bgStrong"
          ai="center"
          jc="center"
        >
          <Icon name={icon} size="$6" color="$icon" />
        </Stack>
        <YStack flex={1} gap="$0.5">
          <SizableText size="$bodyMdMedium">{title}</SizableText>
          <SizableText size="$bodySm" color="$textSubdued">
            {description}
          </SizableText>
        </YStack>
      </XStack>
      <XStack gap="$2" ai="baseline">
        <SizableText size="$heading2xl" fontWeight="800">
          {amount}
        </SizableText>
        <SizableText size="$bodyMd" color="$textSubdued">
          USDT
        </SizableText>
      </XStack>
      <Button
        variant={disabled ? 'secondary' : 'primary'}
        size="medium"
        icon="HandCoinsOutline"
        onPress={onPress}
        loading={busy}
        disabled={disabled}
      >
        {disabled && !busy ? 'Nothing to claim' : 'Claim'}
      </Button>
    </YStack>
  );
}

export default function Claim() {
  const { data, reload } = useVortexDashboard();
  const send = useVortexSend();
  const [busy, setBusy] = useState<ClaimKey | null>(null);
  const [msg, setMsg] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const totalPending = useMemo(() => {
    if (!data) return 0n;
    return data.pendingRoi + data.matchingBonus + data.referralBonus;
  }, [data]);

  const run = async (key: ClaimKey, label: string, tx: EncodedTx) => {
    setBusy(key);
    setMsg(null);
    await send(tx, {
      onSuccess: (txid) => {
        setMsg({
          tone: 'success',
          text: `${label} submitted: ${txid.slice(0, 10)}…`,
        });
        reload();
      },
      onFail: (e) => setMsg({ tone: 'error', text: `${label} failed: ${e.message}` }),
    });
    setBusy(null);
  };

  const msgBg = msg?.tone === 'success' ? '$bgSuccessSubdued' : '$bgCriticalSubdued';
  const msgColor = msg?.tone === 'success' ? '$textSuccess' : '$textCritical';

  return (
    <Page>
      <Page.Header headerTitle="Claim rewards" />
      <Page.Body>
        <YStack p="$5" gap="$4">
          {/* Total pending hero */}
          <YStack
            bg="$bgSubdued"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderSubdued"
            p="$5"
            gap="$2"
          >
            <SizableText size="$bodyMd" color="$textSubdued">
              Total claimable now
            </SizableText>
            <XStack gap="$2" ai="baseline">
              <SizableText
                size="$heading4xl"
                fontWeight="800"
                color={totalPending > 0n ? '$textSuccess' : '$text'}
              >
                {data ? formatUsdt(totalPending) : '—'}
              </SizableText>
              <SizableText size="$bodyLg" color="$textSubdued">
                USDT
              </SizableText>
            </XStack>
          </YStack>

          {msg ? (
            <XStack
              bg={msgBg}
              borderRadius="$3"
              p="$3"
              gap="$2"
              ai="center"
            >
              <Icon
                name={
                  msg.tone === 'success'
                    ? 'CheckRadioOutline'
                    : 'ErrorOutline'
                }
                size="$4"
                color={msgColor}
              />
              <SizableText size="$bodyMd" color={msgColor} flex={1}>
                {msg.text}
              </SizableText>
            </XStack>
          ) : null}

          <ClaimCard
            icon="CoinsAddOutline"
            title="Rewards"
            description="Daily 0.6–0.9% on each active purchase"
            amount={data ? formatUsdt(data.pendingRoi) : '—'}
            onPress={() => run('roi', 'Rewards', buildClaimRoi())}
            busy={busy === 'roi'}
            disabled={!data || data.pendingRoi === 0n || busy !== null}
          />
          <ClaimCard
            icon="Layers3Outline"
            title="Matching bonus"
            description="Accrued from your downstream rewards"
            amount={data ? formatUsdt(data.matchingBonus) : '—'}
            onPress={() => run('matching', 'Matching', buildClaimMatching())}
            busy={busy === 'matching'}
            disabled={!data || data.matchingBonus === 0n || busy !== null}
          />
          <ClaimCard
            icon="PeopleOutline"
            title="Referral bonus"
            description="5% of every direct referral's purchase"
            amount={data ? formatUsdt(data.referralBonus) : '—'}
            onPress={() => run('referral', 'Referral', buildClaimReferral())}
            busy={busy === 'referral'}
            disabled={!data || data.referralBonus === 0n || busy !== null}
          />
        </YStack>
      </Page.Body>
    </Page>
  );
}
