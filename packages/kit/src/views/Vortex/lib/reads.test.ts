import { formatUsdt, safeBigInt } from './reads';

describe('formatUsdt', () => {
  it('renders 18-decimal wei with 4 significant fractional digits', () => {
    expect(formatUsdt(1_000_000_000_000_000_000n)).toBe('1.0000');
    expect(formatUsdt(1_234_567_890_000_000_000n)).toBe('1.2346');
    expect(formatUsdt(0n)).toBe('0.0000');
  });
});

describe('safeBigInt', () => {
  it('parses decimal strings with USDT 18-decimal scaling', () => {
    expect(safeBigInt('1', 18)).toBe(10n ** 18n);
    expect(safeBigInt('0.5', 18)).toBe(5n * 10n ** 17n);
    expect(safeBigInt('', 18)).toBe(0n);
    expect(safeBigInt('abc', 18)).toBe(0n);
  });
});
