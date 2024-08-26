import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getConnectionPool } from "../utils/getConnectionPool";
import { v4 as uuidv4 } from "uuid";

const seedData = [
  {
    id: uuidv4(),
    name: "レバテックラボ（レバテックLAB）",
    site_url: "https://levtech.jp/media",
    description: "レバテックラボ｜キャリアと技術の可能性が見つかるメディア",
  },
  {
    id: uuidv4(),
    name: "Findy Engineer Lab",
    site_url: "https://findy-code.io/engineer-lab",
    description: "エンジニアのちょい先を考えるメディア",
  },
  {
    id: uuidv4(),
    name: "Zenn",
    site_url: "https://zenn.dev",
    description: "エンジニアのための情報共有コミュニティ",
  },
  {
    id: uuidv4(),
    name: "Qiita",
    site_url: "https://qiita.com",
    description: "エンジニアに関する知識を記録・共有するためのサービス",
  },
];

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const pool = await getConnectionPool();

    for (const data of seedData) {
      await pool.execute(
        "INSERT INTO podcasts_categories (id, name, site_url, description) VALUES (:id, :name, :site_url, :description)",
        data
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Inserted seed data" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating database",
        error: (error as Error).message,
      }),
    };
  }
};
