import React from 'react';

interface TopBarProps {
    title: string;
    subtitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
    return (
        <div className="sticky top-0 z-40 w-full overflow-hidden bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-80" />

            <div className="relative max-w-[768px] mx-auto px-4 py-3 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>
        </div>
    );
};
