import { USDT_ADDRESS, VORTEX_CONTRACT_ADDRESS } from './config';
import {
  buildApproveUsdt,
  buildClaimRoi,
  buildDeposit,
  buildRegister,
} from './txBuilders';

const ZERO = '0x0000000000000000000000000000000000000000' as const;

describe('txBuilders', () => {
  it('register selects function selector 0x4420e486', () => {
    const tx = buildRegister(ZERO);
    expect(tx.to).toBe(VORTEX_CONTRACT_ADDRESS);
    expect(tx.data.startsWith('0x4420e486')).toBe(true);
    expect(tx.value).toBe('0x0');
  });

  it('deposit selects function selector 0xb6b55f25', () => {
    const tx = buildDeposit(10n ** 18n);
    expect(tx.to).toBe(VORTEX_CONTRACT_ADDRESS);
    expect(tx.data.startsWith('0xb6b55f25')).toBe(true);
  });

  it('claimRoi has a 4-byte selector and no args', () => {
    const tx = buildClaimRoi();
    expect(tx.to).toBe(VORTEX_CONTRACT_ADDRESS);
    expect(tx.data).toMatch(/^0x[0-9a-f]{8}$/);
    expect(tx.value).toBe('0x0');
  });

  it('approveUsdt targets the USDT contract', () => {
    const tx = buildApproveUsdt(10n ** 18n);
    expect(tx.to).toBe(USDT_ADDRESS);
    expect(tx.data.startsWith('0x095ea7b3')).toBe(true);
  });
});
