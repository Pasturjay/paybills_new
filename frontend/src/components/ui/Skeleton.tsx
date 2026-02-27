import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
                className
            )}
        />
    );
}

export function SkeletonLoader({ type }: { type: 'card' | 'list' | 'input' }) {
    if (type === 'card') {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return <Skeleton className="h-10 w-full rounded-lg" />;
}
