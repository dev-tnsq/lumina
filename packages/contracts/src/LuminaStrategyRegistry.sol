// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title LuminaStrategyRegistry
/// @notice Thin, non-custodial on-chain registry that anchors the vault metadata and
///         risk labels surfaced by the Lumina UI. It holds no funds and performs no
///         transfers. The registry exists so the frontend reads a single, verifiable
///         source of truth for strategy identity and risk instead of hardcoded JSON.
/// @dev    Ownable with a two-step transfer so an operator key compromise cannot
///         immediately reassign ownership. Kept deliberately minimal and free of
///         external dependencies (no OpenZeppelin import) to minimise attack surface.
contract LuminaStrategyRegistry {
    enum VaultKind {
        Firelight,
        Upshift
    }

    struct VaultRecord {
        /// FSA vault id (1-based, matches MasterAccountController vault ids).
        uint64 vaultId;
        /// Vault token contract (ERC-4626-style vault share token).
        address vault;
        /// Display name, e.g. "Firelight stXRP".
        string name;
        /// Share token symbol, e.g. "stXRP".
        string symbol;
        /// Strategy family — determines the yield mechanism and risk model.
        VaultKind kind;
        /// Risk label 1 (lowest) .. 5 (highest). Assigned from Lumina's risk model.
        uint8 riskScore;
        /// Human-readable APY range, e.g. "4.0–6.5%". Shown WITH the risk score.
        string apyRange;
        /// Off-chain long-form metadata (JSON) for extended disclosure.
        string metadataURI;
        /// Whether the vault is currently surfaced to users. Retired vaults keep
        /// their record (positions must remain visible) but stop being recommended.
        bool active;
    }

    address public owner;
    address public pendingOwner;

    VaultRecord[] private _vaults;
    /// vaultId => index into _vaults + 1 (0 = not registered).
    mapping(uint256 => uint256) private _indexOf;

    event VaultRegistered(uint64 indexed vaultId, address indexed vault, string name, string symbol);
    event VaultUpdated(uint64 indexed vaultId);
    event VaultStatusChanged(uint64 indexed vaultId, bool active);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error ZeroAddress();
    error VaultAlreadyRegistered(uint256 vaultId);
    error VaultNotFound(uint256 vaultId);
    error InvalidRiskScore();
    error InvalidVault();
    error EmptyName();
    error EmptySymbol();
    error EmptyApyRange();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
    }

    /* ------------------------------------------------------------------ */
    /*  Ownership (two-step)                                               */
    /* ------------------------------------------------------------------ */

    /// @notice Begin ownership transfer. Only the current owner may call this.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Complete ownership transfer. Only the pending owner may call this.
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotOwner();
        address previousOwner = owner;
        owner = pendingOwner;
        delete pendingOwner;
        emit OwnershipTransferred(previousOwner, owner);
    }

    /* ------------------------------------------------------------------ */
    /*  Vault registry (owner-only writes)                                 */
    /* ------------------------------------------------------------------ */

    /// @notice Register a new vault. Reverts if the vault id already exists.
    function registerVault(VaultRecord calldata record) external onlyOwner {
        if (_indexOf[record.vaultId] != 0) revert VaultAlreadyRegistered(record.vaultId);
        _validate(record);
        _vaults.push(record);
        _indexOf[record.vaultId] = _vaults.length;
        emit VaultRegistered(record.vaultId, record.vault, record.name, record.symbol);
    }

    /// @notice Update every mutable field of an existing vault.
    function updateVault(VaultRecord calldata record) external onlyOwner {
        uint256 idx = _indexOf[record.vaultId];
        if (idx == 0) revert VaultNotFound(record.vaultId);
        _validate(record);
        _vaults[idx - 1] = record;
        emit VaultUpdated(record.vaultId);
    }

    /// @notice Flip a vault's visibility flag (used when a vault is retired).
    function setActive(uint256 vaultId, bool active) external onlyOwner {
        uint256 idx = _indexOf[vaultId];
        if (idx == 0) revert VaultNotFound(vaultId);
        VaultRecord storage record = _vaults[idx - 1];
        uint64 id = record.vaultId;
        if (record.active == active) {
            emit VaultStatusChanged(id, active); // no-op, still emit for indexers
            return;
        }
        record.active = active;
        emit VaultStatusChanged(id, active);
    }

    /* ------------------------------------------------------------------ */
    /*  Reads (anyone)                                                     */
    /* ------------------------------------------------------------------ */

    function getVault(uint256 vaultId) external view returns (VaultRecord memory) {
        uint256 idx = _indexOf[vaultId];
        if (idx == 0) revert VaultNotFound(vaultId);
        return _vaults[idx - 1];
    }

    function getVaults() external view returns (VaultRecord[] memory) {
        return _vaults;
    }

    function getActiveVaults() external view returns (VaultRecord[] memory) {
        uint256 count = _activeCount();
        VaultRecord[] memory active = new VaultRecord[](count);
        uint256 j;
        for (uint256 i; i < _vaults.length; ++i) {
            if (_vaults[i].active) {
                active[j] = _vaults[i];
                ++j;
            }
        }
        return active;
    }

    function vaultCount() external view returns (uint256) {
        return _vaults.length;
    }

    function isRegistered(uint256 vaultId) external view returns (bool) {
        return _indexOf[vaultId] != 0;
    }

    /* ------------------------------------------------------------------ */
    /*  Internals                                                          */
    /* ------------------------------------------------------------------ */

    function _activeCount() private view returns (uint256 count) {
        for (uint256 i; i < _vaults.length; ++i) {
            if (_vaults[i].active) ++count;
        }
    }

    function _validate(VaultRecord calldata record) private pure {
        if (record.vault == address(0)) revert InvalidVault();
        if (record.riskScore < 1 || record.riskScore > 5) revert InvalidRiskScore();
        if (bytes(record.name).length == 0) revert EmptyName();
        if (bytes(record.symbol).length == 0) revert EmptySymbol();
        if (bytes(record.apyRange).length == 0) revert EmptyApyRange();
    }
}
