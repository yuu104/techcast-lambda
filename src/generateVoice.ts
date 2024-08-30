import { invokeLambda } from "../utils/invokeLambda";
import {
  GenerateScriptResponseData,
  GenerateVoiceResponseData,
} from "../model/Batch";
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
    OutputS3KeyPrefix: process.env.S3_KEY_PREFIX!,
    Text: event.script,
    TextType: "text",
    VoiceId: "Takumi",
  });

  try {
    const response = await pollyClient.send(command);
    const s3ObjectKey = `${
      process.env.S3_KEY_PREFIX
    }${response.SynthesisTask?.OutputUri?.split("/").pop()}`;

    await invokeLambda(
      process.env.SAVE_PODCAST_LAMBDA_ARN!,
      "Event",
      JSON.stringify({
        ...event,
        audio_url: s3ObjectKey,
      } as GenerateVoiceResponseData)
    );
  } catch (e) {
    return e;
  }
};
