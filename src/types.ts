export type PanelStatus =
  | 'idle'
  | 'fetching'
  | 'running'
  | 'paused'
  | 'done'
  | 'error';

export type PanelConfig = {
  lang: string;
  speed: number;
  maxTokens: number;
};

export type ArticleMarker = {
  title: string;
  startTokenIndex: number;
};

export type PanelState = {
  id: string;
  config: PanelConfig;
  status: PanelStatus;
  tokens: string[];
  tokenCount: number;
  elapsedMs: number;
  articles: ArticleMarker[];
  tokPerSecSamples: number[];
  error?: string;
};

export type Language = {
  code: string;
  nameEn: string;
  nameNative: string;
  flag: string;
};

export type WikipediaSummary = {
  title: string;
  extract: string;
};
