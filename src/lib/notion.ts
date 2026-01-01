import { Client } from '@notionhq/client';

export interface TripMetadata {
    title: string;
    city: string;
    startDate: string;
    endDate: string;
    exchangeRate: string;
    timezone: string;
}

export interface ItineraryItem {
    id: string;
    type: string;
    title: string;
    category: string;
    date: string;
    maps: string;
    img: string | null;
}

export async function getTripData() {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
        throw new Error(`Missing Notion credentials. API Key: ${apiKey ? 'set' : 'missing'}, DB ID: ${databaseId ? 'set' : 'missing'}`);
    }

    const notion = new Client({
        auth: apiKey,
    });

    let dataSourceId = databaseId;

    try {
        // 嘗試先將輸入的 ID 當作 Database ID 查詢，以取得內部的 Data Source ID
        // 這是為了相容使用者直接貼上 Notion Database URL 中的 ID (即 Database ID)
        // 但新版 API (v2025-09-03) 的 query 需要 Data Source ID
        const dbResponse = await notion.databases.retrieve({
            database_id: databaseId,
        }) as any;

        if (dbResponse.data_sources && dbResponse.data_sources.length > 0) {
            dataSourceId = dbResponse.data_sources[0].id; // 取第一個 Data Source
        }
    } catch (e) {
        // 如果 retrieve 失敗，可能是權限問題，或者使用者給的已經是 Data Source ID?
        // 這裡暫時忽略錯誤，嘗試直接用原始 ID 進行查詢，看是否能成功
        console.warn("Failed to retrieve database info, trying manual ID directly:", e);
    }

    // 使用最新的 Notion API (v2025-09-03) 語法: dataSources.query
    const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
    });

    const results = response.results as any[];

    // 解析元數據 (Metadata)
    const countryRow = results.find(r => r.properties.type?.select?.name === 'country');
    const cityRow = results.find(r => r.properties.type?.select?.name === 'city');
    const exchangeRow = results.find(r => r.properties.type?.select?.name === 'exchange');
    const gmtRow = results.find(r => r.properties.type?.select?.name === 'gmt');

    const metadata: TripMetadata = {
        title: countryRow?.properties.title?.title[0]?.plain_text || '我的旅遊行程',
        city: cityRow?.properties.title?.title[0]?.plain_text || '',
        startDate: countryRow?.properties.date?.date?.start || '',
        endDate: countryRow?.properties.date?.date?.end || '',
        exchangeRate: exchangeRow?.properties.title?.title[0]?.plain_text || 'JPY',
        timezone: gmtRow?.properties.title?.title[0]?.plain_text || 'GMT+8',
    };

    // 篩選並排序行程項目 (Journey)
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

            return {
                id: page.id,
                type: 'journey',
                title: page.properties.title?.title[0]?.plain_text || '未命名項目',
                category: page.properties.category?.select?.name || 'other',
                date: page.properties.date?.date?.start || '',
                maps: page.properties.maps?.url || '',
                img: coverUrl,
            };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { metadata, itinerary };
}
