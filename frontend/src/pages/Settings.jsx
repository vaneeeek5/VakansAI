import React from 'react';
import { Save, Bot, BrainCircuit, Globe, Lock } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h2 className="text-3xl font-bold">Настройки системы</h2>
                <p className="text-slate-400 border-l-2 border-indigo-500 pl-4 mt-2">Конфигурация AI, Bot API и безопасности</p>
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
                            <input type="password" value="sk-........................" className="input-field py-4" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Базовый URL</label>
                            <input type="text" placeholder="https://api.openai.com/v1" className="input-field py-4" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Модель</label>
                            <select className="input-field py-4 appearance-none">
                                <option>gpt-4o-mini</option>
                                <option>gpt-3.5-turbo</option>
                                <option>другая модель</option>
                            </select>
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
                            <input type="password" value="123456789:ABCDEFGH..." className="input-field py-4" readOnly />
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
                            <input type="password" placeholder="••••••••" className="input-field py-4" />
                        </div>
                        <button className="w-full btn-primary py-4 text-lg font-black shadow-xl shadow-indigo-500/10">
                            Обновить пароль
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-12">
                <button className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all">
                    <Save size={24} />
                    Сохранить все настройки
                </button>
            </div>
        </div>
    );
};

export default Settings;
