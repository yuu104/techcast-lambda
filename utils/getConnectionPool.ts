import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import mysql from "mysql2/promise";

export const getConnectionPool = async () => {
  const secretId = process.env.DB_SECRET_ID!;
  const rdsHost = process.env.DB_HOST;
  const rdsPort = Number(process.env.DB_PORT);

  const { username, password } = await getDbSecret(secretId);
  const pool = mysql.createPool({
    host: rdsHost,
    user: username,
    password,
    port: rdsPort,
    database: "techcast",
    connectionLimit: 3,
    namedPlaceholders: true,
  });

  return pool;
};

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
    return JSON.parse(response.SecretString);
  }
  throw new Error("Secret not found");
};
