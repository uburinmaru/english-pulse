import { NextResponse } from 'next/server';

export const revalidate = 3600; 

export async function GET() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ fullContent: "API Key is missing in Vercel settings." });
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

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `あなたは外資系企業のシニアパートナー専属コーチです。最新ニュースから、グローバル会議で「知的で決断力がある」と思われるイディオムを1つ厳選してください。

【出力ルール：厳守】
・挨拶・前置きは一切禁止。
・マークダウン（#や*）は使用禁止。
・以下の構成で、いきなり本題から開始してください。

💡 【Core Idiom】
(イディオム名：日本語訳)

📖 【Strategic Context】
(外資系会議での心理的効果や使い所を150字程度で詳細に)

🎙️ 【Killer Phrase】
(シチュエーション説明)
「実際の英文」
(日本語訳)

ニュース：
${titles}` 
          }] 
        }]
      })
    });

    const data = await geminiRes.json();
    
    if (data.error) {
      return NextResponse.json({ fullContent: `API Error: ${data.error.message}` });
    }

    const aiText = (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) || "";
    
    const lines = aiText.split('\n');
    const idiomLine = lines.find(l => l.includes('💡')) || "";
    const idiomName = idiomLine.split('】')[1]?.split('(')[0]?.trim() || "Daily Idiom";

    return NextResponse.json({ 
      idiom: idiomName,
      fullContent: aiText.trim(),
      date: new Date().toLocaleDateString('ja-JP')
    });
  } catch {
    // (err) を削除することで、未使用変数エラーを回避
    return NextResponse.json({ fullContent: "Failed to fetch or analyze news." });
  }
}