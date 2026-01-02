'use client';

import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { verifyPasswordAction } from '@/app/actions';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState = {
    success: false,
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-all rounded-full py-4 font-medium text-lg mt-6 active:scale-95"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    驗證中...
                </>
            ) : (
                <>
                    解鎖行程 <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
    );
}

export default function PasswordProtection() {
    const [state, formAction] = useFormState(verifyPasswordAction, initialState);
    const router = useRouter();
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (state.success) {
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-900 shadow-sm border border-gray-100">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">行程保護</h1>
                    <p className="text-gray-500 mt-2 text-center text-sm">此頁面受密碼保護，請輸入 6 位數通行碼以繼續。</p>
                </div>

                <form action={formAction} className="w-full">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="password"
                                autoComplete="off"
                                placeholder="輸入通行碼"
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl border-2 border-gray-100 focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-200 placeholder:tracking-normal placeholder:font-normal placeholder:text-lg"
                                maxLength={6}
                                value={password}
                                onChange={(e) => {
                                    // 僅允許數字
                                    const val = e.target.value.replace(/\D/g, '');
                                    setPassword(val);
                                }}
                            />
                        </div>

                        {state.message && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-1 fade-in">
                                {state.message}
                            </div>
                        )}
                    </div>

                    <SubmitButton />

                    <p className="mt-8 text-xs text-center text-gray-300">
                        Protected by Notion Journey
                    </p>
                </form>
            </div>
        </div>
    );
}
