"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Info, Hotel, Train, ShoppingBag, Utensils } from 'lucide-react';
import { resolveMapUrl, cn, parseNotionDateTime } from '@/lib/utils';
import { ItineraryItem } from '@/lib/notion';
import ItineraryDetailsModal from './ItineraryDetailsModal';

const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
        case 'transport': return <Train className="w-5 h-5" />;
        case 'hotel': return <Hotel className="w-5 h-5" />;
        case 'visit': return <MapPin className="w-5 h-5" />;
        case 'restaurant': return <Utensils className="w-5 h-5" />;
        case 'shopping': return <ShoppingBag className="w-5 h-5" />;
        default: return <Info className="w-5 h-5" />;
    }
};

interface ItineraryCardProps {
    item: ItineraryItem;
}

export default function ItineraryCard({ item }: ItineraryCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { time } = parseNotionDateTime(item.date);
    const timeStr = time;

    const handleCardClick = () => {
        if (item.hasContent || item.description) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <Card
                onClick={handleCardClick}
                className={cn(
                    "border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white",
                    (item.hasContent || item.description) ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
                )}
            >
                {/* Page Cover Image */}
                {item.img && (
                    <div className="relative w-full h-48">
                        <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-xs font-bold text-red-600 shadow-sm">
                                {timeStr}
                            </span>
                        </div>
                    </div>
                )}

                <CardContent className={cn("p-5", !item.img && "pt-6")}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                            {!item.img && (
                                <span className="text-sm font-black text-red-600 tracking-tighter block mb-1">
                                    {timeStr}
                                </span>
                            )}
                            <h3 className="font-bold text-xl text-gray-800 leading-tight">{item.title}</h3>
                            {item.description && (
                                <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-1">
                                    {item.description}
                                </p>
                            )}
                        </div>
                        <div className="bg-red-50/80 backdrop-blur-sm p-2.5 rounded-2xl text-red-600 shrink-0 ml-4">
                            <CategoryIcon category={item.category} />
                        </div>
                    </div>

                    {item.maps && (
                        <Button
                            asChild
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full justify-center gap-2 text-xs font-bold rounded-2xl h-11 border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200 transition-all active:scale-[0.98]"
                        >
                            <a href={resolveMapUrl(item.maps)} target="_blank">
                                <MapPin className="w-3.5 h-3.5" />
                                查看地點 / 導航
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>

            <ItineraryDetailsModal
                item={item}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
