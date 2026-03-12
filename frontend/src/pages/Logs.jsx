import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, AlertCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/monitoring/logs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const getLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'error': return <AlertCircle size={16} className="text-red-400" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
            default: return <Info size={16} className="text-blue-400" />;
        }
    };

    const getLevelStyle = (level) => {
        switch (level.toLowerCase()) {
            case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Логи системы</h2>
                    <p className="text-slate-400">История действий и отладка работы парсера</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all active:scale-95"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    Обновить
                </button>
            </header>

            <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Terminal size={18} />
                        <span className="font-mono text-sm uppercase tracking-widest font-bold">System Output</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Показаны последние 50 записей</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-800/50 font-mono text-sm">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/20 transition-all">
                                    <td className="px-6 py-4 whitespace-nowrap w-48 text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-32">
                                        <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${getLevelStyle(log.level)}`}>
                                            {getLevelIcon(log.level)}
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 leading-relaxed">
                                        {log.message}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-20 text-center text-slate-500 italic">
                                        {loading ? 'Загрузка логов...' : 'Логов пока нет'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
