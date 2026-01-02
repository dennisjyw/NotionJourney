import { Client } from '@notionhq/client';
import { cache } from 'react';

export interface TripMetadata {
    title: string;
    city: string;
    startDate: string;
    endDate: string;
    exchangeRate: string;
    timezone: string;
    icon?: string;
    infoPage?: {
        id: string;
        title: string;
        blocks: any[];
    };
}

export interface ItineraryItem {
    id: string;
    type: string;
    title: string;
    category: string;
    date: string;
    maps: string;
    img: string | null;
    description: string;
    hasContent: boolean;
    icon?: string | null;
}

/**
 * 將 Emoji 轉換為 SVG Data URL，以便作為 Favicon 使用
 */
function emojiToDataUrl(emoji: string): string {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <text y=".9em" font-size="90">${emoji}</text>
        </svg>
    `.trim();
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}


export async function getDataSourceId(notion: Client, databaseId: string) {
    try {
        const dbResponse = await notion.databases.retrieve({
            database_id: databaseId,
        }) as any;

        let dbIcon = undefined;
        if (dbResponse.icon) {
            if (dbResponse.icon.type === 'emoji') {
                dbIcon = emojiToDataUrl(dbResponse.icon.emoji);
            } else if (dbResponse.icon.type === 'external') {
                dbIcon = dbResponse.icon.external.url;
            } else if (dbResponse.icon.type === 'file') {
                dbIcon = dbResponse.icon.file.url;
            }
        }

        let dataSourceId = databaseId;
        if (dbResponse.data_sources && dbResponse.data_sources.length > 0) {
            dataSourceId = dbResponse.data_sources[0].id;
        }

        return { dataSourceId, dbIcon };
    } catch (e) {
        console.warn("Failed to retrieve database info, using provided ID as Data Source ID:", e);
        return { dataSourceId: databaseId, dbIcon: undefined };
    }
}

export const getTripData = cache(async () => {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
        throw new Error(`Missing Notion credentials. API Key: ${apiKey ? 'set' : 'missing'}, DB ID: ${databaseId ? 'set' : 'missing'}`);
    }

    const notion = new Client({
        auth: apiKey,
    });

    const { dataSourceId, dbIcon } = await getDataSourceId(notion, databaseId);

    // Notion API v2025-09-03: dataSources.query
    let response;
    try {
        // @ts-ignore: handling strictly typed client issues
        response = await notion.dataSources.query({
            data_source_id: dataSourceId,
        });
    } catch (error: any) {
        console.error("Notion API Error Detail:", error);
        if (error.status === 401) {
            throw new Error("Notion API Key 無效或是未授權。請檢查 .env.local 檔案中的 NOTION_API_KEY 是否正確，並確認該 Integration 已被邀請至 Database。");
        }
        if (error.status === 404) {
            throw new Error("找不到指定的 Data Source ID。請確認 Database 是否已正確關聯至 Data Source。");
        }
        throw error;
    }

    const results = response.results as any[];

    // 1. 分類：找出 Type = 'config' 的項目
    //    新邏輯：檢查 properties.type 為 'config'
    //    並且細分 config 類別：檢查 properties.config 為 'country', 'city', 'exchange', 'gmt'
    const configItems = results.filter(r => r.properties.type?.select?.name === 'config');

    const countryRow = configItems.find(r => r.properties.config?.select?.name === 'country');
    const cityRow = configItems.find(r => r.properties.config?.select?.name === 'city');
    const exchangeRow = configItems.find(r => r.properties.config?.select?.name === 'exchange');
    const gmtRow = configItems.find(r => r.properties.config?.select?.name === 'gmt');

    const metadata: TripMetadata = {
        title: countryRow?.properties.title?.title[0]?.plain_text || '我的旅遊行程',
        city: cityRow?.properties.title?.title[0]?.plain_text || '',
        startDate: countryRow?.properties.date?.date?.start || '',
        endDate: countryRow?.properties.date?.date?.end || '',
        exchangeRate: exchangeRow?.properties.title?.title[0]?.plain_text || 'JPY',
        timezone: gmtRow?.properties.title?.title[0]?.plain_text || 'GMT+8',
        icon: dbIcon,
        infoPage: undefined, // Will populate below
    };

    // 1.1 Info Page Content (config=info)
    const infoRow = configItems.find(r => r.properties.config?.select?.name === 'info');
    if (infoRow) {
        try {
            // Re-use logic or call getPageBlocks directly if possible, or just call notion API here
            const blocksResponse = await notion.blocks.children.list({
                block_id: infoRow.id,
            });
            // Enhance metadata with content
            metadata.infoPage = {
                id: infoRow.id,
                title: infoRow.properties.title?.title[0]?.plain_text || 'Info',
                blocks: blocksResponse.results
            };
        } catch (e) {
            console.error("Failed to fetch info page blocks", e);
        }
    }

    // 2. 行程：找出 Type = 'journey' 的項目
    //    新邏輯：檢查 properties.type 為 'journey'
    //    類別來源：properties.journey (取代原本的 properties.category)
    const itinerary: ItineraryItem[] = results
        .filter(r => r.properties.type?.select?.name === 'journey')
        .map(page => {
            let coverUrl = null;
            if (page.cover) {
                if (page.cover.type === 'external') {
                    coverUrl = page.cover.external.url;
                } else if (page.cover.type === 'file') {
                    coverUrl = page.cover.file.url;
                }
            }

            // 防呆：如果還是沒改 database column 導致 journey 空值，嘗試 fallback 到 category (可選)
            // 這裡嚴格依照需求：讀取 journey 欄位
            const category = page.properties.journey?.select?.name || 'other';

            // 讀取 description 欄位 (Rich Text)
            const description = page.properties.description?.rich_text
                ?.map((t: any) => t.plain_text)
                .join('') || '';

            // page.icon handling
            let icon: string | null = null;
            if (page.icon) {
                if (page.icon.type === 'emoji') {
                    icon = page.icon.emoji;
                } else if (page.icon.type === 'external') {
                    icon = page.icon.external.url;
                } else if (page.icon.type === 'file') {
                    icon = page.icon.file.url;
                }
            }

            return {
                id: page.id,
                type: 'journey',
                title: page.properties.title?.title[0]?.plain_text || '未命名項目',
                category: category,
                date: page.properties.date?.date?.start || '',
                maps: page.properties.maps?.url || '',
                img: coverUrl,
                description: description,
                hasContent: true,
                icon,
            };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { metadata, itinerary };
});

export const getPasswordConfig = cache(async () => {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) return null;

    const notion = new Client({ auth: apiKey });
    const { dataSourceId } = await getDataSourceId(notion, databaseId);

    try {
        // @ts-ignore
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: {
                property: "type",
                select: {
                    equals: "config"
                }
            }
        });

        const results = response.results as any[];
        const passwordRow = results.find(r => r.properties.config?.select?.name === 'password');

        return passwordRow?.properties.title?.title[0]?.plain_text || null;
    } catch (e) {
        console.error("Failed to fetch password config:", e);
        return null;
    }
});

export const getPageBlocks = cache(async (pageId: string) => {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
        throw new Error('Missing Notion API Key');
    }

    const notion = new Client({ auth: apiKey });

    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });
        return response.results;
    } catch (error: any) {
        console.error("Notion getPageBlocks Error:", error);
        throw error;
    }
});
