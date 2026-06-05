import { useEffect, useMemo, useState } from 'react';

import { Image as RNImage } from 'react-native';
import { formatUnits } from 'viem';

import {
  Button,
  Icon,
  Input,
  Page,
  Select,
  SizableText,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';

import { useVortexSend } from '../hooks/useVortexSend';
import { SWAP_DEADLINE_SECONDS, SWAP_TOKENS } from '../lib/config';
import { safeBigInt } from '../lib/reads';
import {
  applySlippage,
  buildSwapPath,
  getQuote,
  getTokenBalance,
} from '../lib/swap';
import {
  buildApprovePancake,
  buildSwapExactEthForTokens,
  buildSwapExactTokensForEth,
  buildSwapExactTokensForTokens,
} from '../lib/txBuilders';

import type { SwapToken } from '../lib/config';
import type { Address } from 'viem';

const PRESET_PERCENTS = [25, 50, 75, 100] as const;

// Same reserve the web frontend keeps when MAXing native BNB so the swap tx
// itself still has gas budget on top of the input amount.
const NATIVE_GAS_RESERVE = 500_000_000_000_000n; // ~0.0005 BNB

function formatTokenAmount(wei: bigint, decimals: number, max = 6): string {
  const s = formatUnits(wei, decimals);
  const [whole, frac = ''] = s.split('.');
  if (!frac) return whole;
  const trimmed = frac.slice(0, max).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function TokenLogo({ uri, size = 28 }: { uri: string; size?: number }) {
  return (
    <RNImage
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'transparent',
      }}
      resizeMode="contain"
    />
  );
}

function TokenSelector({
  label,
  symbol,
  setSymbol,
  title,
}: {
  label: string;
  symbol: string;
  setSymbol: (s: string) => void;
  title: string;
}) {
  const items = SWAP_TOKENS.map((t) => ({
    label: t.symbol,
    value: t.symbol,
    description: t.name,
  }));
  const selected =
    SWAP_TOKENS.find((t) => t.symbol === symbol) ?? SWAP_TOKENS[0];
  return (
    <YStack flex={1} gap="$1.5">
      <SizableText size="$bodySm" color="$textSubdued">
        {label}
      </SizableText>
      <Select
        value={symbol}
        onChange={setSymbol}
        items={items}
        title={title}
        renderTrigger={() => (
          <XStack
            bg="$bgStrong"
            borderRadius="$3"
            px="$3"
            py="$2.5"
            gap="$2"
            ai="center"
            pressStyle={{ bg: '$bgStrongActive' }}
          >
            <TokenLogo uri={selected.logo} size={28} />
            <SizableText size="$bodyLgMedium" flex={1}>
              {symbol}
            </SizableText>
            <Icon
              name="ChevronDownSmallOutline"
              size="$4"
              color="$iconSubdued"
            />
          </XStack>
        )}
      />
    </YStack>
  );
}

