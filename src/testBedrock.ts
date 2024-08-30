import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const readerApiEndpoint = "https://r.jina.ai";

export const handler = async (event: { url: string }): Promise<any> => {
  const bedrockRuntimeClient = new BedrockRuntimeClient({
    region: process.env.LAMBDA_REGION,
  });

  try {
    const content = await getContent(event.url);
    const script = await getScript(bedrockRuntimeClient, content);
    const description = await getDescription(bedrockRuntimeClient, script);

    return {
      message: "hello",
      content,
      script,
      description,
    };
  } catch (e) {
    console.log(e);
    return e;
  }
};

const getContent = async (url: string): Promise<string> => {
  const response = await fetch(`${readerApiEndpoint}/${url}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.READER_API_KEY}`,
    },
  });
  const responseData = await response.json();
  const content = responseData.data.content as string;

  return content;
};

const getScript = async (
  bedrockRuntimeClient: BedrockRuntimeClient,
  content: string
) => {
  const promptForScript = `
    あなたはプロの編集者です。以下の記事本文を、ラジオ放送に適したスクリプトに変換してください。読み手に親しみやすく、聞き取りやすい言い回しを使用し、情報が分かりやすく伝わるようにしてください。導入部分ではリスナーの興味を引くようにし、まとめ部分では主要なポイントを簡潔に繰り返してください。「みなさんこんにちは！今回は〜」からはじめてください。成果物である「スクリプト」だけ回答に含めてください。「スクリプト」などの文言も不要です。

    記事本文:
    ${content}
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

  const scriptResponse = await bedrockRuntimeClient.send(
    invokeModelCommandForScript
  );
  const scriptResponseBody = JSON.parse(
    new TextDecoder().decode(scriptResponse.body)
  );
  const script = scriptResponseBody.content[0].text;

  return script;
};

const getDescription = async (
  bedrockRuntimeClient: BedrockRuntimeClient,
  script: string
) => {
  const promptForDescription = `
      あなたはプロの編集者です。以下のスクリプトはラジオ放送の原稿です。100~200文字で要約してください。ラジオ番組の概要として、リスナーが内容を簡単に理解できるように、主要なポイントを簡潔にまとめた「紹介文」を作成してください。成果物である「紹介文」だけ回答に含めてください。「紹介文」などの文言も不要です。

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

  return description;
};
