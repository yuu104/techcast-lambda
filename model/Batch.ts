export type GetRssResponseData = {
  title: string;
  site_url: string;
  thubnail_url: string;
  category_id: string;
};

export type GetArticleBodyResponseData = GetRssResponseData & {
  content: string;
};

export type GenerateScriptResponseData = GetArticleBodyResponseData & {
  script: string;
  description: string;
};
