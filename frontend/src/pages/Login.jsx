import React, { useState } from 'react';
import { Building2, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, UserCircle2, Stethoscope, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Komponen Reusable
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Konteks Auth
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('pendaftaran');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('password123'); // Auto-fill untuk testing
    const [isLoading, setIsLoading] = useState(false);

    // Redirect jika sudah login
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        // DX Improvement: Auto-fill email sesuai role untuk memudahkan testing
        if (newRole === 'pendaftaran') setEmail('petugas@klinik.com');
        else if (newRole === 'dokter') setEmail('dr.sari@klinik.com');
        else if (newRole === 'admin') setEmail('admin@klinik.com');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const result = await login(email, password);
        
        setIsLoading(false);
        if (result.success) {
            navigate('/');
        }
    };

    return (
        // Menggunakan bg-slate-100 agar batas card putih (bg-white) lebih terlihat kontras
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">

            {/* Background Glow Effect - Dihapus blur-nya karena bisa menyebabkan GPU tab freeze di beberapa perangkat */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-100/30 rounded-full pointer-events-none"></div>

            {/* Main Login Card - Diperkecil menjadi w-[400px] dan ditambah shadow & border */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 w-[90%] max-w-[400px] p-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-900/20">
                        <Building2 className="text-white w-6 h-6" />
                    </div>

                    <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-3 py-1 rounded-full mb-3 tracking-wide">
                        EHR SAAS
                    </span>

                    <h1 className="text-slate-500 text-[10px] font-bold tracking-widest text-center uppercase">
                        Sistem Informasi Manajemen Klinik
                    </h1>
                </div>

                {/* Role Selector (Segmented Control) */}
                <div className="mb-6">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">
                        Pilih Peran Akses
                    </label>
                    <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border border-slate-200/60">
                        {[
                            { id: 'pendaftaran', icon: UserCircle2, label: 'Frontdesk' },
                            { id: 'dokter', icon: Stethoscope, label: 'Dokter' },
                            { id: 'admin', icon: ShieldAlert, label: 'Admin' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleRoleChange(item.id)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold rounded-lg transition-all duration-200 ${role === item.id
                                    ? 'bg-white text-primary-900 shadow-sm border border-slate-200'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${role === item.id ? 'text-primary-500' : ''}`} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Username Input Component */}
                    <Input
                        label="Work Email / username"
                        type="email"
                        icon={Building2}
                        placeholder="nama@klinik.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Password Input Component */}
                    <Input 
                        label="Kata Sandi Enkripsi"
                        labelRight={
                            <button type="button" className="text-[11px] font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                                Lupa sandi?
                            </button>
                        }
                        type={showPassword ? 'text' : 'password'}
                        icon={Lock}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        }
                    />

                    {/* Submit Button Component */}
                    <Button type="submit" className="w-full mt-4" icon={ArrowRight} disabled={isLoading}>
                        {isLoading ? 'Memproses...' : 'Masuk ke Sistem'}
                    </Button>
                </form>

            </div>

            {/* Footer Information */}
            <div className="mt-8 text-center relative z-10 flex flex-col items-center px-6">
                <div className="flex items-center gap-2 text-primary-500 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-wide uppercase">
                        Enkripsi Data Medis Terstandarisasi HIPAA & Permenkes RI <span className="text-slate-400 font-medium">v2.4.1</span>
                    </span>
                </div>
                <p className="text-slate-400 text-[11px] max-w-sm leading-relaxed">
                    Akses dibatasi hanya untuk staf rekam medis dan klinisi berwenang. Semua aktivitas audit tercatat secara real-time.
                </p>
            </div>
        </div>
    );
};

export default Login;
