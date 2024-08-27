import { GetArticleBodyResponseData, GetRssResponseData } from "../model/Batch";
import { invokeLambda } from "../utils/invokeLambda";

const readerApiEndpoint = "https://r.jina.ai";

export const handler = async (event: GetRssResponseData): Promise<any> => {
  try {
    const response = await fetch(`${readerApiEndpoint}/${event.site_url}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.READER_API_KEY}`,
      },
    });
    const responseData = await response.json();
    const rssDataWithContent: GetArticleBodyResponseData = {
      ...event,
      content: responseData.data.content as string,
    };

    await invokeLambda(
      process.env.GENERATE_SCRIPT_LAMBDA_ARN!,
      "RequestResponse",
      JSON.stringify(rssDataWithContent)
    );
  } catch (e) {
    throw e;
  }
};
