/**
 * Message content types and structures for the BB Tools Framework.
 * Defines the core types used to represent different kinds of content
 * in messages, including text, images, tool uses, and tool results.
 *
 * @module
 */

/**
 * Supported MIME types for image content blocks.
 * Defines the allowed image formats that can be included in messages.
 *
 * @example
 * ```ts
 * const mediaType: LLMMessageContentPartImageBlockSourceMediaType = 'image/png';
 * ```
 */
export type LLMMessageContentPartImageBlockSourceMediaType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp';

/**
 * Base interface that all message content parts must implement.
 * Provides the common 'type' field used to discriminate between different content types.
 *
 * @example
 * ```ts
 * const basePart: LLMMessageContentPartBase = {
 *   type: 'text'
 * };
 * ```
 */
export interface LLMMessageContentPartBase {
  type: string;
}

/**
 * Represents a block of text content in a message.
 * The most basic and common content type used in messages.
 *
 * @example
 * ```ts
 * const textBlock: LLMMessageContentPartTextBlock = {
 *   type: 'text',
 *   text: 'Hello world!'
 * };
 * ```
 */
export interface LLMMessageContentPartTextBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'text';
  text: string;
}

/**
 * Represents a thinking block in a message.
 * Contains the model's reasoning process (e.g., Claude's extended thinking).
 *
 * @example
 * ```ts
 * const thinkingBlock: LLMMessageContentPartThinkingBlock = {
 *   type: 'thinking',
 *   thinking: 'Let me analyze this step by step...'
 * };
 * ```
 */
export interface LLMMessageContentPartThinkingBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'thinking';
  thinking: string;
  signature?: string;
}

/**
 * Represents a redacted thinking block in a message.
 * Contains encrypted or obfuscated reasoning data.
 *
 * @example
 * ```ts
 * const redactedBlock: LLMMessageContentPartRedactedThinkingBlock = {
 *   type: 'redacted_thinking',
 *   data: 'base64encodeddata...'
 * };
 * ```
 */
export interface LLMMessageContentPartRedactedThinkingBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'redacted_thinking';
  data: string;
}

/**
 * Represents an image in a message.
 * Images are stored as base64-encoded data with associated media type.
 *
 * @example
 * ```ts
 * const imageBlock: LLMMessageContentPartImageBlock = {
 *   type: 'image',
 *   source: {
 *     type: 'base64',
 *     media_type: 'image/png',
 *     data: 'base64EncodedImageData...'
 *   }
 * };
 * ```
 */
export interface LLMMessageContentPartImageBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'image';
  source: {
    type: 'base64';
    media_type: LLMMessageContentPartImageBlockSourceMediaType;
    data: string;
  };
}

/**
 * Represents an audio block in a message (OpenAI).
 * References a previous audio response from the model.
 *
 * @example
 * ```ts
 * const audioBlock: LLMMessageContentPartAudioBlock = {
 *   type: 'audio',
 *   id: 'audio_abc123'
 * };
 * ```
 */
export interface LLMMessageContentPartAudioBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'audio';
  id: string; // Unique identifier for a previous audio response from the model
}

/**
 * Represents a tool invocation in a message.
 * Contains the tool name and input parameters used for the invocation.
 *
 * @example
 * ```ts
 * const toolUseBlock: LLMMessageContentPartToolUseBlock = {
 *   type: 'tool_use',
 *   id: 'tool-123',
 *   name: 'search_files',
 *   input: { pattern: '*.ts' }
 * };
 * ```
 */
export interface LLMMessageContentPartToolUseBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'tool_use';
  id: string;
  input: object;
  name: string;
}

/**
 * Represents the result of a tool invocation.
 * Includes success status and resulting content which may be nested content parts.
 *
 * @example
 * ```ts
 * const resultBlock: LLMMessageContentPartToolResultBlock = {
 *   type: 'tool_result',
 *   tool_use_id: 'tool-123',
 *   content: [{ type: 'text', text: 'Found 5 files' }],
 *   is_error: false
 * };
 * ```
 */
export interface LLMMessageContentPartToolResultBlock extends LLMMessageContentPartBase {
  messageId?: string;
  type: 'tool_result';
  tool_use_id?: string;
  content?: Array<LLMMessageContentPartTextBlock | LLMMessageContentPartImageBlock>;
  is_error?: boolean;
}

/**
 * Union type encompassing all possible message content part types.
 * Used when a value could be any valid content part.
 *
 * @example
 * ```ts
 * function processContent(part: LLMMessageContentPart) {
 *   switch(part.type) {
 *     case 'text': return part.text;
 *     case 'image': return part.source.data;
 *     case 'thinking': return part.thinking;
 *     // ...
 *   }
 * }
 * ```
 */
export type LLMMessageContentPart =
  | LLMMessageContentPartTextBlock
  | LLMMessageContentPartThinkingBlock
  | LLMMessageContentPartRedactedThinkingBlock
  | LLMMessageContentPartImageBlock
  | LLMMessageContentPartAudioBlock
  | LLMMessageContentPartToolUseBlock
  | LLMMessageContentPartToolResultBlock;

/**
 * Represents a sequence of message content parts.
 * Used when a message contains multiple content blocks.
 *
 * @example
 * ```ts
 * const parts: LLMMessageContentParts = [
 *   { type: 'text', text: 'Here is an image:' },
 *   { type: 'image', source: { type: 'base64', media_type: 'image/png', data: '...' } }
 * ];
 * ```
 */
export type LLMMessageContentParts = LLMMessageContentPart[];

/**
 * Contains complete information about a tool use in an LLM answer.
 * Tracks the tool invocation, input, and validation status.
 *
 * @example
 * ```ts
 * const toolUse: LLMAnswerToolUse = {
 *   toolThinking: 'I need to search for TypeScript files...',
 *   toolInput: { pattern: '*.ts' },
 *   toolUseId: 'tool-123',
 *   toolName: 'search_files',
 *   toolValidation: { validated: true, results: 'Input is valid' }
 * };
 * ```
 */
export interface LLMAnswerToolUse {
  toolThinking?: string;
  toolInput: Record<string, unknown>;
  toolUseId: string;
  toolName: string;
  toolValidation: { validated: boolean; results: string };
}
