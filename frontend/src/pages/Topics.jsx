import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import axios from 'axios';

const Topics = () => {
    const [topics, setTopics] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('/api/admin/topics/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setTopics(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTopics();
    }, []);

    const filteredTopics = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Тематики</h2>
                    <p className="text-slate-400">Управление категориями вакансий и AI правилами</p>
                </div>
                <button className="btn-primary flex items-center gap-2 px-6 py-3">
                    <Plus size={20} />
                    Добавить тематику
                </button>
            </header>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        className="input-field pl-12 h-14"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                    <div key={topic.id} className="glass p-8 rounded-3xl border border-slate-800 transition-all hover:border-indigo-500/50 group">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-5xl">{topic.emoji || '📁'}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white">
                                    <Edit2 size={18} />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{topic.name}</h3>
                        <p className="text-slate-400 line-clamp-2 mb-6 h-12">{topic.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[50px]">
                            {topic.keywords?.slice(0, 3).map((kw, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">
                                    {kw}
                                </span>
                            ))}
                            {topic.keywords?.length > 3 && (
                                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">
                                    +{topic.keywords.length - 3}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 mt-auto">
                            <div className="text-center">
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Каналов</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">148</p>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Вакансий</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Topics;
