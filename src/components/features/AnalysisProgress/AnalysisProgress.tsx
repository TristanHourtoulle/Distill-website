'use client'

import { useEffect, useRef } from 'react'
import {
  PlayIcon,
  StopIcon,
  FolderIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  CpuChipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useAnalysisStream } from '@/hooks'
import { Button, Card, CardContent, Spinner } from '@/components/ui'
import type { AnalysisProgressProps } from './AnalysisProgress.types'
import type { AnalysisPhase, ToolName } from '@/types'

// Phase configuration
const phaseConfig: Record<AnalysisPhase | 'idle', { label: string; icon: React.ElementType; color: string }> = {
  idle: { label: 'Ready', icon: PlayIcon, color: 'text-text-muted' },
  initializing: { label: 'Initializing', icon: SparklesIcon, color: 'text-primary' },
  loading: { label: 'Loading context', icon: ArrowPathIcon, color: 'text-primary' },
  exploring: { label: 'Exploring codebase', icon: MagnifyingGlassIcon, color: 'text-accent' },
  analyzing: { label: 'Analyzing', icon: CpuChipIcon, color: 'text-primary' },
  tool_execution: { label: 'Executing tools', icon: CodeBracketIcon, color: 'text-warning' },
  synthesizing: { label: 'Synthesizing response', icon: SparklesIcon, color: 'text-accent' },
  parsing: { label: 'Parsing results', icon: DocumentTextIcon, color: 'text-primary' },
  saving: { label: 'Saving analysis', icon: ArrowPathIcon, color: 'text-primary' },
  complete: { label: 'Complete', icon: CheckCircleIcon, color: 'text-success' },
  error: { label: 'Error', icon: ExclamationTriangleIcon, color: 'text-error' },
}

// Tool icon mapping
const toolIcons: Record<ToolName, React.ElementType> = {
  list_dir: FolderIcon,
  read_file: DocumentTextIcon,
  search_code: MagnifyingGlassIcon,
  get_imports: CodeBracketIcon,
}

