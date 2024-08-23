import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import mysql from "mysql2/promise";

type DbSecret = {
  username: string;
  password: string;
};

const getDbSecret = async (secretId: string): Promise<DbSecret> => {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretId,
    })
  );
  if (response.SecretString) {
    console.log("シークレット文字列");
    console.log(response.SecretString);
    return JSON.parse(response.SecretString);
  }
  throw new Error("Secret not found");
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const secretId = process.env.DB_SECRET_ID;
  const rdsHost = process.env.DB_HOST;
  const rdsPort = Number(process.env.DB_PORT);
  const newDbName = process.env.NEW_DB_NAME || "my_new_database";

  if (!secretId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "DB_SECRET_ID environment variable is not set",
      }),
    };
  }
  console.log("シークレットID");
  console.log(secretId);

  try {
    const { username, password } = await getDbSecret(secretId);
    const pool = mysql.createPool({
      host: rdsHost,
      user: username,
      password,
      port: rdsPort,
      connectionLimit: 3,
    });

    const databases = await pool.query(`SHOW DATABASES`);
    return {
      statusCode: 200,
      body: JSON.stringify(databases[0]),
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
