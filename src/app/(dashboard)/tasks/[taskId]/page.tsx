'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  FolderIcon,
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  ListBulletIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  CpuChipIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTask, useUpdateTask, useDeleteTask, useEstimateTask } from '@/hooks/useTasks'
import { useLatestAnalysis } from '@/hooks/useTaskAnalysis'
import { useExportToGitHub, useTaskExports } from '@/hooks/useExport'
import { Button, Card, CardContent, CardHeader, Badge, Spinner, useToast } from '@/components/ui'
import { AnalysisProgress } from '@/components/features'
import type { TaskStatus, TaskType, TaskComplexity, ResultEvent } from '@/types'

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>
}

const statusConfig: Record<
  TaskStatus,
  { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }
> = {
  pending: { label: 'Pending', color: 'default' },
  analyzing: { label: 'Analyzing', color: 'warning' },
  analyzed: { label: 'Analyzed', color: 'primary' },
  exported: { label: 'Exported', color: 'success' },
  archived: { label: 'Archived', color: 'default' },
}

const typeConfig: Record<
  TaskType,
  { label: string; color: 'task-feature' | 'task-bugfix' | 'task-modification' | 'task-documentation' | 'task-refactor'; icon: React.ComponentType<{ className?: string }> }
> = {
  feature: { label: 'Feature', color: 'task-feature', icon: DocumentTextIcon },
  bugfix: { label: 'Bug Fix', color: 'task-bugfix', icon: ExclamationTriangleIcon },
  modification: { label: 'Modification', color: 'task-modification', icon: ArrowPathIcon },
  documentation: { label: 'Documentation', color: 'task-documentation', icon: DocumentTextIcon },
  refactor: { label: 'Refactor', color: 'task-refactor', icon: CodeBracketIcon },
}

const complexityConfig: Record<
  TaskComplexity,
  { label: string; color: 'complexity-simple' | 'complexity-moderate' | 'complexity-critical' }
