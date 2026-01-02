'use server';

import { getPasswordConfig } from '@/lib/notion';
import { cookies } from 'next/headers';

export async function verifyPasswordAction(prevState: any, formData: FormData) {
    const inputPassword = formData.get('password') as string;

    if (!inputPassword) {
        return { success: false, message: '請輸入密碼' };
    }

    try {
        const correctPassword = await getPasswordConfig();

        if (!correctPassword) {
            // 如果 Notion 沒設定密碼，理論上應該開放或報錯。
            // 這裡假設若沒設定密碼，則任何輸入都算錯誤（因為系統預期要是受保護的）。
            // 或者視為設定錯誤。
            console.error("No password configured in Notion.");
            return { success: false, message: '系統未設定密碼，請聯繫管理員' };
        }

        if (inputPassword === correctPassword) {
            // 驗證成功，設定 Cookie
            (await cookies()).set('journey_auth', 'true', {
                maxAge: 60 * 60 * 24 * 7, // 7 Days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            });
            return { success: true };
        } else {
            return { success: false, message: '密碼錯誤，請重試' };
        }

    } catch (error) {
        console.error("Password verification error:", error);
        return { success: false, message: '驗證過程發生錯誤' };
    }
}
