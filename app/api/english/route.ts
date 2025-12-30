import { NextResponse } from 'next/server';

export const revalidate = 3600; 
const GEMINI_API_KEY = "AIzaSyBjIwB1a4IbFGWnY-foc6TebA3Wk-FWxgs";

export async function GET() {
  const SOURCES = [{ name: "REUTERS", url: "https://www.reutersagency.com/feed/?best-topics=business&post_type=best" }];

  try {
    const res = await fetch(SOURCES[0].url, { next: { revalidate: 3600 } });
    const xml = await res.text();
    const titles = xml.split('<item>').slice(1, 5).map(item => {
      const match = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      return match ? match[1].trim() : "";
    }).join('\n');

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `あなたは外資系企業のシニアパートナー専属コーチです。最新ニュースから、グローバル会議で「知的で決断力がある」と思われるイディオムを1つ厳選してください。

【出力ルール：厳守】
・「承知いたしました」「今日のイディオムは」などの挨拶・前置きは一切禁止。
・マークダウン（#や*）は使用禁止。
・以下の構成で、いきなり本題から開始してください。

💡 【Core Idiom】
(イディオム名：日本語訳)

📖 【Strategic Context】
(外資系会議での心理的効果や使い所を150字程度で濃密に)

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
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 1行目からイディオムを抽出
    const firstLine = aiText.split('\n')[1] || "";
    const idiomName = firstLine.split('：')[0].replace('💡 【Core Idiom】', '').trim();

    return NextResponse.json({ 
      idiom: idiomName || "Analysis Complete",
      fullContent: aiText.trim(),
      date: new Date().toLocaleDateString('ja-JP')
    });
  } catch {
    return NextResponse.json({ fullContent: "System initializing..." });
  }
}