> = {
  simple: { label: 'Simple', color: 'complexity-simple' },
  moderate: { label: 'Moderate', color: 'complexity-moderate' },
  critical: { label: 'Critical', color: 'complexity-critical' },
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = use(params)
  const router = useRouter()
  const toast = useToast()

  const [showStreamingAnalysis, setShowStreamingAnalysis] = useState(false)
  const [streamingResult, setStreamingResult] = useState<ResultEvent | null>(null)
  const [exportedIssue, setExportedIssue] = useState<{ url: string; id: string } | null>(null)

  const { data: task, isLoading, error } = useTask(taskId)
  const { data: latestAnalysis, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useLatestAnalysis(taskId)
  const { data: taskExports } = useTaskExports(taskId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const estimateTask = useEstimateTask()
  const exportToGitHub = useExportToGitHub()

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTask.mutateAsync({ taskId, data: { status } })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(taskId)
      router.push('/tasks')
    }
  }

  const handleEstimate = async () => {
    await estimateTask.mutateAsync(taskId)
  }

  const handleStartAnalysis = () => {
    setShowStreamingAnalysis(true)
    setStreamingResult(null)
  }

  const handleAnalysisComplete = (result: ResultEvent) => {
    setStreamingResult(result)
    // Refetch the full analysis data
    refetchAnalysis()
    toast.success('Analysis complete!', result.summary)
  }

  const handleAnalysisError = (error: { code: string; message: string }) => {
    toast.error('Analysis failed', error.message)
  }

  const handleCloseStreamingAnalysis = () => {
    setShowStreamingAnalysis(false)
  }

  const handleExportToGitHub = async () => {
    try {
      const result = await exportToGitHub.mutateAsync({
        taskId,
        options: {
          labels: [task?.type || 'feature', 'from-distill'],
        },
      })
      if (result.status === 'success' && result.externalUrl) {
        setExportedIssue({ url: result.externalUrl, id: result.externalId })
        toast.success('Issue GitHub créée !', `Issue #${result.externalId} créée avec succès.`)
      }
    } catch {
      toast.error('Erreur', 'Impossible de créer l\'issue GitHub.')
    }
  }

  // Get the current GitHub issue info (from state or from existing exports)
  const githubIssue = exportedIssue || (taskExports && taskExports.length > 0
    ? { url: taskExports[0].externalUrl, id: taskExports[0].externalId }
    : null)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-error" />
        <p className="text-text-secondary">Task not found</p>
        <Button variant="ghost" onClick={() => router.push('/tasks')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
    )
  }

  const status = statusConfig[task.status as TaskStatus]
  const type = typeConfig[task.type as TaskType]
  const complexity = complexityConfig[task.complexity as TaskComplexity]
  const TypeIcon = type.icon

  // Build current summary from streaming result if available
  const currentSummary = streamingResult
    ? {
        analysisId: streamingResult.analysisId,
        summary: streamingResult.summary,
        filesToCreate: streamingResult.stats.filesToCreate,
        filesToModify: streamingResult.stats.filesToModify,
        implementationSteps: 0, // Will be available in full analysis
        risks: 0, // Will be available in full analysis
        stats: streamingResult.stats,
      }
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mt-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={type.color}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {type.label}
              </Badge>
              <Badge variant={complexity.color}>{complexity.label}</Badge>
              <Badge variant={status.color}>{status.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-text">{task.title}</h1>
            <p className="mt-1 text-sm text-text-muted">
              Priority: {task.priority} · Created{' '}
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartAnalysis}
            disabled={showStreamingAnalysis}
          >
            {showStreamingAnalysis ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {showStreamingAnalysis ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          {/* Show "See issue" if already exported, otherwise show export button */}
          {githubIssue ? (
            <a
              href={githubIssue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-2 rounded-md bg-success/20 px-3 text-sm font-medium text-success hover:bg-success/30 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              See issue #{githubIssue.id}
            </a>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportToGitHub}
              disabled={exportToGitHub.isPending || (!latestAnalysis && !streamingResult)}
              title={!latestAnalysis && !streamingResult ? 'Run an analysis first' : 'Export to GitHub Issues'}
            >
              {exportToGitHub.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <ArrowTopRightOnSquareIcon className="mr-2 h-4 w-4" />
              )}
              {exportToGitHub.isPending ? 'Exporting...' : 'Export to GitHub'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEstimate}
            disabled={estimateTask.isPending}
          >
            {estimateTask.isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <ChartBarIcon className="mr-2 h-4 w-4" />
            )}
            Estimate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Streaming Analysis Progress */}
      {showStreamingAnalysis && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseStreamingAnalysis}
            className="absolute right-2 top-2 z-10"
            aria-label="Close analysis"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
          <AnalysisProgress
            taskId={taskId}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
            autoStart
          />
        </div>
      )}

      {/* Analysis Result Summary */}
      {currentSummary && !showStreamingAnalysis && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CpuChipIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-text">Analysis Result</h2>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg bg-surface p-4">
              <h3 className="mb-2 text-sm font-medium text-text-muted">Summary</h3>
              <p className="text-text">{currentSummary.summary}</p>
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
                <DocumentPlusIcon className="mx-auto mb-2 h-6 w-6 text-success" />
                <p className="text-2xl font-bold text-success">{currentSummary.filesToCreate}</p>
                <p className="text-sm text-success/80">Files to Create</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-center">
                <PencilSquareIcon className="mx-auto mb-2 h-6 w-6 text-warning" />
                <p className="text-2xl font-bold text-warning">{currentSummary.filesToModify}</p>
                <p className="text-sm text-warning/80">Files to Modify</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
                <ListBulletIcon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold text-primary">{currentSummary.implementationSteps}</p>
                <p className="text-sm text-primary/80">Steps</p>
              </div>
              <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-center">
                <ShieldExclamationIcon className="mx-auto mb-2 h-6 w-6 text-error" />
                <p className="text-2xl font-bold text-error">{currentSummary.risks}</p>
                <p className="text-sm text-error/80">Risks</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-surface p-4 text-sm">
              <span className="text-text-muted">
                <strong className="text-text">{currentSummary.stats.iterations}</strong> iterations
              </span>
              <span className="text-border">·</span>
              <span className="text-text-muted">
                <strong className="text-text">{currentSummary.stats.toolCalls}</strong> tool calls
              </span>
              <span className="text-border">·</span>
              <span className="text-text-muted">
                <strong className="text-text">{currentSummary.stats.tokensUsed.input.toLocaleString()}</strong> input tokens
              </span>
              <span className="text-border">·</span>
              <span className="text-text-muted">
                <strong className="text-text">{currentSummary.stats.tokensUsed.output.toLocaleString()}</strong> output tokens
              </span>
              <span className="text-border">·</span>
              <span className="text-text-muted">
                <strong className="text-text">{(currentSummary.stats.durationMs / 1000).toFixed(1)}s</strong> duration
              </span>
            </div>

            <p className="text-xs text-text-muted">
              Analysis ID: <code className="rounded bg-surface px-1">{currentSummary.analysisId}</code>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Description</h2>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-text-secondary">
                {task.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* No Analysis Yet */}
          {!currentSummary && !latestAnalysis && !isLoadingAnalysis && !showStreamingAnalysis && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <PlayIcon className="mb-4 h-12 w-12 text-text-muted" />
                <h3 className="mb-2 text-lg font-medium text-text">No Analysis Yet</h3>
                <p className="mb-4 text-text-secondary">
                  Run an AI analysis to get implementation guidance
                </p>
                <Button onClick={handleStartAnalysis} disabled={showStreamingAnalysis}>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Run Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Full Analysis Details */}
          {latestAnalysis && (
            <>
              {/* Implementation Steps */}
              {latestAnalysis.implementationSteps && latestAnalysis.implementationSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ListBulletIcon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-text">Implementation Steps</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {latestAnalysis.implementationSteps
                        .sort((a, b) => a.order - b.order)
                        .map((step) => (
                          <li key={step.order} className="rounded-lg border border-border bg-surface p-4">
                            <div className="mb-2 flex items-start gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {step.order}
                              </span>
                              <p className="text-text">{step.description}</p>
                            </div>
                            {step.files && step.files.length > 0 && (
                              <div className="ml-9 mt-2">
                                <p className="mb-1 text-xs font-medium text-text-muted">Files:</p>
                                <div className="flex flex-wrap gap-1">
                                  {step.files.map((file, idx) => (
                                    <code key={idx} className="rounded bg-surface-hover px-2 py-0.5 text-xs text-text-secondary">
                                      {file}
                                    </code>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.details && step.details.length > 0 && (
                              <div className="ml-9 mt-2">
                                <p className="mb-1 text-xs font-medium text-text-muted">Details:</p>
                                <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
                                  {step.details.map((detail, idx) => (
                                    <li key={idx}>{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {step.code && (
                              <div className="ml-9 mt-3">
                                <p className="mb-1 text-xs font-medium text-text-muted">Code:</p>
                                <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs text-text-secondary">
                                  <code>{step.code}</code>
                                </pre>
                              </div>
                            )}
                          </li>
                        ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Files to Modify */}
              {latestAnalysis.filesToModify && latestAnalysis.filesToModify.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PencilSquareIcon className="h-5 w-5 text-warning" />
                      <h2 className="text-lg font-semibold text-text">Files to Modify</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latestAnalysis.filesToModify.map((file, idx) => (
                        <div key={idx} className="rounded-lg border border-border bg-surface p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-text-muted" />
                            <code className="text-sm font-medium text-text">{file.path}</code>
                          </div>
                          <div className="space-y-2">
                            {file.changes.map((change, changeIdx) => (
                              <div key={changeIdx} className="rounded-md bg-surface-hover p-3">
                                <p className="mb-1 text-xs font-medium text-warning">{change.reason}</p>
                                <p className="text-sm text-text-secondary">{change.description}</p>
                                {change.location && (
                                  <p className="mt-1 text-xs text-text-muted">
                                    Location: <code className="rounded bg-background px-1">{change.location}</code>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Files to Create */}
              {latestAnalysis.filesToCreate && latestAnalysis.filesToCreate.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DocumentPlusIcon className="h-5 w-5 text-success" />
                      <h2 className="text-lg font-semibold text-text">Files to Create</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {latestAnalysis.filesToCreate.map((file, idx) => (
                        <div key={idx} className="rounded-lg border border-border bg-surface p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-success" />
                            <code className="text-sm font-medium text-text">{file.path}</code>
                          </div>
                          <p className="text-sm text-text-secondary">{file.purpose}</p>
                          {file.dependencies && file.dependencies.length > 0 && (
                            <div className="mt-2">
                              <p className="mb-1 text-xs font-medium text-text-muted">Dependencies:</p>
                              <div className="flex flex-wrap gap-1">
                                {file.dependencies.map((dep, depIdx) => (
                                  <code key={depIdx} className="rounded bg-surface-hover px-2 py-0.5 text-xs text-text-secondary">
                                    {dep}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {latestAnalysis.risks && latestAnalysis.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldExclamationIcon className="h-5 w-5 text-error" />
                      <h2 className="text-lg font-semibold text-text">Risks & Mitigations</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {latestAnalysis.risks.map((risk, idx) => (
                        <div key={idx} className="rounded-lg border border-error/20 bg-error/5 p-4">
                          <div className="mb-2 flex items-start gap-2">
                            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                            <p className="text-sm text-text">{risk.description}</p>
                          </div>
                          <div className="ml-6 flex items-start gap-2 rounded-md bg-success/10 p-2">
                            <LightBulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <p className="text-sm text-text-secondary">{risk.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reasoning */}
              {latestAnalysis.reasoning && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <LightBulbIcon className="h-5 w-5 text-accent" />
                      <h2 className="text-lg font-semibold text-text">AI Reasoning</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-text-secondary">{latestAnalysis.reasoning}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Impacted Files Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text">Impacted Files (Preview)</h2>
                <span className="text-sm text-text-muted">
                  ~{task.estimatedFilesCount} files estimated
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {task.impactedFilesPreview && task.impactedFilesPreview.length > 0 ? (
                <ul className="space-y-2">
                  {task.impactedFilesPreview.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 rounded-md bg-surface-hover px-3 py-2 font-mono text-sm"
                    >
                      <FolderIcon className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">{file}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted">
                  No impacted files preview available. Run analysis for detailed file list.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Exports History */}
          {'exports' in task && task.exports && task.exports.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text">Export History</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.exports.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            exp.status === 'completed'
                              ? 'bg-success'
                              : exp.status === 'pending'
                              ? 'bg-warning'
                              : 'bg-error'
                          )}
                        />
                        <p className="text-sm font-medium text-text">
                          {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                        </p>
                      </div>
                      {exp.externalUrl && (
                        <a
                          href={exp.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          View
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Status</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.keys(statusConfig) as TaskStatus[]).map((s) => {
                  const config = statusConfig[s]
                  const isActive = task.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updateTask.isPending}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-surface-hover'
                      )}
                    >
                      <span>{config.label}</span>
                      {isActive && <CheckCircleIcon className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Details</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Meeting</dt>
                  <dd>
                    <button
                      onClick={() => router.push(`/meetings/${task.meetingId}`)}
                      className="text-sm text-primary hover:underline"
                    >
                      View Meeting
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Project</dt>
                  <dd>
                    <button
                      onClick={() => router.push(`/projects/${task.projectId}`)}
                      className="text-sm text-primary hover:underline"
                    >
                      View Project
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Priority</dt>
                  <dd className="text-sm text-text">{task.priority}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Files Count</dt>
                  <dd className="text-sm text-text">~{task.estimatedFilesCount}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Created</dt>
                  <dd className="flex items-center gap-1 text-sm text-text">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-muted">Updated</dt>
                  <dd className="flex items-center gap-1 text-sm text-text">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
