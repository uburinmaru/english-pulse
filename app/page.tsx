"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [idioms, setIdioms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/english')
      .then(res => res.json())
      .then(data => {
        setIdioms(data.idioms || []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      <main className="max-w-[800px] mx-auto px-6 py-16 md:py-24">
        
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic text-slate-950 mb-2 uppercase">
            English Pulse
          </h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">
            Advanced Idioms for Global Leaders
          </p>
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-300 font-bold tracking-widest text-xs">
            CULTIVATING INTELLIGENCE...
          </div>
        ) : (
          <div className="space-y-12">
            {idioms.map((content, i) => (
              <section key={i} className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 uppercase tracking-widest rounded-sm">
                    Strategic Phrase 0{i+1}
                  </span>
                </div>
                <div className="text-base md:text-lg leading-[2.2] text-slate-700 whitespace-pre-wrap font-medium">
                  {content}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-40 pt-10 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-300 tracking-widest uppercase">
          <span>Communication Excellence</span>
          <span>© 2025 EP Pulse</span>
        </footer>
      </main>
    </div>
  );
}