import { NextResponse } from 'next/server';

export const revalidate = 3600; 

export async function GET() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ fullContent: "APIキーが設定されていません。" });
  }

  const SOURCES = [{ name: "REUTERS", url: "https://www.reutersagency.com/feed/?best-topics=business&post_type=best" }];

  try {
    const res = await fetch(SOURCES[0].url, { next: { revalidate: 3600 } });
    const xml = await res.text();
    const items = xml.split('<item>').slice(1, 5);
    
    const titles = items.map(item => {
      const match = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      return (match && match[1]) ? match[1].trim() : "";
    }).filter(t => t !== "").join('\n');

    // モデル名を 2.5-flash-lite に戻しました
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `あなたは外資系企業のシニアパートナー専属コーチです。最新ニュースから、会議で「知的で決断力がある」と思われるイディオムを1つ厳選してください。

【出力ルール：絶対厳守】
・「承知いたしました」などの挨拶や前置きは禁止。
・マークダウン（#や*）は禁止。
・以下の形式で出力してください。

💡 【Core Idiom】
イディオム名：日本語訳

📖 【Strategic Context】
解説

🎙️ 【Killer Phrase】
シチュエーションと英文と訳

ニュース：
${titles}` 
          }] 
        }]
      })
    });

    const data = await geminiRes.json();
    
    // データ構造のチェックをさらに厳密に
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
       console.error("Gemini Error Detail:", JSON.stringify(data));
       return NextResponse.json({ fullContent: "AIが内容を生成できませんでした。リロードしてください。" });
    }
    
    // イディオム名の抽出
    let idiomName = "Daily Idiom";
    const firstLine = aiText.split('\n').find((l: string) => l.includes('💡'));
    if (firstLine) {
      idiomName = firstLine.replace(/💡|【Core Idiom】|[:：]/g, '').trim();
    }

    return NextResponse.json({ 
      idiom: idiomName,
      fullContent: aiText.trim(),
      date: new Date().toLocaleDateString('ja-JP')
    });
  } catch (error) {
    return NextResponse.json({ fullContent: "ニュースの取得に失敗しました。" });
  }
}