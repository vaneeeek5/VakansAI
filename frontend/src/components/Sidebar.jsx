import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTree, Radio, Users, Briefcase, Settings, LogOut, Terminal } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Мониторинг', path: '/' },
        { icon: ListTree, label: 'Тематики', path: '/topics' },
        { icon: Radio, label: 'Каналы', path: '/channels' },
        { icon: Users, label: 'Аккаунты', path: '/accounts' },
        { icon: Briefcase, label: 'Вакансии', path: '/vacancies' },
        { icon: Terminal, label: 'Логи', path: '/logs' },
        { icon: Settings, label: 'Настройки', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Админ-панель Парсера
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive 
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={() => {localStorage.removeItem('token'); window.location.reload();}}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Выйти</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
