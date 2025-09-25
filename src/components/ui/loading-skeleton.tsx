"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export const LoadingSkeleton = ({ className = "", rows = 1 }: LoadingSkeletonProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.1
          }}
          className="animate-shimmer h-4 bg-gray-200 rounded"
        />
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <LoadingSkeleton className="w-24 h-4" />
        <LoadingSkeleton className="w-8 h-8 rounded-lg" />
      </div>
      <LoadingSkeleton className="w-16 h-8 mb-2" />
      <LoadingSkeleton className="w-20 h-3" />
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <LoadingSkeleton className="w-32 h-6 mb-2" />
        <LoadingSkeleton className="w-48 h-4" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-8 gap-4">
              <LoadingSkeleton className="col-span-2 h-4" />
              <LoadingSkeleton className="h-4" />
              <LoadingSkeleton className="h-4" />
              <LoadingSkeleton className="h-4" />
              <LoadingSkeleton className="h-4" />
              <LoadingSkeleton className="h-4" />
              <LoadingSkeleton className="col-span-1 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;