import { Context, APIGatewayProxyResult } from "aws-lambda";
import { getConnectionPool } from "../utils/getConnectionPool";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const pool = await getConnectionPool();

    const [rows] = await pool.execute("SELECT * FROM podcasts_categories");

    return {
      statusCode: 200,
      body: JSON.stringify(rows, null, 2),
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
