import { GenerateScriptResponseData } from "../model/Batch";
import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

export const handler = async (
  event: GenerateScriptResponseData
): Promise<any> => {
  const pollyClient = new PollyClient({ region: process.env.REGION });
  const command = new StartSpeechSynthesisTaskCommand({
    Engine: "standard",
    OutputFormat: "mp3",
    OutputS3BucketName: process.env.S3_BUCKET_NAME!,
    Text: event.script,
    TextType: "text",
    VoiceId: "Takumi",
  });

  try {
    const response = await pollyClient.send(command);
    return response;
  } catch (e) {
    return { e };
  }
};
