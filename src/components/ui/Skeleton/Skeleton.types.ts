export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export interface SkeletonTextProps {
  lines?: number
  className?: string
  lineClassName?: string
}

export interface SkeletonCardProps {
  hasImage?: boolean
  lines?: number
  className?: string
}
