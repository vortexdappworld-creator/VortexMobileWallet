import { useState } from 'react';

import { isAddress } from 'viem';

import {
  Button,
  Icon,
  Input,
  Page,
  SizableText,
  Stack,
  XStack,
  YStack,
} from '@onekeyhq/components';

import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';

import { useVortexSend } from '../hooks/useVortexSend';
import { buildRegister } from '../lib/txBuilders';

import type { Address } from 'viem';
import type { IKeyOfIcons } from '@onekeyhq/components';

// Matches the web frontend's `DEFAULT_REFERRER` in `frontend/src/lib/refs.ts`.
// When the user doesn't paste a referrer, registration goes under this address
// so the inviter pool still earns the 5% bonus.
const DEFAULT_REFERRER =
  '0x1378e074E0ED0c0123f2c38498Be001406Fa8e3C' as Address;

function StepBullet({
  icon,
  title,
  description,
}: {
  icon: IKeyOfIcons;
  title: string;
  description: string;
}) {
  return (
    <XStack gap="$3" ai="flex-start">
      <Stack
        w="$10"
        h="$10"
        borderRadius="$3"
        bg="$bgStrong"
        ai="center"
        jc="center"
        flexShrink={0}
      >
        <Icon name={icon} size="$5" color="$icon" />
      </Stack>
      <YStack flex={1} gap="$0.5">
        <SizableText size="$bodyMdMedium">{title}</SizableText>
        <SizableText size="$bodySm" color="$textSubdued">
          {description}
        </SizableText>
      </YStack>
    </XStack>
  );
}

export default function Register() {
  const nav = useAppNavigation();
  const send = useVortexSend();
  const [referrer, setReferrer] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const valid = referrer === '' || isAddress(referrer);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const ref = referrer ? (referrer as Address) : DEFAULT_REFERRER;
    await send(buildRegister(ref), {
      onSuccess: (txid) => {
        setMsg({
          tone: 'success',
          text: `Registered: ${txid.slice(0, 10)}… Opening dashboard…`,
        });
        // Keep the button in the loading state and pop back to the dashboard
        // after a beat so the user sees the confirmation and isn't stuck on
        // this screen.
        setTimeout(() => {
          nav.pop();
        }, 1200);
        return;
      },
      onFail: (e) => {
        setMsg({ tone: 'error', text: `Failed: ${e.message}` });
        setBusy(false);
      },
    });
  };

  const msgBg =
    msg?.tone === 'success'
      ? '$bgSuccessSubdued'
      : msg?.tone === 'info'
      ? '$bgInfoSubdued'
      : '$bgCriticalSubdued';
  const msgColor =
    msg?.tone === 'success'
      ? '$textSuccess'
      : msg?.tone === 'info'
      ? '$textInfo'
      : '$textCritical';

  return (
    <Page>
      <Page.Header headerTitle="Register" />
      <Page.Body>
        <YStack p="$5" gap="$5">
          {/* Hero */}
          <YStack gap="$3" ai="center" pt="$4">
            <Stack
              w={84}
              h={84}
              borderRadius="$full"
              bg="$bgPrimary"
              ai="center"
              jc="center"
            >
              <Icon name="DiamondSolid" size="$12" color="$iconInverse" />
            </Stack>
            <YStack gap="$1.5" ai="center" w="100%">
              <SizableText
                size="$heading2xl"
                textAlign="center"
                numberOfLines={2}
                w="100%"
              >
                Join Vortex
              </SizableText>
              <SizableText
                size="$bodyLg"
                color="$textSubdued"
                textAlign="center"
              >
                One on-chain transaction unlocks purchases, daily rewards, and
                referral bonuses.
              </SizableText>
            </YStack>
          </YStack>

          {/* What you get */}
          <YStack
            bg="$bgSubdued"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderSubdued"
            p="$4"
            gap="$3"
          >
            <StepBullet
              icon="CoinsAddOutline"
              title="Daily rewards"
              description="Earn 0.6%–0.9% per day on each USDT purchase."
            />
            <StepBullet
              icon="Layers3Outline"
              title="Matching bonus"
              description="Get a share when your downstream claims rewards."
            />
            <StepBullet
              icon="PeopleOutline"
              title="Referral bonus"
              description="5% of every direct referral's purchase."
            />
          </YStack>

          {/* Optional referrer */}
          <YStack gap="$2">
            <SizableText size="$bodyMdMedium">
              Referrer address (optional)
            </SizableText>
            <Input
              size="large"
              placeholder="0x… or leave empty"
              value={referrer}
              onChangeText={setReferrer}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!valid ? (
              <XStack ai="center" gap="$1.5">
                <Icon name="ErrorOutline" size="$4" color="$iconCritical" />
                <SizableText size="$bodySm" color="$textCritical">
                  Not a valid EVM address
                </SizableText>
              </XStack>
            ) : (
              <SizableText size="$bodySm" color="$textSubdued">
                Optional. Lets your inviter earn the 5% referral bonus on your
                future purchases.
              </SizableText>
            )}
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
                    : msg.tone === 'info'
                    ? 'InfoCircleOutline'
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

          <Button
            variant="primary"
            size="large"
            icon="PlusCircleOutline"
            disabled={!valid || busy}
            loading={busy}
            onPress={submit}
          >
            Register on-chain
          </Button>
        </YStack>
      </Page.Body>
    </Page>
  );
}
