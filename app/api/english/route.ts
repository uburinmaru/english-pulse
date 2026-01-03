import { NextResponse } from 'next/server';

export const revalidate = 3600; 

export async function GET() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return NextResponse.json({ fullContent: "Key Missing" });

  const SOURCES = [{ name: "REUTERS", url: "https://www.reutersagency.com/feed/?best-topics=business&post_type=best" }];

  try {
    const res = await fetch(SOURCES[0].url, { next: { revalidate: 3600 } });
    const xml = await res.text();
    const titles = xml.split('<item>').slice(1, 10).map(item => {
      const match = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      return match ? match[1].trim() : "";
    }).join('\n');

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `あなたはシニア・ビジネス英語コーチです。
最新のビジネスニュースを踏まえ、グローバル会議で自分の意見を通したり、議論を整理したりする際に使える「非常に実用的で知的なイディオム」を1つ厳選してください。

【出力ルール：絶対遵守】
・挨拶、前置き、マークダウン（#や*）は一切禁止。
・1行目は【Core Idiom】イディオム名：日本語訳
・2行目以降に「📖 文化的・戦略的背景」「🎙️ 会議での活用例」を記述。

ニュース：
${titles}` 
          }] 
        }]
      })
    });

    const data = await geminiRes.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return NextResponse.json({ 
      content: aiText.trim(),
      date: new Date().toLocaleDateString('ja-JP'),
      title: aiText.split('\n')[0]?.replace('【Core Idiom】', '').trim() || "Strategy Phrase"
    });
  } catch {
    return NextResponse.json({ content: "Syncing latest business intelligence..." });
  }
}