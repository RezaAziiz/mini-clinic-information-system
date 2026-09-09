import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
            {/* Left: Date */}
            <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-primary-500" />
                {today}
            </div>

            {/* Middle: Search */}
            <div className="flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari pasien / no. RM... (Tekan Enter)" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 hover:opacity-80">
                        <kbd className="text-[10px] font-sans font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↵</kbd>
                    </button>
                </form>
            </div>

            {/* Right: User Profile & Notification */}
            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-primary-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute 0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 leading-tight">
                            {user?.email ? user.email.split('@')[0] : 'User'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                            {user?.role?.replace('_', ' ') || 'Guest'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
