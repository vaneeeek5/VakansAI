import React, { useState, useEffect } from 'react';
import { Radio, Search, ExternalLink, UserMinus, PlusCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        topic_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [chanRes, topicRes] = await Promise.all([
                axios.get('/api/admin/channels/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.get('/api/admin/topics/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);
            setChannels(chanRes.data);
            setTopics(topicRes.data);
            if (topicRes.data.length > 0) {
                setFormData(prev => ({ ...prev, topic_id: topicRes.data[0].id }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Backend ChannelCreate might expect more fields if initialized with default id=0, 
            // but let's assume it handles partial data or we use the username/link.
            // Looking at schemas.py: ChannelCreate(ChannelBase) which has id, title, username, link, topic_id.
            // Usually id is assigned by DB, so we might need a separate schema for creation or handle id on FE.
            // Assuming backend handles it.
            await axios.post('/api/admin/channels/', {
                id: 0, // Placeholder if required
                username: formData.username.replace('@', ''),
                topic_id: parseInt(formData.topic_id),
                is_joined: false
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setIsModalOpen(false);
            setFormData(prev => ({ ...prev, username: '' }));
            fetchData();
        } catch (err) {
            alert('Ошибка при добавлении канала. Убедитесь, что ID/Username корректны.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Отключить этот канал?')) return;
        try {
            await axios.delete(`/api/admin/channels/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchData();
        } catch (err) {
            alert('Ошибка при удалении');
        }
    };

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
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
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
                                            {channel.title?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{channel.title || 'Загрузка...'}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                @{channel.username} <ExternalLink size={12} />
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
                                        {channel.topic?.name || 'Общий'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center font-bold text-slate-200">
                                    {channel.members_count?.toLocaleString() || '0'}
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
                                    <button 
                                        onClick={() => handleDelete(channel.id)}
                                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                                    >
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] border border-slate-800 p-10 relative shadow-2xl">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="mb-10">
                            <h3 className="text-3xl font-black mb-2">Добавить канал</h3>
                            <p className="text-slate-400 font-medium">Введите username или ссылку на канал</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Username канала</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="python_jobs" 
                                    className="input-field py-4"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Привязать к тематике</label>
                                <select 
                                    className="input-field py-4"
                                    value={formData.topic_id}
                                    onChange={(e) => setFormData({...formData, topic_id: e.target.value})}
                                >
                                    {topics.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button disabled={submitting} type="submit" className="w-full btn-primary py-5 text-xl font-black flex items-center justify-center gap-3">
                                {submitting ? <Loader2 className="animate-spin" /> : 'Добавить канал'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Channels;

export default Channels;
