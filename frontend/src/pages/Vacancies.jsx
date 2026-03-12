import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Download, Search, Filter } from 'lucide-react';
import axios from 'axios';

const Vacancies = () => {
    const [vacancies, setVacancies] = useState([]);

    useEffect(() => {
        const fetchVacancies = async () => {
            try {
                const res = await axios.get('/api/admin/vacancies/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setVacancies(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchVacancies();
    }, []);

    const handleExport = () => {
        window.open('/api/admin/vacancies/export', '_blank');
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Найденные вакансии</h2>
                    <p className="text-slate-400 mt-2">Все собранные вакансии с AI обоснованием</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all"
                >
                    <Download size={20} />
                    Экспорт в CSV
                </button>
            </header>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-4.5 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по тексту вакансии..."
                        className="input-field pl-14 h-16 text-lg"
                    />
                </div>
                <button className="px-8 bg-slate-800 text-slate-200 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-3 font-bold">
                    <Filter size={20} />
                    Фильтры
                </button>
            </div>

            <div className="space-y-6">
                {vacancies.length > 0 ? vacancies.map((v) => (
                    <div key={v.id} className="glass p-8 rounded-3xl border border-slate-800 group hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold text-sm tracking-widest uppercase">
                                    {v.topic?.name || 'Без темы'}
                                </div>

                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <Calendar size={16} />
                                    {new Date(v.created_at).toLocaleString()}
                                </div>
                            </div>
                            <a 
                                href={v.message_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-3 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-2xl transition-all"
                            >
                                <ExternalLink size={20} />
                            </a>
                        </div>
                        
                        <div className="mb-6 h-32 overflow-hidden relative">
                            <p className="text-slate-200 text-lg leading-relaxed">{v.text.substring(0, 400)}...</p>
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent"></div>
                        </div>

                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 font-mono">Обоснование AI</p>
                            <p className="text-sm font-medium text-slate-300 italic">"{v.ai_reason}"</p>
                        </div>
                    </div>
                )) : (
                    <div className="glass p-20 text-center text-slate-500 rounded-3xl border border-slate-800">
                        Список вакансий пуст
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vacancies;
