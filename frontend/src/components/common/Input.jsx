import React from 'react';

const Input = ({ label, labelRight, icon: Icon, rightElement, required, className = '', ...props }) => {
    return (
        <div className={className}>
            {label && (
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    {labelRight && <div>{labelRight}</div>}
                </div>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                )}
                <input
                    required={required}
                    className={`w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none ${
                        Icon ? 'pl-10' : 'pl-4'
                    } ${rightElement ? 'pr-12' : 'pr-4'}`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
