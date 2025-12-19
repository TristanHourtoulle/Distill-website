/**
 * Analysis Stream Event Types
 * Types for Server-Sent Events from the streaming analysis API
 */

// ============================================
// Phase Types
// ============================================

export type AnalysisPhase =
  | 'initializing'
  | 'loading'
  | 'exploring'
  | 'analyzing'
  | 'tool_execution'
  | 'synthesizing'
  | 'parsing'
  | 'saving'
  | 'complete'
  | 'error'

export type ToolName = 'list_dir' | 'read_file' | 'search_code' | 'get_imports'

// ============================================
// Event Interfaces
// ============================================

export interface PhaseEvent {
  type: 'phase'
  timestamp: number
  phase: AnalysisPhase
  message: string
  analysisId?: string
}

export interface ToolCallEvent {
  type: 'tool_call'
  timestamp: number
  tool: ToolName
  input: Record<string, unknown>
  description: string
  analysisId?: string
}

export interface ToolResultEvent {
  type: 'tool_result'
  timestamp: number
  tool: string
  success: boolean
  summary: string
  durationMs: number
  analysisId?: string
}

export interface ThinkingEvent {
  type: 'thinking'
  timestamp: number
  content: string
  isPartial: boolean
  analysisId?: string
}

export interface ProgressEvent {
  type: 'progress'
  timestamp: number
  iteration: number
  toolCalls: number
  tokensUsed: { input: number; output: number }
  durationMs: number
  analysisId?: string
}

export interface FileDiscoveredEvent {
  type: 'file_discovered'
  timestamp: number
  action: 'create' | 'modify'
  path: string
  description?: string
  analysisId?: string
}

export interface ResultEvent {
  type: 'result'
  timestamp: number
  analysisId: string
  summary: string
  stats: {
    iterations: number
    toolCalls: number
    tokensUsed: { input: number; output: number }
    durationMs: number
    filesToCreate: number
    filesToModify: number
  }
}

export interface ErrorEvent {
  type: 'error'
  timestamp: number
  code: string
  message: string
  recoverable: boolean
}

// ============================================
// Union Type
// ============================================

export type StreamEvent =
  | PhaseEvent
  | ToolCallEvent
  | ToolResultEvent
  | ThinkingEvent
  | ProgressEvent
  | FileDiscoveredEvent
  | ResultEvent
  | ErrorEvent

// ============================================
// State Types
// ============================================

export interface ToolHistoryItem {
  tool: string
  description: string
  input?: Record<string, unknown>
  result?: string
  success?: boolean
  durationMs?: number
  timestamp: number
}

export interface PhaseHistoryItem {
  phase: AnalysisPhase
  message: string
  timestamp: number
}

export interface DiscoveredFile {
  action: 'create' | 'modify'
  path: string
  description?: string
  timestamp: number
}

export interface AnalysisProgress {
  iteration: number
  toolCalls: number
  tokensUsed: { input: number; output: number }
  durationMs: number
}

export interface AnalysisStreamState {
  phase: AnalysisPhase | 'idle'
  message: string
  progress: AnalysisProgress
  toolHistory: ToolHistoryItem[]
  phaseHistory: PhaseHistoryItem[]
  filesDiscovered: DiscoveredFile[]
  thinkingContent: string
  result: ResultEvent | null
  error: ErrorEvent | null
  isLoading: boolean
  analysisId: string | null
}

// ============================================
// Options Types
// ============================================

export interface AnalysisStreamOptions {
  includeToolResults?: boolean
  includeThinking?: boolean
  onEvent?: (event: StreamEvent) => void
  onComplete?: (result: ResultEvent) => void
  onError?: (error: ErrorEvent) => void
}
