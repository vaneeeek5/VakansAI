import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Trash2, Key, Phone, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Accounts = () => {
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await axios.get('/api/admin/accounts/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setAccounts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAccounts();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Аккаунты Telegram</h2>
                    <p className="text-slate-400">Управление сессиями для парсинга каналов</p>
                </div>
                <button className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                    <Key size={20} />
                    Добавить новый аккаунт
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {accounts.length > 0 ? accounts.map((acc) => (
                    <div key={acc.id} className="glass p-10 rounded-[2.5rem] border border-slate-800 transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl border-4 ${
                                    acc.is_active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    <Phone size={32} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black">{acc.phone}</p>
                                    <p className="text-slate-500 font-medium">API ID: {acc.api_id}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-tight border ${
                                    acc.is_active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-400/20'
                                }`}>
                                    {acc.is_active ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                    {acc.is_active ? 'Активен' : 'Ошибка'}
                                </span>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Добавлен 12.03.2024</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {!acc.session_string ? (
                                <button className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95">
                                    Авторизовать
                                </button>
                            ) : (
                                <div className="flex-1 px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-400" />
                                    Готов к работе
                                </div>
                            )}
                            <button className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 glass p-20 rounded-[3rem] border border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-800 rounded-full mb-6">
                            <Users size={48} className="text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-slate-300">Нет подключенных аккаунтов</h3>
                        <p className="text-slate-500 max-w-sm">Добавьте хотя бы один аккаунт Telegram для запуска автоматического парсинга вакансий</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accounts;
