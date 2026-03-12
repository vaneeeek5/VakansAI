import React, { useState, useEffect } from 'react';
import { Save, Bot, BrainCircuit, Globe, Lock } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [settings, setSettings] = useState({
        ai_api_key: '',
        ai_api_base_url: '',
        ai_model: '',
        telegram_bot_token: '',
    });
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSettings(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await axios.post('/api/admin/settings/', settings, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (newPassword) {
                await axios.post('/api/admin/settings/password', { password: newPassword }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            setStatus('Настройки сохранены успешно!');
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setStatus('Ошибка при сохранении');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Настройки системы</h2>
                    <p className="text-slate-400 border-l-2 border-indigo-500 pl-4 mt-2">Конфигурация AI, Bot API и безопасности</p>
                </div>
                {status && <span className="bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-xl border border-emerald-500/20 font-bold">{status}</span>}
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* AI Configuration */}
                <div className="glass p-10 rounded-[2.5rem] border border-slate-800">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl">
                            <BrainCircuit size={24} />
                        </div>
                        <h3 className="text-2xl font-black">AI Фильтрация</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Ключ API</label>
                            <input 
                                type="password" 
                                value={settings.ai_api_key} 
                                onChange={(e) => setSettings({...settings, ai_api_key: e.target.value})}
                                className="input-field py-4" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Базовый URL</label>
                            <input 
                                type="text" 
                                value={settings.ai_api_base_url}
                                onChange={(e) => setSettings({...settings, ai_api_base_url: e.target.value})}
                                placeholder="https://api.openai.com/v1" 
                                className="input-field py-4" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Модель</label>
                            <input 
                                type="text" 
                                value={settings.ai_model}
                                onChange={(e) => setSettings({...settings, ai_model: e.target.value})}
                                className="input-field py-4" 
                            />
                        </div>
                    </div>
                </div>

                {/* Bot Configuration */}
                <div className="glass p-10 rounded-[2.5rem] border border-slate-800">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
                            <Bot size={24} />
                        </div>
                        <h3 className="text-2xl font-black">Telegram Bot</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Токен бота</label>
                            <input 
                                type="password" 
                                value={settings.telegram_bot_token} 
                                onChange={(e) => setSettings({...settings, telegram_bot_token: e.target.value})}
                                className="input-field py-4" 
                            />
                        </div>
                        <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Этот токен используется для работы бота, через который подписчики получают вакансии и управляют своими подписками.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="glass p-10 rounded-[2.5rem] border border-slate-800">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-2xl font-black">Безопасность</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Новый пароль админа</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="input-field py-4" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-12">
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Save size={24} />
                    Сохранить все настройки
                </button>
            </div>
        </div>
    );
};

export default Settings;
