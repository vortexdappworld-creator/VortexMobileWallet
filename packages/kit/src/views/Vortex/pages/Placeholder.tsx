import { Page, SizableText, YStack } from '@onekeyhq/components';

export default function VortexPlaceholder() {
  return (
    <Page>
      <Page.Body>
        <YStack p="$5" gap="$3">
          <SizableText size="$heading2xl">Vortex</SizableText>
          <SizableText size="$bodyLg">Tab wired. Filling in pages…</SizableText>
        </YStack>
      </Page.Body>
    </Page>
  );
}
