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

// Analysis types
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed'
export type AnalysisComplexity = 'low' | 'medium' | 'high'
export type RiskSeverity = 'low' | 'medium' | 'high'

export interface FileToCreate {
  path: string
  purpose: string
  dependencies: string[]
}

export interface FileToModify {
  path: string
  changes: string
  reason: string
}

export interface ImplementationStep {
  order: number
  description: string
  files: string[]
  estimatedComplexity: AnalysisComplexity
}

export interface AnalysisRisk {
  type: string
  description: string
  mitigation: string
  severity: RiskSeverity
}

export interface AnalysisResult {
  filesToCreate: FileToCreate[]
  filesToModify: FileToModify[]
  implementationSteps: ImplementationStep[]
  risks: AnalysisRisk[]
  reasoning: string
}

export interface AnalysisStats {
  tokensUsed: number
  toolCallsCount: number
  durationMs: number
}

export interface TaskAnalysis {
  id: string
  taskId: string
  status: AnalysisStatus
  result: AnalysisResult | null
  stats: AnalysisStats | null
  error: string | null
  startedAt: string
  completedAt: string | null
  createdAt: string
}

export interface AnalysisHistoryItem {
  id: string
  taskId: string
  status: AnalysisStatus
  startedAt: string
  completedAt: string | null
  createdAt: string
}
