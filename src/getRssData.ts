import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { invokeLambda } from "../utils/invokeLambda";
import { GetRssResponseData } from "../model/Batch";

type RssResponse = {
  status: "ok" | "error";
  items: RssResponseData;
};

type RssResponseData = {
  title: string;
  link: string;
  thubnail: string;
  enclosure: {
    link: string;
  };
};

const rssToJdonApiEndpont = "https://api.rss2json.com/v1/api.json";

export const handler = async () => {
  const rssData: GetRssResponseData[] = [];
  const allUrls = rssUrls.flatMap((rssUrl) =>
    rssUrl.urls.map((url) => ({ url, category_id: rssUrl.category_id }))
  );
  try {
    const responses = await Promise.all(
      allUrls.map(({ url }) => fetch(`${rssToJdonApiEndpont}?rss_url=${url}`))
    );
    const jsonData: RssResponse[] = await Promise.all(
      responses.map((response) => response.json())
    );
    rssData.push(
      ...jsonData
        .filter((data) => data.status === "ok")
        .map((data, index) => ({
          title: data.items[0].title, // assuming 'items' is an array
          site_url: data.items[0].link,
          thubnail_url:
            data.items[0].thumbnail ?? data.items[0].enclosure?.link,
          category_id: allUrls[index].category_id,
        }))
    );

    const response = await invokeLambda(
      process.env.DUPLICATE_LAMBDA_ARN!,
      "RequestResponse",
      JSON.stringify(rssData)
    );

    return {
      statusCode: 200,
      body: JSON.parse(Buffer.from(response.Payload!).toString()),
    };
  } catch (e) {
    return {
      statusCode: 500,
      error: e,
      message: rssData,
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
