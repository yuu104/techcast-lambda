import mysql from "mysql2/promise";
import { Podcast } from "../model/Podcast";
import { getConnectionPool } from "../utils/getConnectionPool";
import { GetRssResponseData } from "../model/Batch";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export const handler = async (event: GetRssResponseData[]): Promise<void> => {
  try {
    const pool = await getConnectionPool();
    const filteredPodcasts = await filterOutExistingLinksInDatabase(
      removeDuplicateLinksFromEvent(event),
      pool
    );

    await sendMessagesToSqs(filteredPodcasts);
  } catch (error) {
    return error;
  }
};

const sendMessagesToSqs = async (messages: GetRssResponseData[]) => {
  const sqsClient = new SQSClient({
    region: process.env.REGION,
  });

  await Promise.all(
    messages.map((message) =>
      sqsClient.send(
        new SendMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageBody: JSON.stringify(message),
        })
      )
    )
  );
};

const removeDuplicateLinksFromEvent = (
  event: GetRssResponseData[]
): GetRssResponseData[] => {
  const uniqueLinks = new Set<string>();
  return event.filter((item) => {
    if (uniqueLinks.has(item.site_url)) {
      return false; // 重複しているので除外
    }
    uniqueLinks.add(item.site_url);
    return true;
  });
};

const filterOutExistingLinksInDatabase = async (
  event: GetRssResponseData[],
  pool: mysql.Pool
): Promise<GetRssResponseData[]> => {
  const links = event.map((item) => item.site_url);
  const placeholders = links.map((_, index) => `:link${index}`).join(",");
  const query = `SELECT site_url FROM podcasts WHERE site_url IN (${placeholders})`;

  const params = links.reduce((acc, link, index) => {
    acc[`link${index}`] = link;
    return acc;
  }, {} as Record<string, string>);

  try {
    const [rows] = await pool.query<Podcast[]>(query, params);
    const existingLinks = new Set(rows.map((row) => row.site_url));
    return event.filter((item) => !existingLinks.has(item.site_url));
  } catch (error) {
    console.error("Error querying database for existing links:", error);
    throw error;
  }
};
