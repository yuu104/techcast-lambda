export type GetRssResponseData = {
  title: string;
  site_url: string;
  thumbnail_url: string;
  category_id: string;
};

export type GetArticleBodyResponseData = GetRssResponseData & {
  content: string;
};

export type GenerateScriptResponseData = GetArticleBodyResponseData & {
  script: string;
  description: string;
};

export type GenerateVoiceResponseData = GenerateScriptResponseData & {
  audio_url: string;
};
