import React, { useState, useEffect } from 'react';
import { Activity, Briefcase, Radio, Zap } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({ total_vacancies: 0, today_vacancies: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/admin/monitoring/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Всего вакансий', value: stats.total_vacancies, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Найдено сегодня', value: stats.today_vacancies, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Активных каналов', value: '12', icon: Radio, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Аккаунтов', value: '2', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-3xl font-bold">Мониторинг</h2>
                <p className="text-slate-400">Статистика работы сервиса в реальном времени</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                        </div>
                        <div className={`${card.bg} ${card.color} p-4 rounded-xl`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div className="glass p-8 rounded-2xl border border-slate-800 h-96">
                    <h3 className="text-xl font-bold mb-6">Активность парсинга</h3>
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Интерактивный график будет здесь</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-2xl border border-slate-800 h-96">
                    <h3 className="text-xl font-bold mb-6">Последние уведомления</h3>
                    <div className="space-y-4 overflow-y-auto max-h-64 pr-4 custom-scrollbar">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                    <Zap size={16} />
                                </div>
                                <div>
                                    <p className="font-medium">Найдена вакансия: Python Developer</p>
                                    <p className="text-sm text-slate-400">Канал: Job Hunter • 2 минуты назад</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
