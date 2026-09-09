import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, LayoutDashboard, Users, LogOut, ClipboardList, ListOrdered, Stethoscope, ScrollText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Administrator', 'Dokter', 'Petugas Pendaftaran'] },
        { path: '/patients', icon: Users, label: 'Patient Management', roles: ['Administrator', 'Petugas Pendaftaran'] },
        { path: '/registrations', icon: ClipboardList, label: 'Visit Registration', roles: ['Petugas Pendaftaran'] },
        { path: '/queues', icon: ListOrdered, label: 'Queue Management', roles: ['Petugas Pendaftaran', 'Dokter'] },
        { path: '/examination', icon: Stethoscope, label: 'Doctor Examination', roles: ['Dokter'] },
        { path: '/medical-history', icon: ScrollText, label: 'Medical History', roles: ['Dokter'] },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                        <Building2 className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 leading-none">Klinik SAAS</h1>
                        <p className="text-[10px] text-slate-500 font-medium">Information System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-primary-900 text-white shadow-md shadow-primary-900/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary-700'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex justify-between items-center px-2 mb-4 text-xs text-slate-400 font-medium">
                    <span>v2.4.0-prod</span>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log Keluar
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
