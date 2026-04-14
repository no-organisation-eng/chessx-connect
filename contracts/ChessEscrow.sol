// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title ChessEscrow
/// @notice Trustless stake management for 1v1 chess matches on Base.
/// Both players deposit USDC before the game starts.
/// The backend (trusted oracle) calls resolveMatch() to release funds.
/// A dispute window allows admin override in edge cases.
contract ChessEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum MatchStatus {
        Pending,
        Active,
        Completed,
        Disputed,
        Refunded
    }

    struct Match {
        bytes32 matchId;
        address whitePlayer;
        address blackPlayer;
        uint256 stakeAmount;
        uint256 platformFeeBps;
        bool whiteDeposited;
        bool blackDeposited;
        MatchStatus status;
        uint256 depositDeadline;
        uint256 resolveDeadline;
    }

    IERC20 public immutable usdc;
    address public oracle;
    address public treasury;
    uint256 public maxFeeBps = 500;

    mapping(bytes32 => Match) public matches;

    event MatchCreated(bytes32 indexed matchId, address white, address black, uint256 stake);
    event Deposited(bytes32 indexed matchId, address player);
    event MatchActivated(bytes32 indexed matchId);
    event MatchResolved(bytes32 indexed matchId, address winner, uint256 payout, uint256 fee);
    event MatchDrawn(bytes32 indexed matchId, uint256 refundEach, uint256 fee);
    event MatchRefunded(bytes32 indexed matchId);
    event MatchDisputed(bytes32 indexed matchId);
    event OracleUpdated(address newOracle);
    event TreasuryUpdated(address newTreasury);

    error Unauthorized();
    error InvalidMatch();
    error AlreadyDeposited();
    error DepositDeadlinePassed();
    error NotBothDeposited();
    error MatchNotActive();
    error MatchAlreadyResolved();
    error InvalidWinner();
    error FeeTooHigh();
    error DeadlineNotPassed();

    modifier onlyOracle() {
        if (msg.sender != oracle) revert Unauthorized();
        _;
    }

    modifier matchExists(bytes32 matchId) {
        if (matches[matchId].whitePlayer == address(0)) revert InvalidMatch();
        _;
    }

    constructor(
        address _usdc,
        address _oracle,
        address _treasury
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        oracle = _oracle;
        treasury = _treasury;
    }

    function createMatch(
        bytes32 matchId,
        address whitePlayer,
        address blackPlayer,
        uint256 stakeAmount,
        uint256 platformFeeBps,
        uint256 depositDeadline,
        uint256 resolveDeadline
    ) external onlyOracle whenNotPaused {
        if (matches[matchId].whitePlayer != address(0)) revert InvalidMatch();
        if (platformFeeBps > maxFeeBps) revert FeeTooHigh();

        matches[matchId] = Match({
            matchId: matchId,
            whitePlayer: whitePlayer,
            blackPlayer: blackPlayer,
            stakeAmount: stakeAmount,
            platformFeeBps: platformFeeBps,
            whiteDeposited: false,
            blackDeposited: false,
            status: MatchStatus.Pending,
            depositDeadline: depositDeadline,
            resolveDeadline: resolveDeadline
        });

        emit MatchCreated(matchId, whitePlayer, blackPlayer, stakeAmount);
    }

    function deposit(bytes32 matchId)
        external
        nonReentrant
        whenNotPaused
        matchExists(matchId)
    {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Pending) revert MatchAlreadyResolved();
        if (block.timestamp > m.depositDeadline) revert DepositDeadlinePassed();

        bool isWhite = msg.sender == m.whitePlayer;
        bool isBlack = msg.sender == m.blackPlayer;
        if (!isWhite && !isBlack) revert Unauthorized();
        if (isWhite && m.whiteDeposited) revert AlreadyDeposited();
        if (isBlack && m.blackDeposited) revert AlreadyDeposited();

        usdc.safeTransferFrom(msg.sender, address(this), m.stakeAmount);

        if (isWhite) m.whiteDeposited = true;
        else m.blackDeposited = true;

        emit Deposited(matchId, msg.sender);

        if (m.whiteDeposited && m.blackDeposited) {
            m.status = MatchStatus.Active;
            emit MatchActivated(matchId);
        }
    }

    function resolveMatch(bytes32 matchId, address winner)
        external
        nonReentrant
        onlyOracle
        matchExists(matchId)
    {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Active) revert MatchNotActive();
        _resolve(matchId, winner);
    }

    function refundMatch(bytes32 matchId)
        external
        nonReentrant
        matchExists(matchId)
    {
        Match storage m = matches[matchId];
        if (m.status == MatchStatus.Completed || m.status == MatchStatus.Refunded)
            revert MatchAlreadyResolved();

        bool isExpired = block.timestamp > m.depositDeadline && m.status == MatchStatus.Pending;
        bool isOracle = msg.sender == oracle;
        bool isOwner_ = msg.sender == owner();
        if (!isExpired && !isOracle && !isOwner_) revert Unauthorized();

        m.status = MatchStatus.Refunded;

        if (m.whiteDeposited) usdc.safeTransfer(m.whitePlayer, m.stakeAmount);
        if (m.blackDeposited) usdc.safeTransfer(m.blackPlayer, m.stakeAmount);

        emit MatchRefunded(matchId);
    }

    function disputeMatch(bytes32 matchId)
        external
        onlyOracle
        matchExists(matchId)
    {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Active) revert MatchNotActive();
        m.status = MatchStatus.Disputed;
        emit MatchDisputed(matchId);
    }

    function adminResolve(bytes32 matchId, address winner)
        external
        nonReentrant
        onlyOwner
        matchExists(matchId)
    {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Disputed) revert MatchNotActive();
        if (block.timestamp < m.resolveDeadline) revert DeadlineNotPassed();

        m.status = MatchStatus.Active;
        _resolve(matchId, winner);
    }

    function _resolve(bytes32 matchId, address winner) internal {
        Match storage m = matches[matchId];
        if (winner != address(0) && winner != m.whitePlayer && winner != m.blackPlayer)
            revert InvalidWinner();

        uint256 totalPool = m.stakeAmount * 2;
        uint256 fee = (totalPool * m.platformFeeBps) / 10000;
        uint256 payout = totalPool - fee;
        m.status = MatchStatus.Completed;

        if (fee > 0) usdc.safeTransfer(treasury, fee);

        if (winner == address(0)) {
            usdc.safeTransfer(m.whitePlayer, payout / 2);
            usdc.safeTransfer(m.blackPlayer, payout / 2);
            emit MatchDrawn(matchId, payout / 2, fee);
        } else {
            usdc.safeTransfer(winner, payout);
            emit MatchResolved(matchId, winner, payout, fee);
        }
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setMaxFeeBps(uint256 bps) external onlyOwner {
        if (bps > 1000) revert FeeTooHigh();
        maxFeeBps = bps;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
