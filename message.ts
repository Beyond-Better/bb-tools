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
  type: 'text';
  text: string;
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
  type: 'image';
  source: {
    type: 'base64';
    media_type: LLMMessageContentPartImageBlockSourceMediaType;
    data: string;
  };
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
 *   toolInput: { pattern: '*.ts' }
 * };
 * ```
 */
export interface LLMMessageContentPartToolUseBlock extends LLMMessageContentPartBase {
  type: 'tool_use';
  id: string;
  name: string;
  toolInput: Record<string, unknown>;
}

/**
 * Represents the result of a tool invocation.
 * Includes success status and resulting content which may be nested content parts.
 *
 * @example
 * ```ts
 * const resultBlock: LLMMessageContentPartToolResultBlock = {
 *   type: 'tool_result',
 *   id: 'tool-123',
 *   success: true,
 *   content: { type: 'text', text: 'Found 5 files' }
 * };
 * ```
 */
export interface LLMMessageContentPartToolResultBlock extends LLMMessageContentPartBase {
  type: 'tool_result';
  id: string;
  success: boolean;
  content: LLMMessageContentPart | LLMMessageContentParts;
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
 *     // ...
 *   }
 * }
 * ```
 */
export type LLMMessageContentPart =
  | LLMMessageContentPartTextBlock
  | LLMMessageContentPartImageBlock
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

export interface LLMToolResult {
  toolResult: unknown;
  bbResponse: { data: unknown };
}

/**
 * Contains complete information about a tool use, including results.
 * Used to track both the tool invocation and its outcome.
 *
 * @example
 * ```ts
 * const toolUse: LLMAnswerToolUse = {
 *   id: 'tool-123',
 *   name: 'search_files',
 *   toolInput: {
 *     toolResult: { files: ['config.ts'] },
 *     bbResponse: { data: { success: true } }
 *   }
 * };
 * ```
 */
export interface LLMAnswerToolUse {
  id: string;
  name: string;
  toolInput: LLMToolResult;
}
