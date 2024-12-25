export interface LLMToolOpenInBrowserInput {
  urls: string[];
  browser?: string;
}

export interface LLMToolOpenInBrowserResponseData {
  data: {
    opensSuccess: string[];
    opensError: string[];
  };
}

export interface LLMToolOpenInBrowserResult {
  toolResult: unknown;
  bbResponse: LLMToolOpenInBrowserResponseData;
}
