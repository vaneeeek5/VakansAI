import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Trash2, Key, Phone, CheckCircle2, Users, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const Accounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Code
    const [loading, setLoading] = useState(false);
    const [currentAccId, setCurrentAccId] = useState(null);
    const [phoneCodeHash, setPhoneCodeHash] = useState('');
    
    const [formData, setFormData] = useState({
        phone: '',
        api_id: '',
        api_hash: ''
    });
    const [otpCode, setOtpCode] = useState('');

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

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleAddAccount = async (method) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/accounts/', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentAccId(res.data.id);
            
            if (method === 'qr') {
                startQRLogin(res.data.id);
                setLoading(false);
            } else {
                const codeRes = await axios.post(`/api/admin/accounts/${res.data.id}/send-code`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setPhoneCodeHash(codeRes.data.phone_code_hash);
                setStep(2);
                setLoading(false);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Ошибка при добавлении аккаунта';
            alert(`Ошибка: ${msg}`);
            setLoading(false);
        }
    };
    
    const startQRLogin = (accountId) => {
        setStep(3);
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socketUrl = `${protocol}//${window.location.host}/api/admin/accounts/${accountId}/qr`;
        const socket = new WebSocket(socketUrl);
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'qr_url') {
                setQrUrl(data.url);
            } else if (data.type === 'success') {
                alert('Успешная авторизация!');
                setIsModalOpen(false);
                setStep(1);
                setFormData({ phone: '', api_id: '', api_hash: '' });
                fetchAccounts();
                socket.close();
            } else if (data.type === '2fa_required') {
                alert('Требуется облачный пароль 2FA! Пожалуйста, временно отключите его в настройках Telegram или используйте вход по СМС.');
                socket.close();
                setIsModalOpen(false);
            } else if (data.type === 'error') {
                alert(`Ошибка: ${data.message}`);
                socket.close();
                setIsModalOpen(false);
            }
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            alert('Ошибка соединения с сервером при генерации QR');
            setIsModalOpen(false);
        };
        
        setWs(socket);
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`/api/admin/accounts/${currentAccId}/signin`, {
                code: otpCode,
                phone_code_hash: phoneCodeHash
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setIsModalOpen(false);
            setStep(1);
            setFormData({ phone: '', api_id: '', api_hash: '' });
            setOtpCode('');
            fetchAccounts();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Неверный код или ошибка сервера';
            alert(`Ошибка авторизации: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот аккаунт?')) return;
        try {
            await axios.delete(`/api/admin/accounts/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAccounts();
        } catch (err) {
            alert('Ошибка при удалении');
        }
    };

    const handleAuthorizeExisting = async (acc) => {
        setCurrentAccId(acc.id);
        setIsModalOpen(true);
        startQRLogin(acc.id);
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Аккаунты Telegram</h2>
                    <p className="text-slate-400">Управление сессиями для парсинга каналов</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
                >
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
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 font-mono">
                                    {new Date(acc.created_at || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {!acc.session_string ? (
                                <button 
                                    onClick={() => handleAuthorizeExisting(acc)}
                                    className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95"
                                >
                                    Авторизовать
                                </button>
                            ) : (
                                <div className="flex-1 px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-400" />
                                    Готов к работе
                                </div>
                            )}
                            <button 
                                onClick={() => handleDelete(acc.id)}
                                className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 glass p-20 rounded-[3rem] border border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-800 rounded-full mb-6 text-slate-600">
                            <Users size={48} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-slate-300">Нет подключенных аккаунтов</h3>
                        <p className="text-slate-500 max-w-sm">Добавьте хотя бы один аккаунт Telegram для запуска автоматического парсинга вакансий</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] border border-slate-800 p-10 relative shadow-2xl overflow-hidden">
                        <button 
                            onClick={() => { ws?.close(); setIsModalOpen(false); setStep(1); }}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="mb-10">
                            <h3 className="text-3xl font-black mb-2">
                                {step === 1 ? 'Новый аккаунт' : 'Подтверждение'}
                            </h3>
                            <p className="text-slate-400 font-medium">
                                {step === 1 ? 'Введите данные вашего API приложения' : 'Введите код из Telegram'}
                            </p>
                        </div>

                        {step === 1 && (
                            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Номер телефона</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="+79991234567" 
                                        className="input-field py-4"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">API ID</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="123456" 
                                            className="input-field py-4"
                                            value={formData.api_id}
                                            onChange={(e) => setFormData({...formData, api_id: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">API Hash</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="abc123..." 
                                            className="input-field py-4"
                                            value={formData.api_hash}
                                            onChange={(e) => setFormData({...formData, api_hash: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs text-slate-400 leading-relaxed italic">
                                    Данные можно получить на my.telegram.org. Сервис использует эти данные только для подключения сессии.
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        disabled={loading} 
                                        type="button" 
                                        onClick={() => {
                                            if (!formData.phone || !formData.api_id || !formData.api_hash) return alert('Заполните все поля');
                                            handleAddAccount('sms');
                                        }}
                                        className="w-full btn-secondary py-4 font-black flex items-center justify-center gap-3">
                                        Войти по СМС
                                    </button>
                                    <button 
                                        disabled={loading} 
                                        type="button" 
                                        onClick={() => {
                                            if (!formData.phone || !formData.api_id || !formData.api_hash) return alert('Заполните все поля');
                                            handleAddAccount('qr');
                                        }}
                                        className="w-full btn-primary py-4 font-black shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin" /> : 'Вход по QR-коду'}
                                    </button>
                                </div>
                            </form>
                        )}
                        {step === 2 && (
                            <form onSubmit={handleVerifyCode} className="space-y-8 text-center">
                                <div>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Код из СМС" 
                                        className="input-field py-6 text-3xl font-black tracking-[0.5em] text-center"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-slate-400">Код отправлен в официальное приложение Telegram на вашем устройстве.</p>
                                <button disabled={loading} type="submit" className="w-full btn-primary py-5 text-xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3">
                                    {loading ? <Loader2 className="animate-spin" /> : 'Подтвердить вход'}
                                </button>
                            </form>
                        )}
                        {step === 3 && (
                            <div className="flex flex-col items-center space-y-6">
                                <h4 className="text-xl font-bold">Отсканируйте код через приложение Telegram</h4>
                                <p className="text-slate-400 text-center text-sm">Настройки -&gt; Устройства -&gt; Подключить устройство</p>
                                
                                {qrUrl ? (
                                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10 scale-105">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`} alt="Telegram QR Login" className="w-64 h-64" />
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center bg-slate-800 rounded-2xl animate-pulse">
                                        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
                                    </div>
                                )}
                                <div className="text-center mt-4">
                                    <Loader2 className="animate-spin inline-block mr-2 w-4 h-4 text-slate-500" />
                                    <span className="text-slate-500 text-sm">Ожидание авторизации...</span>
                                </div>
                                <button onClick={() => { ws?.close(); setIsModalOpen(false); setStep(1); }} className="w-full btn-secondary py-4 font-black mt-4">Отмена</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
