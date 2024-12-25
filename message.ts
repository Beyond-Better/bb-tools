/** Supported media types for image content */
export type LLMMessageContentPartImageBlockSourceMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

/** Base interface for all message content parts */
export interface LLMMessageContentPartBase {
  type: string;
}

/** Text content block */
export interface LLMMessageContentPartTextBlock
  extends LLMMessageContentPartBase {
  type: "text";
  text: string;
}

/** Image content block */
export interface LLMMessageContentPartImageBlock
  extends LLMMessageContentPartBase {
  type: "image";
  source: {
    type: "base64";
    media_type: LLMMessageContentPartImageBlockSourceMediaType;
    data: string;
  };
}

/** Tool use block */
export interface LLMMessageContentPartToolUseBlock
  extends LLMMessageContentPartBase {
  type: "tool_use";
  id: string;
  name: string;
  parameters: Record<string, unknown>;
}

/** Tool result block */
export interface LLMMessageContentPartToolResultBlock
  extends LLMMessageContentPartBase {
  type: "tool_result";
  id: string;
  success: boolean;
  content: LLMMessageContentPart | LLMMessageContentParts;
}

/** Union type of all possible content part types */
export type LLMMessageContentPart =
  | LLMMessageContentPartTextBlock
  | LLMMessageContentPartImageBlock
  | LLMMessageContentPartToolUseBlock
  | LLMMessageContentPartToolResultBlock;

/** Array of content parts */
export type LLMMessageContentParts = LLMMessageContentPart[];

/** Tool use information */
export interface LLMAnswerToolUse {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
}
