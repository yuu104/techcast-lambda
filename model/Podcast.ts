import { RowDataPacket } from "mysql2";

export interface Podcast extends RowDataPacket {
  id: string;
  title: string;
  site_url: string;
  description: string;
  audio_url: string;
  duration: number;
  script: string;
  thumbnail_url: string;
  category_id: string;
}
