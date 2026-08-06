import { Skeleton } from '@mymoney/ui';

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 w-full">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8 overflow-x-hidden">
        <Skeleton className="h-12 w-32 rounded-lg" />
        <Skeleton className="h-12 w-32 rounded-lg" />
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column - 8 cols */}
        <div className="xl:col-span-8 space-y-6">
          {/* StatCards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          
          {/* Chart */}
          <Skeleton className="h-[350px] w-full rounded-2xl" />
          
          {/* Transactions */}
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>

        {/* Right Column - 4 cols */}
        <div className="xl:col-span-4 space-y-6">
          {/* Health Score */}
          <Skeleton className="h-64 w-full rounded-2xl" />
          
          {/* Insights */}
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
