import { GetArticleBodyResponseData, GetRssResponseData } from "../model/Batch";
import { getConnectionPool } from "../utils/getConnectionPool";
import { invokeLambda } from "../utils/invokeLambda";

const readerApiEndpoint = "https://r.jina.ai";

export const handler = async (event): Promise<any> => {
  const rssResponseData = JSON.parse(
    event.Records[0].body
  ) as GetRssResponseData;

  try {
    const isDuplicate = await getIsDuplicate(rssResponseData.site_url);
    if (isDuplicate) return;

    const response = await fetch(
      `${readerApiEndpoint}/${rssResponseData.site_url}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.READER_API_KEY}`,
        },
      }
    );
    const responseData = await response.json();
    const rssDataWithContent: GetArticleBodyResponseData = {
      ...rssResponseData,
      content: responseData.data.content as string,
    };

    await invokeLambda(
      process.env.GENERATE_SCRIPT_LAMBDA_ARN!,
      "Event",
      JSON.stringify(rssDataWithContent)
    );
  } catch (e) {
    return e;
  }
};

const getIsDuplicate = async (site_url: string) => {
  console.log(site_url);
  const pool = await getConnectionPool();
  const [rows] = await pool.execute(
    "SELECT EXISTS (SELECT 1 FROM podcasts WHERE site_url = ?) AS exists_flag",
    [site_url]
  );
  return rows[0].exists_flag;
};
