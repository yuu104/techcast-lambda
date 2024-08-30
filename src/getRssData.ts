import { invokeLambda } from "../utils/invokeLambda";

type RssResponse = {
  status: "ok" | "error";
  items: RssResponseData[];
};

type RssResponseData = {
  title: string;
  link: string;
  thumbnail: string;
  enclosure: {
    link: string;
  };
};

const rssToJdonApiEndpont = "https://api.rss2json.com/v1/api.json";

export const handler = async () => {
  const allUrls = rssUrls.flatMap((rssUrl) =>
    rssUrl.urls.map((url) => ({ url, category_id: rssUrl.category_id }))
  );
  try {
    const fetchRss = async (
      url: string,
      category_id: string
    ): Promise<RssResponse & { category_id: string }> => {
      const res = await fetch(`${rssToJdonApiEndpont}?rss_url=${url}`);
      const data = await res.json();
      return { ...(data as RssResponse), category_id };
    };
    const rssResponseData = await Promise.all(
      allUrls.map((item) => fetchRss(item.url, item.category_id))
    );

    const rssData = rssResponseData
      .filter((data) => data.status === "ok")
      .flatMap((data) =>
        data.items.map((item) => ({
          title: item.title,
          site_url: item.link,
          thumbnail_url: item.thumbnail ?? item.enclosure?.link,
          category_id: data.category_id,
        }))
      );

    await invokeLambda(
      process.env.DUPLICATE_LAMBDA_ARN!,
      "Event",
      JSON.stringify(rssData)
    );
  } catch (e) {
    return {
      statusCode: 500,
      error: e,
    };
  }
};

const rssUrls: { category_id: string; urls: string[] }[] = [
  {
    category_id: "129f20e7-c40c-4bd6-8c8c-a9a33f2fa818",
    urls: ["https://levtech.jp/media/feed/"],
  },
  {
    category_id: "c1c47fd0-974f-4d82-8fed-b773bf4f454a",
    urls: [
      "https://qiita.com/tags/キャリア/feed",
      "https://qiita.com/tags/転職/feed",
      "https://qiita.com/tags/本/feed",
      "https://qiita.com/tags/学習/feed",
      "https://qiita.com/tags/エンジニア/feed",
    ],
  },
  {
    category_id: "c76bb876-e42b-446f-b8a7-b6448c074f56",
    urls: [
      "https://zenn.dev/topics/キャリア/feed",
      "https://zenn.dev/topics/キャリアパス/feed",
      "https://zenn.dev/topics/転職/feed",
      "https://zenn.dev/topics/エンジニア転職/feed",
      "https://zenn.dev/topics/idea/feed",
      "https://zenn.dev/topics/学習/feed",
    ],
  },
  {
    category_id: "ffcdd884-2212-41bc-b01a-84d98c4cbc84",
    urls: ["https://findy-code.io/engineer-lab/rss"],
  },
];

handler().catch((e) => console.error(e));
