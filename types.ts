import type { LLMMessageContentPartImageBlockSourceMediaType } from './message.ts';

/** Token usage tracking */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

/** File metadata information */
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

/** Tool usage statistics */
export interface ToolStats {
  count: number;
  success: number;
  failure: number;
  lastUse: {
    success: boolean;
    timestamp: string;
  };
}

/** Aggregated tool usage statistics */
export interface ToolUsageStats {
  toolCounts: Map<string, number>;
  toolResults: Map<string, { success: number; failure: number }>;
  lastToolUse: string;
  lastToolSuccess: boolean;
}

/** Conversation statistics */
export interface ConversationStats {
  statementCount: number;
  statementTurnCount: number;
  conversationTurnCount: number;
}