export default function Swap() {
  const send = useVortexSend();
  const { activeAccount } = useActiveAccount({ num: 0 });
  const address = activeAccount?.account?.address as Address | undefined;

  const [fromSym, setFromSym] = useState('BNB');
  const [toSym, setToSym] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<bigint>(0n);
  const [fromBalance, setFromBalance] = useState<bigint | null>(null);
  const [busy, setBusy] = useState<'approve' | 'swap' | null>(null);
  const [msg, setMsg] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const from = useMemo(
    () => SWAP_TOKENS.find((t) => t.symbol === fromSym) as SwapToken,
    [fromSym],
  );
  const to = useMemo(
    () => SWAP_TOKENS.find((t) => t.symbol === toSym) as SwapToken,
    [toSym],
  );

  const amountIn = safeBigInt(amount, from.decimals);
  const minOut = applySlippage(quote);

  useEffect(() => {
    let cancelled = false;
    if (amountIn === 0n) {
      setQuote(0n);
      return;
    }
    getQuote(amountIn, from, to)
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch(() => {
        if (!cancelled) setQuote(0n);
      });
    return () => {
      cancelled = true;
    };
  }, [amountIn, from, to]);

  // Pull the user's actual balance for the FROM token so the preset chips
  // (25/50/75/Max) can fill the amount field. Re-runs on token flip and on
  // account change.
  useEffect(() => {
    let cancelled = false;
    setFromBalance(null);
    if (!address) return;
    getTokenBalance(address, from)
      .then((b) => {
        if (!cancelled) setFromBalance(b);
      })
      .catch(() => {
        if (!cancelled) setFromBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [address, from]);

  const onFlip = () => {
    setFromSym(toSym);
    setToSym(fromSym);
    setAmount('');
    setQuote(0n);
  };

  const setAmountFromPct = (pct: number) => {
    if (fromBalance === null) return;
    let usable = fromBalance;
    // Reserve a small BNB amount for the swap tx's own gas when MAXing native.
    if (pct === 100 && from.isNative) {
      usable = usable > NATIVE_GAS_RESERVE ? usable - NATIVE_GAS_RESERVE : 0n;
    }
    const wei = pct === 100 ? usable : (usable * BigInt(pct)) / 100n;
    setAmount(formatTokenAmount(wei, from.decimals, 8));
  };

  const onSwap = async () => {
    if (!address || amountIn === 0n) return;
    setBusy('swap');
    setMsg(null);
    const path = buildSwapPath(from, to);
    const deadline = BigInt(
      Math.floor(Date.now() / 1000) + SWAP_DEADLINE_SECONDS,
    );
    const tx = from.isNative
      ? buildSwapExactEthForTokens(amountIn, minOut, path, address, deadline)
      : to.isNative
      ? buildSwapExactTokensForEth(amountIn, minOut, path, address, deadline)
      : buildSwapExactTokensForTokens(
          amountIn,
          minOut,
          path,
          address,
          deadline,
        );
    await send(tx, {
      onSuccess: (txid) =>
        setMsg({ tone: 'success', text: `Swap submitted: ${txid.slice(0, 10)}…` }),
      onFail: (e) =>
        setMsg({ tone: 'error', text: `Swap failed: ${e.message}` }),
    });
    setBusy(null);
  };

  const onApprove = async () => {
    if (!address || from.isNative) return;
    setBusy('approve');
    setMsg(null);
    await send(buildApprovePancake(from.address), {
      onSuccess: () =>
        setMsg({ tone: 'success', text: 'Approved. Now tap Swap.' }),
      onFail: (e) =>
        setMsg({ tone: 'error', text: `Approve failed: ${e.message}` }),
    });
    setBusy(null);
  };

  const msgBg =
    msg?.tone === 'success' ? '$bgSuccessSubdued' : '$bgCriticalSubdued';
  const msgColor =
    msg?.tone === 'success' ? '$textSuccess' : '$textCritical';
  const ctaDisabled = busy !== null || amountIn === 0n || quote === 0n;
  const showApprove = !from.isNative;

  return (
    <Page>
      <Page.Header headerTitle="Swap" />
      <Page.Body>
        <YStack p="$5" gap="$4">
          {/* Selectors with flip */}
          <YStack gap="$3">
            <XStack gap="$3" ai="flex-end">
              <TokenSelector
                label="From"
                symbol={fromSym}
                setSymbol={setFromSym}
                title="From"
              />
              <Stack pb="$2">
                <Stack
                  w="$8"
                  h="$8"
                  borderRadius="$full"
                  bg="$bgStrong"
                  ai="center"
                  jc="center"
                  pressStyle={{ bg: '$bgStrongActive' }}
                  onPress={onFlip}
                >
                  <Icon
                    name="SwitchHorOutline"
                    size="$5"
                    color="$icon"
                  />
                </Stack>
              </Stack>
              <TokenSelector
                label="To"
                symbol={toSym}
                setSymbol={setToSym}
                title="To"
              />
            </XStack>
          </YStack>

          {/* Amount */}
          <YStack gap="$2.5">
            <XStack jc="space-between" ai="center">
              <SizableText size="$bodyMdMedium">You pay</SizableText>
              <SizableText size="$bodySm" color="$textSubdued">
                Balance:{' '}
                {fromBalance === null
                  ? '—'
                  : `${formatTokenAmount(fromBalance, from.decimals, 6)} ${fromSym}`}
              </SizableText>
            </XStack>
            <Input
              size="large"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
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
          </YStack>

          {/* Quote */}
          <YStack
            bg="$bgSubdued"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderSubdued"
            p="$4"
            gap="$2"
          >
            <XStack jc="space-between" ai="center">
              <SizableText size="$bodySm" color="$textSubdued">
                You receive (estimated)
              </SizableText>
              <SizableText size="$bodySm" color="$textSubdued">
                {toSym}
              </SizableText>
            </XStack>
            <XStack gap="$2" ai="baseline">
              <SizableText
                size="$heading2xl"
                fontWeight="800"
                color={quote > 0n ? '$text' : '$textSubdued'}
              >
                {formatTokenAmount(quote, to.decimals, 6)}
              </SizableText>
              <SizableText size="$bodyMd" color="$textSubdued">
                {toSym}
              </SizableText>
            </XStack>
            <XStack jc="space-between" ai="center">
              <SizableText size="$bodySm" color="$textSubdued">
                Min after 0.5% slippage
              </SizableText>
              <SizableText size="$bodySmMedium">
                {formatTokenAmount(minOut, to.decimals, 6)} {toSym}
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

          {/* CTAs */}
          {showApprove ? (
            <XStack gap="$2.5">
              <Button
                flex={1}
                variant="secondary"
                size="large"
                icon="LockOutline"
                onPress={onApprove}
                loading={busy === 'approve'}
                disabled={busy !== null}
              >
                Approve
              </Button>
              <Button
                flex={1}
                variant="primary"
                size="large"
                icon="SwitchHorOutline"
                onPress={onSwap}
                loading={busy === 'swap'}
                disabled={ctaDisabled}
              >
                Swap
              </Button>
            </XStack>
          ) : (
            <Button
              variant="primary"
              size="large"
              icon="SwitchHorOutline"
              onPress={onSwap}
              loading={busy === 'swap'}
              disabled={ctaDisabled}
            >
              Swap
            </Button>
          )}

          <XStack
            bg="$bgInfoSubdued"
            borderRadius="$3"
            p="$3"
            gap="$2"
            ai="flex-start"
          >
            <Icon name="InfoCircleOutline" size="$4" color="$iconInfo" />
            <SizableText size="$bodySm" color="$textInfo" flex={1}>
              Routed through PancakeSwap V2. Quote refreshes automatically as
              you change the amount.
            </SizableText>
          </XStack>
        </YStack>
      </Page.Body>
    </Page>
  );
}
