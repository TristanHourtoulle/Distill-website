import type { Task } from '@/types'

export interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDelete?: () => void
  onStatusChange?: (status: Task['status']) => void
  className?: string
}
