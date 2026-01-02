'use client';

import React, { useState, useEffect } from 'react';
import { TripMetadata, ItineraryItem } from '@/lib/notion';
import { Calendar, MapPin, Database, Server, CheckCircle2, XCircle, Loader2, RefreshCcw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestNotionPage() {
    const [data, setData] = useState<{ metadata: TripMetadata, itinerary: ItineraryItem[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch('/api/notion');
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error || 'Failed to fetch');
                }

                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900 flex flex-col items-center">
            <header className="w-full max-w-5xl mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary rounded-xl text-white">
                        <Database className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Notion API 測試面板
                    </h1>
                </div>
                <p className="text-slate-500 font-medium">
                    即時監控 Notion 資料庫連線狀態與內容結構
                </p>
            </header>

            <main className="w-full max-w-5xl space-y-8">
                {/* Connection Status Section */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-slate-400" />
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">系統連線狀態</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-8">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">環境變數</span>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 rounded-full flex gap-1.5 items-center">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    已配置
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">資料來源</span>
                                {loading ? (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 rounded-full flex gap-1.5 items-center">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        連接中
                                    </Badge>
                                ) : error ? (
                                    <Badge variant="destructive" className="px-3 py-1 rounded-full flex gap-1.5 items-center">
                                        <XCircle className="w-3.5 h-3.5" />
                                        連線失敗
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 rounded-full flex gap-1.5 items-center">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        正常通訊
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {loading && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-100 rounded-2xl p-6">
                        <XCircle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-bold">連線發生錯誤</AlertTitle>
                        <AlertDescription className="mt-2 text-red-700 font-medium">
                            {error}
                            <div className="mt-6">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl font-bold"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    重新嘗試連線
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {data && (
                    <>
                        {/* Data Overview Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 text-xs font-black uppercase tracking-widest">Trip Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{data.metadata.city} {data.metadata.title}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-slate-500 font-semibold">
                                            <Calendar className="w-4 h-4" />
                                            <span>{data.metadata.startDate} — {data.metadata.endDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-12 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">時區定位</p>
                                            <p className="font-bold text-slate-700">{data.metadata.timezone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">匯率參考</p>
                                            <p className="font-bold text-slate-700">{data.metadata.exchangeRate}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">資料筆數</p>
                                            <p className="font-bold text-slate-700">{data.itinerary.length} 筆行程</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-slate-900 text-slate-400">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-500 text-xs font-black uppercase tracking-widest">JSON Debug</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-800/50 rounded-xl p-4 font-mono text-[10px] overflow-auto max-h-[160px] border border-slate-800">
                                        <pre className="text-blue-300">
                                            {JSON.stringify(data.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Itinerary Data Table */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b px-8 py-6">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-800">資料明細集</CardTitle>
                                    <CardDescription className="font-medium mt-1">從 Notion Database 提取的原始對象列表</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-slate-200 text-slate-400">
                                    Dynamic Feed
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.itinerary.length === 0 ? (
                                    <div className="p-20 text-center text-slate-300 font-bold italic">
                                        資料庫目前為空
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/30">
                                                <TableRow className="hover:bg-transparent border-slate-100">
                                                    <TableHead className="w-[120px] pl-8 font-black text-slate-400 text-[10px] uppercase">時間</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase text-center w-[100px]">類別</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase">項目名稱</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase">簡短描述</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase text-center">內容</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase text-center">地圖導航</TableHead>
                                                    <TableHead className="font-black text-slate-400 text-[10px] uppercase pr-8 text-right">素材封面</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="font-medium text-slate-700">
                                                {data.itinerary.map((item) => (
                                                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <TableCell className="pl-8 font-bold font-mono text-blue-600">
                                                            {item.date ? new Date(item.date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase rounded-lg border-slate-100 text-slate-500 bg-white">
                                                                {item.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-slate-800">
                                                            {item.title}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                                                            {item.description || <span className="text-slate-200">無</span>}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.hasContent ? (
                                                                <Badge className="bg-blue-50 text-blue-700 border-blue-100">有</Badge>
                                                            ) : (
                                                                <span className="text-slate-200">無</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.maps ? (
                                                                <Button asChild variant="link" className="p-0 h-auto text-blue-500 hover:text-blue-700 font-bold flex gap-1 items-center">
                                                                    <a href={item.maps} target="_blank">
                                                                        <MapPin className="w-3.5 h-3.5" />
                                                                        <span className="text-xs">Google Maps</span>
                                                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-50" />
                                                                    </a>
                                                                </Button>
                                                            ) : (
                                                                <span className="text-slate-200">未設定</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="pr-8 text-right">
                                                            {item.img ? (
                                                                <div className="inline-block w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden shadow-inner">
                                                                    <img src={item.img} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex w-12 h-12 rounded-xl bg-slate-50 border border-dashed border-slate-200 items-center justify-center">
                                                                    <Database className="w-4 h-4 text-slate-200" />
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </main>

            <footer className="w-full max-w-5xl mt-16 pt-8 border-t border-slate-200 flex justify-between items-center px-2">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Notion Journey Core v1.0
                </p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    DEVELOPER TEST MODE
                </p>
            </footer>
        </div>
    );
}
