import React, { useState } from 'react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // In a real app, this would be an API call
        if (password === 'admin') {
            localStorage.setItem('token', 'dummy-token');
            window.location.reload();
        } else {
            setError('Неверный пароль');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full glass p-10 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Админ-панель Парсера
                    </h1>
                    <p className="text-slate-400 mt-2">Введите пароль администратора</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="Пароль"
                            className="input-field py-4 px-6 text-lg tracking-widest text-center"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                    <button type="submit" className="w-full btn-primary py-4 text-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95">
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
