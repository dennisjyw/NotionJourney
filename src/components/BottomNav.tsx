import React from 'react';
import { Home, List, MapPin, Bed, Plane, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'home' | 'itinerary' | 'visit' | 'hotel' | 'transport' | 'info';

interface BottomNavProps {
    currentTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'home', label: '首頁', icon: Home },
        { id: 'visit', label: '景點', icon: MapPin },
        { id: 'hotel', label: '住宿', icon: Bed },
        { id: 'transport', label: '交通', icon: Plane },
        { id: 'info', label: '資訊', icon: Info },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[768px] z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-6 pt-2 px-2">
            <div className="flex justify-between items-end w-full mx-auto">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full py-2 transition-all duration-200 active:scale-95",
                                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all mb-1",
                                isActive && "bg-blue-50"
                            )}>
                                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium tracking-tight">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
