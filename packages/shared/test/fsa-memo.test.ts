import { describe, expect, it } from "vitest";
import {
  decodeMemo,
  encodeFxrpTransferMemo,
  encodeVaultDepositMemo,
  FSA_INSTRUCTION,
  fxrpAmountToLots,
  lotsToFxrpAmount,
} from "../src/flare";
import { FXRP_LOT_SIZE } from "../src/constants";

describe("FSA memo encoding (via official @flarenetwork/smart-accounts-encoder)", () => {
  it("encodes an Upshift deposit memo with the exact byte layout", () => {
    const memo = encodeVaultDepositMemo({
      instruction: FSA_INSTRUCTION.UPSHIFT_DEPOSIT,
      drops: 5n,
      vaultId: 2,
    });
    const hex = memo.slice(2);
    // 32 bytes = 64 hex chars (encoder pads to 32 bytes)
    expect(hex.length).toBe(64);
    // byte 0: instruction 0x21
    expect(hex.slice(0, 2)).toBe("21");
    // byte 1: walletId 0x01
    expect(hex.slice(2, 4)).toBe("01");
    // bytes 2-11: value (10-byte field) = 5 drops
    expect(hex.slice(4, 24)).toBe("00000000000000000005");
    // bytes 12-13: ignored
    expect(hex.slice(24, 28)).toBe("0000");
    // bytes 14-15: vaultId 2
    expect(hex.slice(28, 32)).toBe("0002");
    // bytes 16-31: ignored / zero padding
    expect(hex.slice(32)).toBe("00000000000000000000000000000000");
  });

  it("encodes a Firelight deposit memo with instruction 0x11", () => {
    const memo = encodeVaultDepositMemo({
      instruction: FSA_INSTRUCTION.FIRELIGHT_DEPOSIT,
      drops: 1n,
      vaultId: 1,
    });
    const hex = memo.slice(2);
    expect(hex.slice(0, 2)).toBe("11");
    expect(hex.slice(28, 32)).toBe("0001");
  });

  it("encodes an FXRP transfer memo with recipient in bytes 12-32", () => {
    const recipient = "0x1234567890abcdef1234567890abcdef12345678";
    const memo = encodeFxrpTransferMemo({ drops: 1000n, recipient });
    const hex = memo.slice(2);
    expect(hex.slice(0, 2)).toBe("01");
    expect(hex.slice(24, 64)).toBe(recipient.slice(2));
  });

  it("round-trips through decodeMemo", () => {
    const memo = encodeVaultDepositMemo({
      instruction: FSA_INSTRUCTION.UPSHIFT_DEPOSIT,
      drops: 7n,
      vaultId: 3,
    });
    const decoded = decodeMemo(memo);
    expect(decoded.instruction).toBe(FSA_INSTRUCTION.UPSHIFT_DEPOSIT);
    expect(decoded.value).toBe(7n);
    expect(decoded.vaultId).toBe(3);
  });

  it("converts FXRP amounts to lots and back", () => {
    expect(fxrpAmountToLots(FXRP_LOT_SIZE)).toBe(1n);
    expect(fxrpAmountToLots(25n * FXRP_LOT_SIZE)).toBe(25n);
    expect(lotsToFxrpAmount(4n)).toBe(4n * FXRP_LOT_SIZE);
  });
});
