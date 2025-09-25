"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiActivity, 
  FiArrowUp, 
  FiArrowDown, 
  FiClock, 
  FiWifi,
  FiZap,
  FiTarget,
  FiPlay,
  FiArrowLeft
} from "react-icons/fi";
import AnimatedDashboardLayout, { AnimatedSection } from "@/components/ui/animated-layout";

interface SpeedTestPageProps {
  serverId: string;
  serverName: string;
}

interface SpeedTestResult {
  downloadSpeed?: number;
  uploadSpeed?: number;
  ping?: number;
}

const SpeedMeter = ({ 
  value, 
  maxValue, 
  color, 
  label, 
  icon: Icon, 
  unit,
  isAnimating 
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  icon: any;
  unit: string;
  isAnimating: boolean;
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex items-center justify-center mb-6"
      >
        <div className={`p-4 bg-gradient-to-br ${color} rounded-2xl shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      {/* Value */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-4xl font-bold text-gray-900 mb-2"
        >
          {isAnimating ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              --
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {value.toFixed(label === 'Ping' ? 1 : 2)}
            </motion.span>
          )}
          <span className="text-xl text-gray-500 ml-2">{unit}</span>
        </motion.div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isAnimating ? "100%" : `${percentage}%` }}
          transition={isAnimating ? {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          } : {
            duration: 1,
            ease: "easeOut"
          }}
          className={`h-full bg-gradient-to-r ${color.replace('from-', 'from-').replace('to-', 'to-')} rounded-full`}
        />
        {isAnimating && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 h-full w-1/3 bg-white/30 rounded-full"
          />
        )}
      </div>
    </motion.div>
  );
};

export default function SpeedTestPage({ serverId, serverName }: SpeedTestPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runSpeedTest = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch(`/api/servers/${serverId}/speedtest`, {
        method: "POST",
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to run speed test");
      }

      const data = await response.json();
      
      // Simulate realistic delay for better UX
      setTimeout(() => {
        setResult(data);
        toast.success("Speed test completed successfully! 🎉");
      }, 1000);
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to run speed test");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedDashboardLayout>
      {/* Header */}
      <AnimatedSection className="space-y-2 mb-8">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Network Speed Test
            </h1>
            <p className="text-gray-600 text-lg">
              Analyze connection performance for <span className="font-semibold text-blue-600">{serverName}</span>
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Test Control */}
      <AnimatedSection className="mb-12">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <motion.div
              animate={isLoading ? { 
                rotate: 360,
                scale: [1, 1.1, 1]
              } : { rotate: 0, scale: 1 }}
              transition={isLoading ? {
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              } : {}}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                isLoading 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              } shadow-lg`}
            >
              {isLoading ? (
                <FiActivity className="w-10 h-10 text-white" />
              ) : (
                <FiPlay className="w-10 h-10 text-white ml-1" />
              )}
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runSpeedTest}
            disabled={isLoading}
            className={`px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ${
              isLoading
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <FiWifi className="mr-3 w-5 h-5 animate-pulse" />
                Testing Connection... {Math.round(progress)}%
              </span>
            ) : (
              <span className="flex items-center">
                <FiZap className="mr-3 w-5 h-5" />
                Start Speed Test
              </span>
            )}
          </motion.button>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Running diagnostics and measuring performance...
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatedSection>

      {/* Results */}
      <AnimatePresence>
        {(result || isLoading) && (
          <AnimatedSection>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <SpeedMeter
                value={result?.downloadSpeed || 0}
                maxValue={1000}
                color="from-blue-500 to-cyan-500"
                label="Download Speed"
                icon={FiArrowDown}
                unit="Mbps"
                isAnimating={isLoading}
              />
              
              <SpeedMeter
                value={result?.uploadSpeed || 0}
                maxValue={500}
                color="from-green-500 to-emerald-500"
                label="Upload Speed"
                icon={FiArrowUp}
                unit="Mbps"
                isAnimating={isLoading}
              />
              
              <SpeedMeter
                value={result?.ping || 0}
                maxValue={100}
                color="from-purple-500 to-pink-500"
                label="Ping"
                icon={FiTarget}
                unit="ms"
                isAnimating={isLoading}
              />
            </motion.div>
          </AnimatedSection>
        )}
      </AnimatePresence>

      {/* Performance Insights */}
      {result && !isLoading && (
        <AnimatedSection className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiActivity className="mr-3 text-blue-600" />
              Performance Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-2xl mb-2">
                  {result.downloadSpeed! > 100 ? '🚀' : result.downloadSpeed! > 50 ? '⚡' : '🐢'}
                </div>
                <p className="text-sm font-medium text-blue-900">
                  {result.downloadSpeed! > 100 ? 'Excellent' : result.downloadSpeed! > 50 ? 'Good' : 'Slow'} Download
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="text-2xl mb-2">
                  {result.uploadSpeed! > 50 ? '🚀' : result.uploadSpeed! > 25 ? '⚡' : '🐢'}
                </div>
                <p className="text-sm font-medium text-green-900">
                  {result.uploadSpeed! > 50 ? 'Excellent' : result.uploadSpeed! > 25 ? 'Good' : 'Slow'} Upload
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-2xl mb-2">
                  {result.ping! < 20 ? '🎯' : result.ping! < 50 ? '⚡' : '🐌'}
                </div>
                <p className="text-sm font-medium text-purple-900">
                  {result.ping! < 20 ? 'Excellent' : result.ping! < 50 ? 'Good' : 'High'} Latency
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      )}
    </AnimatedDashboardLayout>
  );
}