export interface LLMToolOpenUrlsInput {
  urls: string[];
  browser?: string;
}

export interface LLMToolOpenUrlsResponseData {
  data: {
    opensSuccess: string[];
    opensError: string[];
  };
}

export interface LLMToolOpenUrlsResult {
  toolResult: unknown;
  bbResponse: LLMToolOpenUrlsResponseData;
}
