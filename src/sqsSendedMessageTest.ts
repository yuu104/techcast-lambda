import {
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  SQSClient,
} from "@aws-sdk/client-sqs";

export const handler = async (): Promise<ReceiveMessageCommandOutput> => {
  const sqsCLient = new SQSClient({
    region: process.env.REGION,
  });
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
    });
    const response = await sqsCLient.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
