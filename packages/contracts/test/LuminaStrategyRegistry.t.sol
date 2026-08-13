// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {LuminaStrategyRegistry} from "../src/LuminaStrategyRegistry.sol";

/// @notice Full test coverage for LuminaStrategyRegistry — registration,
///         updates, access control, two-step ownership and validation.
contract LuminaStrategyRegistryTest is Test {
    LuminaStrategyRegistry internal registry;
    address internal owner = address(0xA11CE);
    address internal operator = address(0x0A3B4);
    address internal stranger = address(0x5A4A7);

    address internal constant VAULT_1 = 0xC90D6847747b85d1fa2E07859869fb9fB72c0361;
    address internal constant VAULT_2 = 0x9E63a5D282F2fBb7DcE822B98e363b2719D28319;

    function setUp() public {
        registry = new LuminaStrategyRegistry(owner);
    }

    function _record(
        uint64 vaultId,
        address vault,
        string memory name,
        string memory symbol,
        LuminaStrategyRegistry.VaultKind kind,
        uint8 riskScore,
        string memory apyRange,
        bool active
    ) internal pure returns (LuminaStrategyRegistry.VaultRecord memory) {
        return LuminaStrategyRegistry.VaultRecord({
            vaultId: vaultId,
            vault: vault,
            name: name,
            symbol: symbol,
            kind: kind,
            riskScore: riskScore,
            apyRange: apyRange,
            metadataURI: "ipfs://lumina-strategy/v1",
            active: active
        });
    }

    function _record1() internal pure returns (LuminaStrategyRegistry.VaultRecord memory) {
        return _record(1, VAULT_1, "Firelight stXRP", "stXRP", LuminaStrategyRegistry.VaultKind.Firelight, 2, "4.0-6.5%", true);
    }

    function _record2() internal pure returns (LuminaStrategyRegistry.VaultRecord memory) {
        return _record(2, VAULT_2, "Upshift stXRP", "stXRP", LuminaStrategyRegistry.VaultKind.Upshift, 3, "5.5-8.0%", true);
    }

    /* ---------------- construction ---------------- */

    function test_constructor_setsOwner() public view {
        assertEq(registry.owner(), owner);
    }

    function test_constructor_revertsOnZeroOwner() public {
        vm.expectRevert(LuminaStrategyRegistry.ZeroAddress.selector);
        new LuminaStrategyRegistry(address(0));
    }

    /* ---------------- registration ---------------- */

    function test_registerVault_emitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit LuminaStrategyRegistry.VaultRegistered(1, VAULT_1, "Firelight stXRP", "stXRP");
        vm.prank(owner);
        registry.registerVault(_record1());
    }

    function test_registerVault_thenRead() public {
        vm.prank(owner);
        registry.registerVault(_record1());
        assertTrue(registry.isRegistered(1));
        assertEq(registry.vaultCount(), 1);

        LuminaStrategyRegistry.VaultRecord memory v = registry.getVault(1);
        assertEq(v.vaultId, 1);
        assertEq(v.vault, VAULT_1);
        assertEq(v.name, "Firelight stXRP");
        assertEq(v.riskScore, 2);
        assertTrue(v.active);

        LuminaStrategyRegistry.VaultRecord[] memory all = registry.getVaults();
        assertEq(all.length, 1);
        assertEq(all[0].symbol, "stXRP");
    }

    function test_registerVault_multiple() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        registry.registerVault(_record2());
        vm.stopPrank();

        assertEq(registry.vaultCount(), 2);
        LuminaStrategyRegistry.VaultRecord[] memory all = registry.getVaults();
        assertEq(all.length, 2);
        assertEq(all[0].vaultId, 1);
        assertEq(all[1].vaultId, 2);
    }

    function test_registerVault_duplicateReverts() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        vm.expectRevert(
            abi.encodeWithSelector(LuminaStrategyRegistry.VaultAlreadyRegistered.selector, uint256(1))
        );
        registry.registerVault(_record1());
        vm.stopPrank();
    }

    /* ---------------- validation ---------------- */

    function test_registerVault_zeroVaultReverts() public {
        LuminaStrategyRegistry.VaultRecord memory r = _record1();
        r.vault = address(0);
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.InvalidVault.selector);
        registry.registerVault(r);
    }

    function test_registerVault_riskScoreOutOfRangeReverts() public {
        LuminaStrategyRegistry.VaultRecord memory r = _record1();
        r.riskScore = 0;
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.InvalidRiskScore.selector);
        registry.registerVault(r);

        r.riskScore = 6;
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.InvalidRiskScore.selector);
        registry.registerVault(r);
    }

    function test_registerVault_emptyNameReverts() public {
        LuminaStrategyRegistry.VaultRecord memory r = _record1();
        r.name = "";
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.EmptyName.selector);
        registry.registerVault(r);
    }

    function test_registerVault_emptyApyRangeReverts() public {
        LuminaStrategyRegistry.VaultRecord memory r = _record1();
        r.apyRange = "";
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.EmptyApyRange.selector);
        registry.registerVault(r);
    }

    /* ---------------- updates ---------------- */

    function test_updateVault_changesFields() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        LuminaStrategyRegistry.VaultRecord memory updated = _record1();
        updated.name = "Firelight stXRP v2";
        updated.riskScore = 3;
        registry.updateVault(updated);
        vm.stopPrank();

        LuminaStrategyRegistry.VaultRecord memory v = registry.getVault(1);
        assertEq(v.name, "Firelight stXRP v2");
        assertEq(v.riskScore, 3);
        assertEq(registry.vaultCount(), 1); // no duplicate record
    }

    function test_updateVault_unknownReverts() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(LuminaStrategyRegistry.VaultNotFound.selector, uint256(99))
        );
        registry.updateVault(_record(99, VAULT_1, "x", "y", LuminaStrategyRegistry.VaultKind.Firelight, 2, "1-2%", true));
    }

    function test_setActive_flipsFlag() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        registry.setActive(1, false);
        vm.stopPrank();

        assertFalse(registry.getVault(1).active);
        assertEq(registry.getActiveVaults().length, 0);
    }

    function test_getActiveVaults_filtersInactive() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        registry.registerVault(_record2());
        registry.setActive(1, false);
        vm.stopPrank();

        LuminaStrategyRegistry.VaultRecord[] memory active = registry.getActiveVaults();
        assertEq(active.length, 1);
        assertEq(active[0].vaultId, 2);
    }

    function test_setActive_unknownReverts() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(LuminaStrategyRegistry.VaultNotFound.selector, uint256(42))
        );
        registry.setActive(42, false);
    }

    /* ---------------- access control ---------------- */

    function test_onlyOwner_canRegister() public {
        vm.prank(stranger);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.registerVault(_record1());
    }

    function test_onlyOwner_canUpdate() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        vm.stopPrank();

        vm.prank(operator);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.updateVault(_record1());
    }

    function test_onlyOwner_canSetActive() public {
        vm.startPrank(owner);
        registry.registerVault(_record1());
        vm.stopPrank();

        vm.prank(stranger);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.setActive(1, false);
    }

    /* ---------------- two-step ownership ---------------- */

    function test_transferOwnership_twoStep() public {
        vm.prank(owner);
        registry.transferOwnership(operator);

        // New owner must accept; old owner cannot.
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.acceptOwnership();

        vm.prank(operator);
        registry.acceptOwnership();
        assertEq(registry.owner(), operator);
        assertEq(registry.pendingOwner(), address(0));
    }

    function test_transferOwnership_requiresOwner() public {
        vm.prank(stranger);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.transferOwnership(operator);
    }

    function test_transferOwnership_zeroAddressReverts() public {
        vm.prank(owner);
        vm.expectRevert(LuminaStrategyRegistry.ZeroAddress.selector);
        registry.transferOwnership(address(0));
    }

    function test_acceptOwnership_uninvitedReverts() public {
        vm.prank(stranger);
        vm.expectRevert(LuminaStrategyRegistry.NotOwner.selector);
        registry.acceptOwnership();
    }

    /* ---------------- reads ---------------- */

    function test_getVault_unknownReverts() public {
        vm.expectRevert(
            abi.encodeWithSelector(LuminaStrategyRegistry.VaultNotFound.selector, uint256(7))
        );
        registry.getVault(7);
    }

    function test_initialState_empty() public view {
        assertEq(registry.vaultCount(), 0);
        assertFalse(registry.isRegistered(1));
        assertEq(registry.getVaults().length, 0);
        assertEq(registry.getActiveVaults().length, 0);
    }

    function test_fuzz_registerAnyVaultId(uint64 vaultId) public {
        vm.assume(vaultId > 0);
        vm.prank(owner);
        registry.registerVault(_record(vaultId, VAULT_1, "V", "S", LuminaStrategyRegistry.VaultKind.Upshift, 2, "1-3%", true));
        assertTrue(registry.isRegistered(vaultId));
        assertEq(registry.getVault(vaultId).vaultId, vaultId);
    }
}
