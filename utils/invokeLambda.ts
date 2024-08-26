import {
  InvocationType,
  InvokeCommand,
  InvokeCommandOutput,
  LambdaClient,
} from "@aws-sdk/client-lambda";

export const invokeLambda = async (
  functionName: string,
  invocationType: InvocationType,
  payload: string
): Promise<InvokeCommandOutput> => {
  const lambdaClient = new LambdaClient();
  const lambdaCommand = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: payload,
  });
  const response = await lambdaClient.send(lambdaCommand);
  return response;
};
