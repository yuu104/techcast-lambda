import { GetArticleBodyResponseData } from "../model/Batch";
import { invokeLambda } from "../utils/invokeLambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export const handler = async (
  event: GetArticleBodyResponseData
): Promise<void> => {
  const bedrockRuntimeClient = new BedrockRuntimeClient({
    region: process.env.LAMBDA_REGION,
  });

  const promptForScript = `
    あなたはプロの編集者です。以下の記事本文を、ラジオ放送に適したスクリプトに変換してください。読み手に親しみやすく、聞き取りやすい言い回しを使用し、情報が分かりやすく伝わるようにしてください。導入部分ではリスナーの興味を引くようにし、まとめ部分では主要なポイントを簡潔に繰り返してください。スクリプト以外の内容は返答に含めないでください。

    記事本文:
    ${event.content}
  `;
  const invokeModelCommandForScript = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      max_tokens: 30000,
      anthropic_version: "bedrock-2023-05-31",
      messages: [
        { role: "user", content: [{ type: "text", text: promptForScript }] },
      ],
    }),
  });

  try {
    const scriptResponse = await bedrockRuntimeClient.send(
      invokeModelCommandForScript
    );
    const scriptResponseBody = JSON.parse(
      new TextDecoder().decode(scriptResponse.body)
    );
    const script = scriptResponseBody.content[0].text;

    const promptForDescription = `
      あなたはプロの編集者です。以下のスクリプトはラジオ放送の原稿です。100文字以内で要約してください。ラジオ番組の概要として、リスナーが内容を簡単に理解できるように、主要なポイントを簡潔にまとめてください。余計な情報は含めないでください。

      スクリプト:
      ${script}
    `;
    const invokeModelCommandForDescription = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "*/*",
      body: JSON.stringify({
        max_tokens: 30000,
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: promptForDescription }],
          },
        ],
      }),
    });
    const descriptionResponse = await bedrockRuntimeClient.send(
      invokeModelCommandForDescription
    );
    const descriptionResponseBody = JSON.parse(
      new TextDecoder().decode(descriptionResponse.body)
    );
    const description = descriptionResponseBody.content[0].text;

    await invokeLambda(
      process.env.GENERATE_VOICE_LAMBDA!,
      "Event",
      JSON.stringify({ ...event, script, description })
    );
  } catch (e) {
    throw e;
  }
};
