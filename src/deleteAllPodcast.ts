import { Context, APIGatewayProxyResult } from "aws-lambda";
import { getConnectionPool } from "../utils/getConnectionPool";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const pool = await getConnectionPool();
    await pool.execute("DELETE FROM podcasts");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "podcasts is deleted" }),
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
