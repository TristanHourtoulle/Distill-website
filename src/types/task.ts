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

// POST /api/agent/analyze/:taskId response
export interface AnalysisSummary {
  analysisId: string
  summary: string
  filesToCreate: number
  filesToModify: number
  implementationSteps: number
  risks: number
  stats: {
    iterations: number
    toolCalls: number
    tokensUsed: {
      input: number
      output: number
    }
    durationMs: number
  }
}

// Full analysis details (from GET /api/agent/analysis/:id)
export interface FileToCreate {
  path: string
  purpose: string
  dependencies: string[]
}

export interface FileChange {
  reason: string
  location: string
  description: string
}

export interface FileToModify {
  path: string
  changes: FileChange[]
}

export interface ImplementationStep {
  order: number
  description: string
  files?: string[]
  code?: string
  details?: string[]
}

export interface AnalysisRisk {
  description: string
  mitigation: string
}

export interface AnalysisLog {
  id: string
  taskAnalysisId: string
  stepNumber: number
  actionType: string
  actionInput: string
  actionOutput: string
  tokensIn: number | null
  tokensOut: number | null
  durationMs: number
  createdAt: string
}

export interface TaskAnalysis {
  id: string
  taskId: string
  status: AnalysisStatus
  filesToCreate: FileToCreate[]
  filesToModify: FileToModify[]
  implementationSteps: ImplementationStep[]
  risks: AnalysisRisk[]
  dependencies: string[]
  reasoning: string
  tokensUsed: number
  toolCallsCount: number
  errorMessage: string | null
  startedAt: string
  completedAt: string | null
  logs?: AnalysisLog[]
}

export interface AnalysisHistoryItem {
  id: string
  taskId: string
  status: AnalysisStatus
  startedAt: string
  completedAt: string | null
}
