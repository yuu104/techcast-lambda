import { Pool } from "mysql2";
import { GenerateVoiceResponseData } from "../model/Batch";
import { getConnectionPool } from "../utils/getConnectionPool";
import { v4 as uuidv4 } from "uuid";

export const handler = async (
  event: GenerateVoiceResponseData
): Promise<void> => {
  const {
    title,
    site_url,
    description,
    audio_url,
    script,
    thumbnail_url,
    category_id,
  } = event;

  try {
    const pool = await getConnectionPool();
    await pool.execute(
      "INSERT INTO podcasts (id, title, site_url, description, audio_url, script, thumbnail_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        title,
        site_url,
        description,
        audio_url,
        script,
        thumbnail_url,
        category_id,
      ]
    );
  } catch (e) {
    return e;
  }
};
