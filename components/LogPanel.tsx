import React, { useState, useEffect, useRef } from 'react';
import { Activity, Menu, Eraser, Copy } from 'lucide-react';
import { LogEntry } from '../types';

interface LogPanelProps {
    logs: LogEntry[];
    onClearLogs: () => void;
    onCopyLogs: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs, onCopyLogs }) => {
    const [logViewMode, setLogViewMode] = useState<'transparent' | 'clipped'>('clipped');   
    const [showErrorDict, setShowErrorDict] = useState(false);
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // === MESIN AUTO-SCROLL REAL-TIME ===
    // Setiap kali ada log baru masuk, layar otomatis gulung ke bawah!
    useEffect(() => {
        if (logsContainerRef.current && !showErrorDict) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs, logViewMode, showErrorDict]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide leading-none">System Logs</h2>
            </div>
            
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full h-[46px]">
                <button
                    onClick={() => setShowErrorDict(!showErrorDict)}
                    title="Info Makna Kode Error"
                    className={`w-10 flex items-center justify-center shrink-0 rounded-md transition-none ${
                        showErrorDict ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-200'
                    }`}
                >
                    <Menu size={18} />
                </button>
                <button
                    onClick={() => { setLogViewMode('clipped'); setShowErrorDict(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-none ${
                        logViewMode === 'clipped' && !showErrorDict ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                    }`}
                >
                    Clipped
                </button>
                <button
                    onClick={() => { setLogViewMode('transparent'); setShowErrorDict(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-none ${
                        logViewMode === 'transparent' && !showErrorDict ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                    }`}
                >
                    Transparent
                </button>
            </div>

            <div className={`relative flex h-[500px] shrink-0 flex-col overflow-hidden rounded-lg border mt-2 ${
                showErrorDict 
                    ? 'bg-amber-50 border-amber-200 shadow-sm'
                    : logViewMode === 'transparent' 
                        ? 'bg-white/40 backdrop-blur-md border-blue-200/60 shadow-none' 
                        : 'bg-white border-blue-200 shadow-sm'
            }`}>
                {showErrorDict ? (
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-200/50">
                        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-4 border-b border-amber-200 pb-2">Kamus Kode Error API</h3>
                        <div className="flex flex-col gap-3 text-xs text-gray-700">
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 400 (Bad Request)</span>
                                <p className="mt-1"><b>Penyebab:</b> File tidak didukung, resolusi gambar/video kebesaran, atau teks terlalu panjang/melanggar format sistem.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 401 (Unauthorized)</span>
                                <p className="mt-1"><b>Penyebab:</b> API Key salah ketik, kedaluwarsa, ditarik dari Google AI Studio, atau belum diisi.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 403 (Forbidden)</span>
                                <p className="mt-1"><b>Penyebab:</b> Kunci valid tapi tidak punya izin akses ke model tersebut, atau IP wilayah terblokir.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 404 (Not Found)</span>
                                <p className="mt-1"><b>Penyebab:</b> Nama model salah ketik (typo) atau model sudah dihapus/dinonaktifkan oleh Google.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-orange-600 text-sm">Error 429 (Quota Exceeded / Limit)</span>
                                <p className="mt-1"><b>Penyebab:</b> Terlalu banyak request dalam 1 menit, atau jatah gratis harian habis. Sistem akan otomatis memindahkan kunci ke kotak istirahat selama 60 detik.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 500 (Internal Server Error)</span>
                                <p className="mt-1"><b>Penyebab:</b> Bukan salah aplikasi kita. Server pusat Google sedang <i>down</i> atau error memproses file. Tunggu dan coba lagi.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Error 503 / 504 (Timeout)</span>
                                <p className="mt-1"><b>Penyebab:</b> Server Google kepenuhan (jam sibuk) atau file video/gambar terlalu berat sehingga koneksi diputus otomatis.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <span className="font-black text-red-600 text-sm">Network Error / Fetch Failed</span>
                                <p className="mt-1"><b>Penyebab:</b> Koneksi internet putus, atau VPN/Proxy/DNS komputer memblokir jalur ke server.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex shrink-0 border-b border-gray-100 divide-x divide-gray-100 bg-white/50 backdrop-blur-sm">
                            <button onClick={onClearLogs} className="flex-1 flex items-center justify-center gap-2 bg-red-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100"><Eraser size={14} /> CLEAR LOGS</button>
                            <button onClick={onCopyLogs} className="flex-1 flex items-center justify-center gap-2 bg-blue-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-600 transition-colors hover:bg-blue-100"><Copy size={14} /> COPY LOGS</button>
                        </div>
                        <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200/50">
                            {logs.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400 opacity-40">
                                    <Activity size={32} /> <p>No logs found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {logs.map(log => (
                                        <div key={log.id} className="flex items-start gap-2 break-all border-b border-gray-50/50 pb-1 last:border-0">
                                            {/* === RUMUS WARNA TAG DI SINI === */}
                                            <span className={`mt-0.5 shrink-0 rounded px-1.5 text-[10px] font-black uppercase tracking-widest ${
                                                log.mode === 'system' 
                                                ? 'bg-gray-100/80 text-gray-500 border border-gray-200' 
                                                : log.mode === 'quran'
                                                    ? 'bg-emerald-50/80 text-emerald-600 border border-emerald-200'
                                                    : 'bg-blue-50/80 text-blue-600 border border-blue-200'
                                            }`}>
                                                {log.mode?.substring(0,4)}
                                            </span>
                                            {/* ================================ */}
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <span className="font-mono text-[10px] text-gray-400/80">{log.time}</span>
                                                <span className={`text-xs ${log.type === 'error' ? 'text-red-600 font-bold' : log.type === 'success' ? 'text-green-600 font-semibold' : log.type === 'warning' ? 'text-orange-600 font-semibold' : 'text-gray-700'} ${logViewMode === 'clipped' ? 'line-clamp-2 overflow-hidden' : 'break-words whitespace-pre-wrap'}`}>
                                                    {log.message}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LogPanel;