export function AnalysisProgress({
  taskId,
  onComplete,
  onError,
  className,
  autoStart = false,
}: AnalysisProgressProps) {
  const toolHistoryRef = useRef<HTMLDivElement>(null)

  const {
    phase,
    message,
    progress,
    toolHistory,
    filesDiscovered,
    result,
    error,
    isLoading,
    startAnalysis,
    stopAnalysis,
  } = useAnalysisStream({
    includeToolResults: true,
    includeThinking: false,
    onComplete,
    onError: (err) => onError?.({ code: err.code, message: err.message }),
  })

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isLoading && phase === 'idle') {
      startAnalysis(taskId)
    }
  }, [autoStart, taskId, isLoading, phase, startAnalysis])

  // Auto-scroll tool history
  useEffect(() => {
    if (toolHistoryRef.current) {
      toolHistoryRef.current.scrollTop = toolHistoryRef.current.scrollHeight
    }
  }, [toolHistory])

  const phaseInfo = phaseConfig[phase]
  const PhaseIcon = phaseInfo.icon

  // Group files by action
  const filesToCreate = filesDiscovered.filter((f) => f.action === 'create')
  const filesToModify = filesDiscovered.filter((f) => f.action === 'modify')

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header with phase indicator */}
        <div className="flex items-center justify-between border-b border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg bg-surface-hover', phaseInfo.color)}>
              {isLoading && phase !== 'complete' && phase !== 'error' ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PhaseIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className={cn('font-semibold', phaseInfo.color)}>{phaseInfo.label}</h3>
              <p className="text-sm text-text-muted">{message || 'Waiting to start...'}</p>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {!isLoading && phase === 'idle' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => startAnalysis(taskId)}
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Start Analysis
              </Button>
            )}
            {isLoading && (
              <Button
                variant="danger"
                size="sm"
                onClick={stopAnalysis}
              >
                <StopIcon className="mr-2 h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Progress stats bar */}
        {(isLoading || phase === 'complete') && (
          <div className="flex items-center gap-6 border-b border-border bg-surface-hover px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <ArrowPathIcon className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Iteration:</span>
              <span className="font-medium text-text">{progress.iteration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CodeBracketIcon className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Tools:</span>
              <span className="font-medium text-text">{progress.toolCalls}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Tokens:</span>
              <span className="font-medium text-text">
                {(progress.tokensUsed.input + progress.tokensUsed.output).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Time:</span>
              <span className="font-medium text-text">
                {(progress.durationMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Tool history - like Claude's thinking */}
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
              <CpuChipIcon className="h-4 w-4 text-text-muted" />
              <h4 className="text-sm font-medium text-text">Agent Activity</h4>
              {toolHistory.length > 0 && (
                <span className="text-xs text-text-muted">({toolHistory.length})</span>
              )}
            </div>
            <div
              ref={toolHistoryRef}
              className="h-64 overflow-y-auto p-4 font-mono text-xs"
            >
              {toolHistory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-text-muted">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Waiting for agent activity...</span>
                    </div>
                  ) : (
                    <span>No activity yet</span>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {toolHistory.map((item, index) => {
                    const ToolIcon = toolIcons[item.tool as ToolName] || CodeBracketIcon
                    const isLast = index === toolHistory.length - 1
                    const isPending = isLast && item.result === undefined && isLoading

                    return (
                      <div
                        key={index}
                        className={cn(
                          'rounded-lg border p-3 transition-all',
                          isPending
                            ? 'border-primary/50 bg-primary/5'
                            : item.success === false
                            ? 'border-error/30 bg-error/5'
                            : 'border-border bg-surface'
                        )}
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <ToolIcon className={cn(
                            'h-4 w-4',
                            isPending ? 'text-primary' : 'text-text-muted'
                          )} />
                          <span className={cn(
                            'font-medium',
                            isPending ? 'text-primary' : 'text-text'
                          )}>
                            {item.tool}
                          </span>
                          {isPending && (
                            <Spinner size="sm" className="ml-auto" />
                          )}
                          {item.durationMs !== undefined && (
                            <span className="ml-auto text-text-muted">
                              {item.durationMs}ms
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary">{item.description}</p>
                        {item.result && (
                          <p className={cn(
                            'mt-2 rounded bg-surface-hover px-2 py-1',
                            item.success === false ? 'text-error' : 'text-success'
                          )}>
                            {item.result}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Files discovered */}
          <div>
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
              <FolderIcon className="h-4 w-4 text-text-muted" />
              <h4 className="text-sm font-medium text-text">Files Discovered</h4>
              {filesDiscovered.length > 0 && (
                <span className="text-xs text-text-muted">({filesDiscovered.length})</span>
              )}
            </div>
            <div className="h-64 overflow-y-auto p-4">
              {filesDiscovered.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-text-muted">
                  {isLoading ? (
                    <span>Discovering files...</span>
                  ) : (
                    <span>No files discovered yet</span>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Files to create */}
                  {filesToCreate.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <DocumentPlusIcon className="h-4 w-4 text-success" />
                        <h5 className="text-xs font-medium text-success">
                          To Create ({filesToCreate.length})
                        </h5>
                      </div>
                      <div className="space-y-1">
                        {filesToCreate.map((file, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-success/20 bg-success/5 px-2 py-1.5"
                          >
                            <code className="text-xs text-text">{file.path}</code>
                            {file.description && (
                              <p className="mt-0.5 text-xs text-text-muted">
                                {file.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files to modify */}
                  {filesToModify.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <PencilSquareIcon className="h-4 w-4 text-warning" />
                        <h5 className="text-xs font-medium text-warning">
                          To Modify ({filesToModify.length})
                        </h5>
                      </div>
                      <div className="space-y-1">
                        {filesToModify.map((file, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-warning/20 bg-warning/5 px-2 py-1.5"
                          >
                            <code className="text-xs text-text">{file.path}</code>
                            {file.description && (
                              <p className="mt-0.5 text-xs text-text-muted">
                                {file.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="border-t border-error/30 bg-error/10 p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-error" />
              <div>
                <p className="font-medium text-error">{error.code}</p>
                <p className="text-sm text-error/80">{error.message}</p>
                {error.recoverable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => startAnalysis(taskId)}
                  >
                    <ArrowPathIcon className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result summary */}
        {result && (
          <div className="border-t border-success/30 bg-success/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-success" />
              <div className="flex-1">
                <p className="font-medium text-success">Analysis Complete</p>
                <p className="mt-1 text-sm text-text-secondary">{result.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span>
                    <strong className="text-text">{result.stats.filesToCreate}</strong> files to create
                  </span>
                  <span>
                    <strong className="text-text">{result.stats.filesToModify}</strong> files to modify
                  </span>
                  <span>
                    <strong className="text-text">{result.stats.iterations}</strong> iterations
                  </span>
                  <span>
                    <strong className="text-text">{(result.stats.durationMs / 1000).toFixed(1)}s</strong> total
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
