import React from 'react';

// Optimized skeleton components for faster loading
export function OptimizedSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`} />
  );
}

export function FastCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <OptimizedSkeleton className="h-4 w-3/4 mb-2" />
      <OptimizedSkeleton className="h-8 w-1/2" />
    </div>
  );
}

export function FastChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <OptimizedSkeleton className="h-6 w-1/3 mb-4" />
      <OptimizedSkeleton className="h-64 w-full" />
    </div>
  );
}

export function FastTableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <OptimizedSkeleton className="h-6 w-1/4 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <OptimizedSkeleton className="h-4 w-1/3" />
            <OptimizedSkeleton className="h-4 w-1/4" />
            <OptimizedSkeleton className="h-4 w-1/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Preload critical components
export function PreloadCriticalComponents() {
  React.useEffect(() => {
    // Preload critical chart components
    import('recharts').then(() => {
      console.log('📊 Charts preloaded');
    });
    
    // Preload critical UI components
    import('framer-motion').then(() => {
      console.log('🎭 Animations preloaded');
    });
  }, []);

  return null;
}
