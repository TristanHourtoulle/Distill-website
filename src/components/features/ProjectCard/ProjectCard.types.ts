import type { Project } from '@/types'

export interface ProjectCardProps {
  project: Project
  onClick?: () => void
  onDelete?: () => void
  className?: string
}
