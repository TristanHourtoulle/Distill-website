import type { TaskStatus, TaskComplexity, TaskType } from '@/types'

export interface TaskFiltersState {
  search: string
  status: TaskStatus | 'all'
  complexity: TaskComplexity | 'all'
  type: TaskType | 'all'
  projectId: string | 'all'
  meetingId: string | 'all'
  dateRange: 'all' | '7days' | '30days' | '90days'
}

export interface TaskFiltersProps {
  filters: TaskFiltersState
  onFiltersChange: (filters: TaskFiltersState) => void
  projects: Array<{ id: string; name: string; githubRepoName: string }> | undefined
  meetings: Array<{ id: string; title: string; projectId: string }> | undefined
  isLoadingProjects?: boolean
  isLoadingMeetings?: boolean
  className?: string
}

export const defaultFilters: TaskFiltersState = {
  search: '',
  status: 'all',
  complexity: 'all',
  type: 'all',
  projectId: 'all',
  meetingId: 'all',
  dateRange: 'all',
}
