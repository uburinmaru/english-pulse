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
            text: `あなたはエグゼクティブ・ビジネス英語コーチです。最新ニュースから、グローバル会議で知的に聞こえる「高度な熟語・慣用句（イディオム）」を【2つ】厳選してください。

【出力ルール：絶対遵守】
・挨拶、前置きは一切禁止。
・マークダウン（#や*）は使用禁止。
・以下の構成を【2回（2つのイディオム分）】繰り返してください。
・各イディオムの区切りに「---」を入れてください。

💡 【Core Idiom】
イディオム名：日本語訳
📖 【Strategic Context】
解説（100字程度）
🎙️ 【Killer Phrase】
シチュエーションと例文と日本語訳

ニュースソース：
${titles}` 
          }] 
        }]
      })
    });

    const data = await geminiRes.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 2つのイディオムに分割
    const idioms = aiText.split('---').map(text => text.trim());

    return NextResponse.json({ 
      idioms: idioms, // 配列で返す
      date: new Date().toLocaleDateString('ja-JP')
    });
  } catch {
    return NextResponse.json({ idioms: ["System Syncing..."] });
  }
}