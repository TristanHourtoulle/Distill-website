import { cn } from '@/lib/utils'
import type { SkeletonProps, SkeletonTextProps, SkeletonCardProps } from './Skeleton.types'

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-hover',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer bg-gradient-to-r from-surface-hover via-surface to-surface-hover bg-[length:200%_100%]',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-md',
        className
      )}
      style={style}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 && 'w-3/4',
            lineClassName
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({
  hasImage = true,
  lines = 3,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-4',
        className
      )}
    >
      {hasImage && (
        <Skeleton
          variant="rounded"
          className="mb-4 h-40 w-full"
        />
      )}
      <Skeleton variant="text" className="mb-3 h-6 w-3/4" />
      <SkeletonText lines={lines} />
    </div>
  )
}
