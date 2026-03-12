import React, { useState, useEffect } from 'react';
import { Radio, Search, ExternalLink, UserMinus, PlusCircle } from 'lucide-react';
import axios from 'axios';

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await axios.get('/api/admin/channels/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setChannels(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Каналы</h2>
                    <p className="text-slate-400 border-l-2 border-indigo-500 pl-4 mt-2">Источники вакансий и статус подключения</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition-all">
                        Найти новые каналы
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <PlusCircle size={20} />
                        Добавить вручную
                    </button>
                </div>
            </header>

            <div className="glass overflow-hidden rounded-3xl border border-slate-800">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 border-b border-slate-800">
                        <tr>
                            <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Канал</th>
                            <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest">Тематика</th>
                            <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest text-center">Участники</th>
                            <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest text-center">Статус</th>
                            <th className="px-8 py-6 text-slate-400 font-bold uppercase text-xs tracking-widest text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {channels.length > 0 ? channels.map((channel) => (
                            <tr key={channel.id} className="hover:bg-slate-800/30 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl uppercase">
                                            {channel.title?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{channel.title}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                @{channel.username} <ExternalLink size={12} />
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
                                        Разработка ПО
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center font-bold text-slate-200">
                                    {channel.members_count?.toLocaleString() || '1.2k'}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
                                        channel.is_joined 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                        {channel.is_joined ? 'Вступили' : 'Ожидание'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
                                        <UserMinus size={20} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-slate-500">
                                    {loading ? 'Загрузка...' : 'Список каналов пуст'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Channels;
