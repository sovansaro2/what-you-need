import React, { useState, useEffect } from 'react';
import { Store, WifiOff, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { KHMER_LOADING_MESSAGES, KHMER_NETWORK_TERMS } from '@/constants/khmerTerms';

interface FullScreenLoaderProps {
  message?: string;
  progressPercent?: number;
  onRetry?: () => void;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message,
  progressPercent,
  onRetry,
}) => {
  const { isOnline, checkConnection } = useNetworkStatus();
  const [msgIndex, setMsgIndex] = useState<number>(0);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(10);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Dynamic message rotation
  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % KHMER_LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [message]);

  // Soft progress bar animation if no explicit progress is provided
  useEffect(() => {
    if (progressPercent !== undefined) return;
    const progressInterval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 92) return 92; // hold near end until actual resolve
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 400);
    return () => clearInterval(progressInterval);
  }, [progressPercent]);

  const activeProgress = progressPercent !== undefined ? progressPercent : simulatedProgress;
  const activeMessage = message || KHMER_LOADING_MESSAGES[msgIndex];

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    } else {
      await checkConnection();
    }
    setTimeout(() => setIsRetrying(false), 600);
  };

  return (
    <div
      id="fullscreen-app-loader"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 select-none"
    >
      <div className="w-full max-w-sm mx-auto space-y-6 text-center">
        {/* Brand Logo Header */}
        <div className="space-y-3">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Soft Ambient Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-indigo-600/30 backdrop-blur-md rounded-3xl border border-indigo-400/30 flex items-center justify-center text-indigo-200 shadow-xl">
              <Store className="w-10 h-10 stroke-[1.75]" />
            </div>
          </div>

          <div className="space-y-1">
            <Badge variant="primary" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 mx-auto px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              ប្រព័ន្ធ WYN គ្រប់គ្រងអាជីវកម្ម
            </Badge>
            <h1 className="text-xl font-bold tracking-tight text-white pt-1">
              WYN Business System
            </h1>
          </div>
        </div>

        {/* Offline State Alert or Normal Loading */}
        {!isOnline ? (
          <Card className="bg-slate-800/90 border-slate-700/80 p-5 space-y-4 shadow-xl text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{KHMER_NETWORK_TERMS.OFFLINE_TITLE}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  {KHMER_NETWORK_TERMS.OFFLINE_DESC}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleRetry}
              loading={isRetrying}
              className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 min-h-[44px]"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              {KHMER_NETWORK_TERMS.RETRY}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Dynamic Loading Message */}
            <div className="h-8 flex items-center justify-center">
              <p
                key={activeMessage}
                className="text-xs sm:text-sm font-medium text-indigo-200 transition-all duration-300 ease-out animate-fade-in"
              >
                {activeMessage}
              </p>
            </div>

            {/* Soft Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-xs"
                  style={{ width: `${Math.min(activeProgress, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  កំពុងរៀបចំប្រព័ន្ធ...
                </span>
                <span className="text-indigo-300 font-bold">{Math.min(activeProgress, 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
