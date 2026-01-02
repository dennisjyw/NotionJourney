import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import Cookies from 'js-cookie';

interface LoginScreenProps {
    requiredPassword?: string | null;
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ requiredPassword, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isShake, setIsShake] = useState(false);

    // If no password is required, we can just skip or let the parent handle it.
    // However, usually this component is conditionally rendered.

    const handleLogin = () => {
        if (!requiredPassword) {
            onLoginSuccess();
            return;
        }

        if (password === requiredPassword) {
            // Success
            Cookies.set('journey_auth', 'true', { expires: 7 }); // 7 days
            onLoginSuccess();
        } else {
            // Fail
            setError(true);
            setIsShake(true);
            setTimeout(() => setIsShake(false), 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop)' }}>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            <div className="relative w-full max-w-md p-6 mx-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                            <Lock className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">Welcome Back</h1>
                    <p className="text-white/70 mb-8 text-sm">請輸入訪問密碼以查看行程</p>

                    <motion.div
                        animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        className="relative mb-6"
                    >
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="輸入 6 位數密碼"
                            className={cn(
                                "w-full bg-black/20 text-white placeholder-white/40 border text-center text-xl tracking-[0.5em] py-4 rounded-xl outline-none transition-all duration-300",
                                error
                                    ? "border-red-400/80 bg-red-900/20 focus:border-red-400"
                                    : "border-white/10 focus:border-white/50 focus:bg-black/30"
                            )}
                            maxLength={6}
                        />
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={password.length === 0}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
                            password.length > 0
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20"
                                : "bg-white/10 cursor-not-allowed text-white/30"
                        )}
                    >
                        <span>進入行程</span>
                        <ArrowRight size={18} />
                    </motion.button>

                </motion.div>

                <p className="text-center text-white/30 text-xs mt-8">
                    Protected by Secure Journey Access
                </p>
            </div>
        </div>
    );
};
