export type TaskStatus = 'pending' | 'analyzing' | 'analyzed' | 'exported' | 'archived'
export type TaskType = 'feature' | 'bugfix' | 'modification' | 'documentation' | 'refactor'
export type TaskComplexity = 'simple' | 'moderate' | 'critical'

export interface Task {
  id: string
  meetingId: string
  projectId: string
  title: string
  description: string
  type: TaskType
  complexity: TaskComplexity
  status: TaskStatus
  impactedFilesPreview: string[]
  estimatedFilesCount: number
  priority: number
  createdAt: string
  updatedAt: string
}

export interface TaskWithDetails extends Task {
  analyses: Array<{
    id: string
    status: string
    startedAt: string
    completedAt: string | null
  }>
  exports: Array<{
    id: string
    status: string
    externalUrl: string | null
  }>
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  type?: TaskType
  complexity?: TaskComplexity
  status?: TaskStatus
  priority?: number
  estimatedFilesCount?: number
  impactedFilesPreview?: string[]
}

export interface TaskStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byComplexity: Record<string, number>
}
