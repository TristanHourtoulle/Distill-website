import type { Task } from '@/types'

export interface TaskMeetingInfo {
  id: string
  title: string
}

export interface TaskProjectInfo {
  id: string
  name: string
  githubRepoName: string
  githubOwner: string
}

export interface TaskExportInfo {
  id: string
  status: string
  externalUrl: string | null
  issueNumber?: number
}

export interface TaskCardProps {
  task: Task
  meeting?: TaskMeetingInfo
  project?: TaskProjectInfo
  latestExport?: TaskExportInfo
  onClick?: () => void
  onDelete?: () => void
  onStatusChange?: (status: Task['status']) => void
  className?: string
}
