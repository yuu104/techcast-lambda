import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { SecretsManager } from "aws-sdk";
import mysql from "mysql2/promise";

type DbSecret = {
  username: string;
  password: string;
  host: string;
  port: number;
};

const secretsManager = new SecretsManager();

const getDbSecret = async (secretId: string): Promise<DbSecret> => {
  const data = await secretsManager
    .getSecretValue({ SecretId: secretId })
    .promise();
  if (data.SecretString) {
    return JSON.parse(data.SecretString);
  }
  throw new Error("Secret not found");
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const secretId = process.env.DB_SECRET_ID;
  const newDbName = process.env.NEW_DB_NAME || "my_new_database";

  if (!secretId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "DB_SECRET_ID environment variable is not set",
      }),
    };
  }

  try {
    const { host, username, password, port } = await getDbSecret(secretId);
    const pool = mysql.createPool({
      host,
      user: username,
      password,
      connectionLimit: 3,
    });

    await pool.query(`CREATE DATABASE IF NOT EXISTS ${newDbName}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Database ${newDbName} created successfully`,
      }),
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
