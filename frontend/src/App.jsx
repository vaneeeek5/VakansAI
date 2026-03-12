import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import Channels from './pages/Channels';
import Accounts from './pages/Accounts';
import Vacancies from './pages/Vacancies';
import Settings from './pages/Settings';
import Login from './pages/Login';

const App = () => {
    const isAuthenticated = localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <Router>
            <div className="flex h-screen bg-slate-950 text-slate-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/topics" element={<Topics />} />
                        <Route path="/channels" element={<Channels />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/vacancies" element={<Vacancies />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
