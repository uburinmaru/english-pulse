"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/english')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
        const saved = JSON.parse(localStorage.getItem('english_pulse_v2') || '[]');
        if (resData.title && !saved.some((l: any) => l.content === resData.content)) {
          const updated = [resData, ...saved].slice(0, 15);
          setLogs(updated);
          localStorage.setItem('english_pulse_v2', JSON.stringify(updated));
        } else { setLogs(saved); }
      }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 font-sans selection:bg-blue-100">
      <main className="max-w-[850px] mx-auto px-8 py-20 md:py-32">
        
        <header className="mb-24 border-l-4 border-blue-600 pl-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic text-slate-950 mb-4 uppercase">
            English Pulse
          </h1>
          <p className="text-[11px] font-bold tracking-[0.6em] text-slate-400 uppercase">
            Global Leadership Communication // Dashboard
          </p>
        </header>

        {/* Current Phrase Card */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-8">
            <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-full">Daily Intelligence</span>
            <span className="text-xs font-bold text-slate-300">{data?.date}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-10 md:p-16 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-shadow duration-500">
            {loading ? (
              <div className="py-20 text-center animate-pulse text-slate-200 font-black tracking-widest text-xs uppercase">Refining phrase...</div>
            ) : (
              <div className="text-lg md:text-xl leading-[2.4] text-slate-700 whitespace-pre-wrap font-medium">
                {data?.content}
              </div>
            )}
          </div>
        </section>

        {/* Logs Section */}
        <section>
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-xs font-black tracking-[0.4em] text-slate-300 uppercase italic">Archive Logs</h2>
            <div className="h-[1px] flex-grow bg-slate-100"></div>
          </div>
          
          <div className="grid gap-4">
            {logs.map((log, i) => (
              <details key={i} className="group bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none select-none">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                    <span className="text-[10px] font-bold font-mono text-slate-300 uppercase">{log.date}</span>
                    <span className="text-sm font-black text-slate-800 group-open:text-blue-600 transition-colors uppercase tracking-tight">
                      {log.title}
                    </span>
                  </div>
                  <span className="text-slate-200 text-xs group-open:rotate-180 transition-transform font-bold">▼</span>
                </summary>
                <div className="px-10 pb-12 md:px-20 md:pb-16 pt-2 text-slate-500 leading-relaxed text-base whitespace-pre-wrap border-t border-slate-50">
                  {log.content}
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-48 text-center border-t border-slate-100 pt-20">
          <p className="text-[10px] font-black text-slate-200 tracking-[0.8em] uppercase italic mb-4">Master the Language of Decision</p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Communication Excellence Pulse</p>
        </footer>
      </main>
    </div>
  );
}