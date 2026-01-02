import React from 'react';
import { cn } from '@/lib/utils';
import { Navigation, Phone } from 'lucide-react';

export const renderBlockContent = (block: any) => {
    if (!block) return null;
    const type = block.type;
    const value = block[type];

    if (!value) return null;

    // Helper for rich text
    const renderRichText = (textArr: any[]) => {
        if (!textArr) return null;
        return textArr.map((t: any, idx: number) => {
            const { annotations } = t;
            return (
                <span key={idx} className={cn(
                    annotations.bold && 'font-bold',
                    annotations.italic && 'italic',
                    annotations.strikethrough && 'line-through',
                    annotations.underline && 'underline',
                    annotations.code && 'font-mono bg-slate-100 text-slate-700 px-1 rounded',
                    t.href && 'text-blue-500 underline'
                )}>
                    {t.href ? <a href={t.href} target="_blank" rel="noreferrer">{t.plain_text}</a> : t.plain_text}
                </span>
            );
        });
    };

    switch (type) {
        case 'paragraph':
            const textContent = value.rich_text?.map((t: any) => t.plain_text).join('') || '';
            const isAddress = textContent.includes('地址');
            const isPhone = textContent.includes('電話');

            // For address, remove href from rich text so it renders as plain text
            // For phone, we keep original rich text (usually it's plain text anyway unless user linked it)

            const displayRichText = isAddress
                ? value.rich_text.map((t: any) => ({ ...t, href: null }))
                : value.rich_text;

            // Address URL for button
            const addressUrl = isAddress ? value.rich_text?.find((t: any) => t.href)?.href : null;

            // Phone extraction
            let phoneUrl = value.rich_text?.find((t: any) => t.href)?.href;
            if (!phoneUrl && isPhone) {
                // Look for a sequence of digits/plus/dashes that looks like a phone number
                // Regex: optionally starting with +, then digits/dashes/spaces
                const match = textContent.match(/(?:\+|0)[0-9 \-]{8,}/);
                if (match) {
                    // Remove props that shouldn't be in tel: (like spaces for display)
                    const cleanNumber = match[0].replace(/ /g, '');
                    phoneUrl = `tel:${cleanNumber}`;
                }
            }
            // Ensure phoneUrl starts with tel: if found and not already http (some Notion links might be http)
            // But usually for phone button we want tel:
            if (phoneUrl && !phoneUrl.startsWith('tel:') && !phoneUrl.startsWith('http')) {
                phoneUrl = `tel:${phoneUrl}`;
            }

            return (
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-slate-700 leading-relaxed max-w-full overflow-hidden text-ellipsis">
                        {renderRichText(displayRichText)}
                    </p>

                    {/* Address Navigation Button */}
                    {isAddress && addressUrl && (
                        <a
                            href={addressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                            <Navigation size={16} />
                        </a>
                    )}

                    {/* Phone Call Button */}
                    {isPhone && phoneUrl && (
                        <a
                            href={phoneUrl}
                            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        >
                            <Phone size={16} />
                        </a>
                    )}
                </div>
            );
        case 'heading_1':
            return <h1 className="text-2xl font-bold mt-4 mb-2 text-slate-900">{renderRichText(value.rich_text)}</h1>;
        case 'heading_2':
            return <h2 className="text-xl font-bold mt-3 mb-2 text-slate-800">{renderRichText(value.rich_text)}</h2>;
        case 'heading_3':
            return <h3 className="text-lg font-bold mt-2 mb-1 text-slate-800">{renderRichText(value.rich_text)}</h3>;
        case 'bulleted_list_item':
            return <li className="ml-4 list-disc mb-1 text-slate-700">{renderRichText(value.rich_text)}</li>;
        case 'numbered_list_item':
            return <li className="ml-4 list-decimal mb-1 text-slate-700">{renderRichText(value.rich_text)}</li>;
        case 'image':
            const src = value.type === 'external' ? value.external.url : value.file.url;
            return (
                <div className="my-4 rounded-xl overflow-hidden shadow-sm">
                    <img src={src} alt="Block Image" className="w-full h-auto object-cover" loading="lazy" />
                </div>
            );
        case 'quote':
            return <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-2 italic text-slate-600 bg-slate-50">{renderRichText(value.rich_text)}</blockquote>;
        case 'divider':
            return <hr className="my-6 border-slate-200" />;
        case 'callout':
            return (
                <div className="p-3 bg-slate-50 rounded-lg flex items-start gap-3 my-2 border border-slate-100">
                    {value.icon?.emoji && <span className="text-lg">{value.icon.emoji}</span>}
                    <div className="text-slate-700">{renderRichText(value.rich_text)}</div>
                </div>
            );
        default:
            // Unsupported block type fallback
            return null;
    }
};

interface NotionBlockRendererProps {
    blocks: any[];
}

export const NotionBlockRenderer: React.FC<NotionBlockRendererProps> = ({ blocks }) => {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="space-y-1">
            {blocks.map((block) => (
                <React.Fragment key={block.id}>
                    {renderBlockContent(block)}
                </React.Fragment>
            ))}
        </div>
    );
};
