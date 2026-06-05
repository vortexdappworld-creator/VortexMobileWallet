import { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Icon,
  Input,
  Page,
  SizableText,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';

import { useVortexDashboard } from '../hooks/useVortexDashboard';
import { useVortexSend } from '../hooks/useVortexSend';
import { formatUsdt, safeBigInt } from '../lib/reads';
import { buildApproveUsdt, buildDeposit } from '../lib/txBuilders';

const PRESET_PERCENTS = [25, 50, 75, 100] as const;

export default function Deposit() {
  const { data, reload } = useVortexDashboard();
  const send = useVortexSend();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState<'approve' | 'deposit' | null>(null);
  const [msg, setMsg] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const amountWei = safeBigInt(amount, 18);
  const balance = data?.usdtBalance ?? 0n;
  const allowance = data?.usdtAllowance ?? 0n;
  const needsApprove = !!data && allowance < amountWei && amountWei > 0n;
  const insufficient = !!data && balance < amountWei && amountWei > 0n;

  const setAmountFromPct = (pct: number) => {
    if (!data) return;
    const wei = (data.usdtBalance * BigInt(pct)) / 100n;
    setAmount(formatUsdt(wei));
  };

  const onApprove = async () => {
    setBusy('approve');
    setMsg(null);
    await send(buildApproveUsdt(), {
      onSuccess: () => {
        setMsg({ tone: 'success', text: 'USDT approved. Now tap Purchase.' });
        reload();
      },
      onFail: (e) =>
        setMsg({ tone: 'error', text: `Approve failed: ${e.message}` }),
    });
    setBusy(null);
  };

  const onDeposit = async () => {
    setBusy('deposit');
    setMsg(null);
    await send(buildDeposit(amountWei), {
      onSuccess: (txid) => {
        setMsg({
          tone: 'success',
          text: `Purchase submitted: ${txid.slice(0, 10)}…`,
        });
        setAmount('');
        reload();
      },
      onFail: (e) =>
        setMsg({ tone: 'error', text: `Purchase failed: ${e.message}` }),
    });
    setBusy(null);
  };

  const ctaDisabled =
    amountWei === 0n || insufficient || !data || busy !== null;

  const msgBg = useMemo(() => {
    if (!msg) return undefined;
    if (msg.tone === 'success') return '$bgSuccessSubdued';
    if (msg.tone === 'error') return '$bgCriticalSubdued';
    return '$bgInfoSubdued';
  }, [msg]);
  const msgColor = useMemo(() => {
    if (!msg) return '$text';
    if (msg.tone === 'success') return '$textSuccess';
    if (msg.tone === 'error') return '$textCritical';
    return '$textInfo';
  }, [msg]);

  return (
    <Page>
      <Page.Header headerTitle="Purchase" />
      <Page.Body>
        <YStack p="$5" gap="$4">
          {/* Hero: balance & allowance */}
          <YStack
            bg="$bgSubdued"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderSubdued"
            p="$5"
            gap="$3"
          >
            <SizableText size="$bodyMd" color="$textSubdued">
              Available to purchase
            </SizableText>
            <XStack gap="$2" ai="baseline">
              <SizableText size="$heading3xl" fontWeight="800">
                {formatUsdt(balance)}
              </SizableText>
              <SizableText size="$bodyLg" color="$textSubdued">
                USDT
              </SizableText>
            </XStack>
            <Stack h={1} bg="$borderSubdued" />
            <XStack jc="space-between" ai="center">
              <SizableText size="$bodyMd" color="$textSubdued">
                Allowance
              </SizableText>
              <SizableText size="$bodyMdMedium">
                {formatUsdt(allowance)} USDT
              </SizableText>
            </XStack>
          </YStack>

          {/* Amount input */}
          <YStack gap="$2.5">
            <SizableText size="$bodyMdMedium">Amount</SizableText>
            <Input
              size="large"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              addOns={[
                {
                  label: 'USDT',
                  iconColor: '$iconSubdued',
                },
              ]}
            />
            <XStack gap="$2">
              {PRESET_PERCENTS.map((p) => (
                <Stack
                  key={p}
                  flex={1}
                  ai="center"
                  bg="$bgStrong"
                  borderRadius="$3"
                  py="$1.5"
                  pressStyle={{ bg: '$bgStrongActive' }}
                  onPress={() => setAmountFromPct(p)}
                >
                  <SizableText size="$bodySmMedium">
                    {p === 100 ? 'Max' : `${p}%`}
                  </SizableText>
                </Stack>
              ))}
            </XStack>
            {insufficient ? (
              <XStack ai="center" gap="$1.5">
                <Icon
                  name="ErrorOutline"
                  size="$4"
                  color="$iconCritical"
                />
                <SizableText size="$bodySm" color="$textCritical">
                  Insufficient USDT balance
                </SizableText>
              </XStack>
            ) : null}
          </YStack>

          {/* Status message */}
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
                    : msg.tone === 'error'
                    ? 'ErrorOutline'
                    : 'InfoCircleOutline'
                }
                size="$4"
                color={msgColor}
              />
              <SizableText size="$bodyMd" color={msgColor} flex={1}>
                {msg.text}
              </SizableText>
            </XStack>
          ) : null}

          {/* CTAs */}
          {needsApprove ? (
            <YStack gap="$2.5">
              <Button
                variant="secondary"
                size="large"
                icon="LockOutline"
                onPress={onApprove}
                loading={busy === 'approve'}
                disabled={busy !== null || ctaDisabled}
              >
                Step 1 — Approve USDT
              </Button>
              <Button
                variant="primary"
                size="large"
                icon="PlusCircleOutline"
                disabled
              >
                Step 2 — Purchase
              </Button>
            </YStack>
          ) : (
            <Button
              variant="primary"
              size="large"
              icon="PlusCircleOutline"
              onPress={onDeposit}
              loading={busy === 'deposit'}
              disabled={ctaDisabled}
            >
              Purchase
            </Button>
          )}

          {/* Info notice */}
          <XStack
            bg="$bgInfoSubdued"
            borderRadius="$3"
            p="$3"
            gap="$2"
            ai="flex-start"
          >
            <Icon name="InfoCircleOutline" size="$4" color="$iconInfo" />
            <YStack flex={1} gap="$0.5">
              <SizableText size="$bodySmMedium" color="$textInfo">
                How it works
              </SizableText>
              <SizableText size="$bodySm" color="$textSubdued">
                80% of each purchase goes to the treasury, 20% to the LP. Daily
                rewards accrue at 0.6%–0.9% and are capped at 2.5× of the
                purchase.
              </SizableText>
            </YStack>
          </XStack>
        </YStack>
      </Page.Body>
    </Page>
  );
}
