import type { LLMMessageContentPartImageBlockSourceMediaType } from './message.ts';

/**
 * Core types and interfaces used throughout the BB Tools Framework.
 * Provides fundamental data structures for tracking token usage, file metadata,
 * tool statistics, and conversation state.
 *
 * @module
 */

/**
 * Tracks token usage for conversations and operations.
 * Used to monitor resource consumption and optimize performance.
 *
 * @example
 * ```ts
 * const usage: TokenUsage = {
 *   inputTokens: 150,
 *   outputTokens: 80,
 *   totalTokens: 230,
 *   cacheCreationInputTokens: 100
 * };
 * ```
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

/**
 * Metadata about a file in the project.
 * Includes core information like type, size, and modification date,
 * as well as optional fields for tracking file usage in conversations.
 *
 * @example
 * ```ts
 * const metadata: FileMetadata = {
 *   type: 'text',
 *   path: 'src/config.ts',
 *   size: 1024,
 *   lastModified: new Date(),
 *   mimeType: 'text/typescript'
 * };
 * ```
 */
export interface FileMetadata {
  type: 'text' | 'image';
  mimeType?: LLMMessageContentPartImageBlockSourceMediaType;
  path: string;
  size: number;
  lastModified: Date;
  messageId?: string;
  toolUseId?: string;
  error?: string | null;
}

/**
 * Statistics for a specific tool's usage.
 * Tracks success/failure rates and timing information.
 *
 * @example
 * ```ts
 * const stats: ToolStats = {
 *   count: 10,
 *   success: 8,
 *   failure: 2,
 *   lastUse: {
 *     success: true,
 *     timestamp: '2024-03-20T15:30:00Z'
 *   }
 * };
 * ```
 */
export interface ToolStats {
  count: number;
  success: number;
  failure: number;
  lastUse: {
    success: boolean;
    timestamp: string;
  };
}

/**
 * Aggregated statistics across all tools.
 * Provides a high-level view of tool usage patterns and success rates.
 *
 * @example
 * ```ts
 * const stats: ToolUsageStats = {
 *   toolCounts: new Map([['search', 5], ['replace', 3]]),
 *   toolResults: new Map([['search', { success: 4, failure: 1 }]]),
 *   lastToolUse: 'search',
 *   lastToolSuccess: true
 * };
 * ```
 */
export interface ToolUsageStats {
  toolCounts: Map<string, number>;
  toolResults: Map<string, { success: number; failure: number }>;
  lastToolUse: string;
  lastToolSuccess: boolean;
}

/**
 * Statistics about a conversation's progress and structure.
 * Tracks various counts to help manage conversation flow and complexity.
 *
 * @example
 * ```ts
 * const stats: ConversationStats = {
 *   statementCount: 15,
 *   statementTurnCount: 8,
 *   conversationTurnCount: 4
 * };
 * ```
 */
export interface ConversationStats {
  statementCount: number;
  statementTurnCount: number;
  conversationTurnCount: number;
}
