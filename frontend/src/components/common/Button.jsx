import React from 'react';

const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
    const baseStyles = "font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group";
    
    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30",
        secondary: "bg-primary-100 hover:bg-primary-200 text-primary-900",
        outline: "border border-slate-200 hover:border-primary-500 text-slate-700 hover:text-primary-600 bg-white"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
            {Icon && <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
};

export default Button;
