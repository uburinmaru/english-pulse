"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/english')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
        const savedLogs = JSON.parse(localStorage.getItem('idiom_logs_v2') || '[]');
        if (data.idiom && !savedLogs.some((l: any) => l.date === data.date)) {
          const newLogs = [{ date: data.date, idiom: data.idiom }, ...savedLogs].slice(0, 7);
          setLogs(newLogs);
          localStorage.setItem('idiom_logs_v2', JSON.stringify(newLogs));
        } else {
          setLogs(savedLogs);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-[#002f6c] font-sans flex flex-col items-center selection:bg-[#d4af37] selection:text-white">
      {/* Header */}
      <header className="w-full max-w-[800px] pt-24 pb-12 px-8 flex justify-between items-end border-b-4 border-[#002f6c]">
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">ENGLISH<br/>PULSE</h1>
          <p className="text-[10px] font-bold tracking-[0.5em] uppercase mt-4 text-[#d4af37]">Global Intelligence Dashboard</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Edition 2025 // v2.5</p>
          <p className="text-sm font-bold font-mono">{content?.date || "--/--/--"}</p>
        </div>
      </header>

      <main className="w-full max-w-[800px] px-8 py-16 flex-grow">
        {loading ? (
          <div className="py-32 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] font-black tracking-[0.4em] text-zinc-300">DECODING NEWS...</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Main Content Card */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-[#d4af37] text-white text-[10px] font-black px-4 py-1 z-10">DAILY PHRASE</div>
              <div className="bg-[#fcfcfc] border-l-[12px] border-[#002f6c] p-10 md:p-16 shadow-sm">
                <div className="text-xl md:text-2xl leading-[2.4] font-bold text-zinc-800 whitespace-pre-wrap tracking-tight">
                  {content?.fullContent}
                </div>
              </div>
            </div>

            {/* Log Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs font-black tracking-[0.3em] uppercase text-[#002f6c]">Learning Log</h2>
                <div className="h-[1px] bg-zinc-100 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex flex-col p-6 border border-zinc-100 bg-white hover:border-[#d4af37] transition-all group cursor-default">
                    <span className="text-[9px] font-bold text-zinc-300 mb-2">{log.date}</span>
                    <span className="text-sm font-black text-[#002f6c] group-hover:text-[#d4af37]">{log.idiom}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full group py-8 border-2 border-[#002f6c] hover:bg-[#002f6c] hover:text-white transition-all duration-500 font-black text-xs tracking-[1em] uppercase overflow-hidden relative"
            >
              <span className="relative z-10">Sync Latest Intelligence</span>
            </button>
          </div>
        )}
      </main>

      <footer className="w-full max-w-[800px] py-12 px-8 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-300 tracking-[0.2em] uppercase">
        <span>Strategic Business English Coaching</span>
        <span>© Intelligence Pulse</span>
      </footer>
    </div>
  );
}