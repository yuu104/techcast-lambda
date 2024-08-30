import { Context, APIGatewayProxyResult } from "aws-lambda";
import { getConnectionPool } from "../utils/getConnectionPool";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const pool = await getConnectionPool();

    for (const podcast of seedData) {
      await pool.execute(
        "INSERT INTO podcasts (id, title, site_url, description, audio_url, script, thumbnail_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          podcast.id,
          podcast.title,
          podcast.site_url,
          podcast.description,
          podcast.audio_url,
          podcast.script,
          podcast.thumbnail_url,
          podcast.category_id,
        ]
      );
    }

    const [podcastRows] = await pool.execute("SELECT * FROM podcasts");

    return {
      statusCode: 200,
      body: JSON.stringify({ podcasts: podcastRows }),
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

const seedData = [
  {
    id: "record1",
    title:
      "「コード全捨て」で覚悟が決まった。Bill Oneチームが“売れない新規事業”を脱却した方法",
    site_url: "https://levtech.jp/media/article/interview/detail_487/",
    description:
      "新規プロダクト「Bill One」の開発初期、売れない状況に苦しんでいたチームが、大西VPoEのリーダーシップのもと、2度のピボットや大胆な「コード全捨て」の決断を経て、プロダクトを軌道に乗せた経緯を紹介する記事です。Bill Oneの成功の裏にある戦略的な意思決定やチームの成長過程が詳細に描かれています。",
    audio_url: "voice/20240826_081821_6I7VYJYAGFAGOW5M_episode.mp3",
    script:
      "こんにちは、皆さん！今日のラジオでは、Sansan社の新規プロダクト「Bill One」にまつわる興味深いストーリーをご紹介します。この「Bill One」、実は開発当初、なかなか売れずに苦戦していたんです。新しいプロダクトが成功するまでには、いろいろなドラマがあるものですね。  さて、この「Bill One」がどうやって今の成功を掴んだのか、そこには大西VPoEのリーダーシップと、チームの奮闘が大きく影響しているんです。大西さんがチームに加わったのは、まさに開発が行き詰まっていた時期。彼はなんと、これまで書いてきたコードを全部捨てるという大胆な決断を下したんです！ええ、全部です。これは本当に勇気のいる決断だったと思います。  その後も、チームは二度のピボットを経て、最終的に「請求書の受け取り」をオンラインで一元化するというコンセプトにたどり着きました。そして、この新しいコンセプトに基づいて再開発された「Bill One」は、短期間で多くの企業に採用され、大成功を収めました。  このストーリーからわかるのは、成功するプロダクトを作るには、時に大胆な意思決定が必要だということ。そして、チーム全員が一丸となって努力することで、どんな困難も乗り越えられるということですね。  それでは、今日のラジオはここまで。次回もお楽しみに！",
    thumbnail_url:
      "https://levtech.jp/media/wp-content/uploads/2024/07/240719_lab_eyecatch_interview_168.jpg",
    category_id: "129f20e7-c40c-4bd6-8c8c-a9a33f2fa818",
  },
  {
    id: "record2",
    title:
      "障害対応を属人化させない。「全員インシデントコマンダー」体制を根付かせた、山本五十六の格言【NewsPicks SRE 安藤裕紀】",
    site_url: "https://levtech.jp/media/article/interview/detail_506/",
    description:
      "今回の放送では、NewsPicks事業のSREチームリーダー、安藤裕紀さんが取り組む「全員がインシデントコマンダーとして動ける組織作り」について紹介しました。特定のメンバーに障害対応が集中していた課題を解決するため、安藤さんは全員が対応指揮を執れる体制を構築。自ら実践し、ドキュメント化し、メンバーに挑戦させることで成功を収めました。この取り組みにより、チーム全体が支え合う強い組織が形成されています。",
    audio_url: "voice/audio-a5db1330-a75f-48f8-b461-29ca3baf6687.mp3",
    script:
      "こんにちは、今日もお耳をお貸しくださりありがとうございます。今回はエンジニアの皆さんにとって興味深い話題をお届けします。「全員がインシデントコマンダーとして動ける組織作り」という挑戦についてです。リーダーの一部の人に頼り切ってしまうことに課題を感じている方も多いかもしれませんね。そこで、NewsPicks事業のSREチームリーダー、安藤裕紀さんが率いるチームの取り組みをご紹介します。全員が「インシデントコマンダー」として動ける組織を目指しているんです。一体どうやってその体制を作り上げたのか、詳しくお伝えします。 さて、安藤さんがこの体制を目指したきっかけですが、そもそも障害対応が特定のメンバーに偏っていたことが問題だったんです。エンジニアが70名もいる組織で、24時間365日の体制を整えていたものの、実際には数人に負担が集中してしまっていました。これが続くうちに、障害発生件数が増加し、事態はさらに悪化。そこで安藤さんは、「インシデントコマンダー」という役割に目を付けたんです。  インシデントコマンダーとは、障害発生時に対応を指揮し、関係者とのコミュニケーションをとりつつ、問題解決に導く役割です。安藤さんはこの役割が、組織全体で共有できると考えました。どのメンバーも、技術の深い理解がなくても、適切に指揮を執ることができる。つまり、仕組み化さえできれば、誰もがこの役割を果たせるというわけです。  そこでまず安藤さんは、自らインシデントコマンダーとしての動きを「見せる」ことから始めました。ただ見せるだけではなく、役割や流れをまとめたドキュメントを用意し、いつでも参照できるようにしたんです。その後、月次ミーティングで全員にその動きを説明し、「これならできる」と思ってもらうことを目指しました。  次に、「させてみる」段階です。安藤さんの取り組みが功を奏し、何人かのメンバーが自発的にインシデントコマンダーとして動いてくれました。最初は難しく感じたメンバーも、実際にやってみるとその感覚が変わり、次々に挑戦するようになったのです。そして、「誉める」ことも忘れず、障害対応に取り組んだメンバーを積極的に称賛し、モチベーションを高めるようにしました。 さて、ここまでお話ししてきたように、「全員がインシデントコマンダー」という組織作りは、安藤さんの地道な取り組みと、メンバーを巻き込む工夫によって進められてきました。ポイントは、やってみせて、言って聞かせて、そして実際にやらせること。その上で、結果を称賛することが成功の鍵でした。これにより、特定のメンバーに頼らず、全員で支え合う体制が少しずつ形になっています。 今日は、障害対応における新たなアプローチについてご紹介しました。リーダーシップを共有し、チーム全体の力を引き出すための工夫が詰まっていましたね。次回もお楽しみに！",
    thumbnail_url:
      "https://levtech.jp/media/wp-content/uploads/2024/08/levtechlab_Incident-commander_thumbnail.png",
    category_id: "129f20e7-c40c-4bd6-8c8c-a9a33f2fa818",
  },
];
