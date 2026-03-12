import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const Topics = () => {
    const [topics, setTopics] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        emoji: '📁',
        description: '',
        keywords: '',
        minus_words: ''
    });

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

    useEffect(() => {
        fetchTopics();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            ...formData,
            keywords: formData.keywords.split(',').map(s => s.trim()).filter(s => s),
            minus_words: formData.minus_words.split(',').map(s => s.trim()).filter(s => s)
        };
        try {
            if (editingTopic) {
                await axios.put(`/api/admin/topics/${editingTopic.id}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                await axios.post('/api/admin/topics/', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            setIsModalOpen(false);
            setEditingTopic(null);
            setFormData({ name: '', emoji: '📁', description: '', keywords: '', minus_words: '' });
            fetchTopics();
        } catch (err) {
            alert('Ошибка при сохранении тематики');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить эту тематику?')) return;
        try {
            await axios.delete(`/api/admin/topics/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchTopics();
        } catch (err) {
            alert('Ошибка при удалении');
        }
    };

    const openEdit = (topic) => {
        setEditingTopic(topic);
        setFormData({
            name: topic.name,
            emoji: topic.emoji || '📁',
            description: topic.description || '',
            keywords: topic.keywords?.join(', ') || '',
            minus_words: topic.minus_words?.join(', ') || ''
        });
        setIsModalOpen(true);
    };

    const filteredTopics = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Тематики</h2>
                    <p className="text-slate-400">Управление категориями вакансий и AI правилами</p>
                </div>
                <button 
                    onClick={() => { setEditingTopic(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                >
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
                    <div key={topic.id} className="glass p-8 rounded-3xl border border-slate-800 transition-all hover:border-indigo-500/50 group flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-5xl">{topic.emoji || '📁'}</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEdit(topic)}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(topic.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{topic.name}</h3>
                        <p className="text-slate-400 line-clamp-2 mb-6 h-12">{topic.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[50px]">
                            {topic.keywords?.slice(0, 5).map((kw, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">
                                    {kw}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 mt-auto">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{topic.channels_count || 0}</p>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Каналов</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{topic.vacancies_count || 0}</p>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Вакансий</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-slate-800 p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="mb-10">
                            <h3 className="text-3xl font-black mb-2">{editingTopic ? 'Редактировать' : 'Новая тематика'}</h3>
                            <p className="text-slate-400 font-medium">Настройте правила фильтрации для этой категории</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Emoji</label>
                                    <input 
                                        type="text" 
                                        className="input-field py-4 text-2xl text-center"
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Название</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="input-field py-4"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Краткое описание</label>
                                <textarea 
                                    className="input-field py-4 min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3 text-indigo-400">Ключевые слова (через запятую)</label>
                                <input 
                                    type="text" 
                                    placeholder="python, fastapi, remote..."
                                    className="input-field py-4"
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3 text-red-400">Минус-слова (через запятую)</label>
                                <input 
                                    type="text" 
                                    placeholder="стажировка, junior..."
                                    className="input-field py-4"
                                    value={formData.minus_words}
                                    onChange={(e) => setFormData({...formData, minus_words: e.target.value})}
                                />
                            </div>

                            <button disabled={loading} type="submit" className="w-full btn-primary py-5 text-xl font-black flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="animate-spin" /> : 'Сохранить тематику'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topics;
