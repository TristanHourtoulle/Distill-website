'use client'

import { use } from 'react'
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
  PlusCircleIcon,
  PencilSquareIcon,
  ListBulletIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  DocumentPlusIcon,
  DocumentMinusIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTask, useUpdateTask, useDeleteTask, useEstimateTask } from '@/hooks/useTasks'
import { useLatestAnalysis, useRunAnalysis } from '@/hooks/useTaskAnalysis'
import { Button, Card, CardContent, CardHeader, Badge, Spinner } from '@/components/ui'
import type { TaskStatus, TaskType, TaskComplexity, AnalysisComplexity, RiskSeverity } from '@/types'

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

const analysisComplexityColors: Record<AnalysisComplexity, string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-error',
}

const riskSeverityColors: Record<RiskSeverity, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-error/10 text-error border-error/30',
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = use(params)
  const router = useRouter()

  const { data: task, isLoading, error } = useTask(taskId)
  const { data: latestAnalysis, isLoading: isLoadingAnalysis } = useLatestAnalysis(taskId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const estimateTask = useEstimateTask()
  const runAnalysis = useRunAnalysis()

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

  const handleRunAnalysis = async () => {
    await runAnalysis.mutateAsync(taskId)
  }

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

  const analysisResult = latestAnalysis?.result
  const analysisStats = latestAnalysis?.stats
  const isAnalyzing = runAnalysis.isPending || latestAnalysis?.status === 'running'

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
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          <Button
            variant="secondary"
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

      {/* Analysis Stats Banner */}
      {analysisStats && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-text-muted">
                  Last analysis:{' '}
                  <span className="text-text">
                    {latestAnalysis?.completedAt
                      ? new Date(latestAnalysis.completedAt).toLocaleString()
                      : 'In progress'}
                  </span>
                </span>
                <span className="text-text-muted">
                  Tokens:{' '}
                  <span className="text-text">{analysisStats.tokensUsed.toLocaleString()}</span>
                </span>
                <span className="text-text-muted">
                  Tool calls:{' '}
                  <span className="text-text">{analysisStats.toolCallsCount}</span>
                </span>
                <span className="text-text-muted">
                  Duration:{' '}
                  <span className="text-text">
                    {(analysisStats.durationMs / 1000).toFixed(1)}s
                  </span>
                </span>
              </div>
              <Badge variant={latestAnalysis?.status === 'completed' ? 'success' : 'warning'}>
                {latestAnalysis?.status}
              </Badge>
            </div>
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

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Reasoning */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-text">AI Reasoning</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-text-secondary">
                    {analysisResult.reasoning}
                  </p>
                </CardContent>
              </Card>

              {/* Files to Create */}
              {analysisResult.filesToCreate.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DocumentPlusIcon className="h-5 w-5 text-success" />
                        <h2 className="text-lg font-semibold text-text">Files to Create</h2>
                      </div>
                      <Badge variant="success">{analysisResult.filesToCreate.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.filesToCreate.map((file, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border bg-surface-hover p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-success" />
                            <code className="text-sm font-medium text-text">{file.path}</code>
                          </div>
                          <p className="mb-2 text-sm text-text-secondary">{file.purpose}</p>
                          {file.dependencies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {file.dependencies.map((dep, i) => (
                                <Badge key={i} variant="default" size="sm">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Files to Modify */}
              {analysisResult.filesToModify.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PencilSquareIcon className="h-5 w-5 text-warning" />
                        <h2 className="text-lg font-semibold text-text">Files to Modify</h2>
                      </div>
                      <Badge variant="warning">{analysisResult.filesToModify.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.filesToModify.map((file, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border bg-surface-hover p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-warning" />
                            <code className="text-sm font-medium text-text">{file.path}</code>
                          </div>
                          <p className="mb-1 text-sm text-text-secondary">
                            <strong>Changes:</strong> {file.changes}
                          </p>
                          <p className="text-sm text-text-muted">
                            <strong>Reason:</strong> {file.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Implementation Steps */}
              {analysisResult.implementationSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ListBulletIcon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-text">Implementation Steps</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {analysisResult.implementationSteps
                        .sort((a, b) => a.order - b.order)
                        .map((step) => (
                          <li
                            key={step.order}
                            className="flex gap-4 rounded-lg border border-border p-4"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                              {step.order}
                            </div>
                            <div className="flex-1">
                              <p className="mb-2 text-text">{step.description}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    analysisComplexityColors[step.estimatedComplexity]
                                  )}
                                >
                                  {step.estimatedComplexity.toUpperCase()} complexity
                                </span>
                                {step.files.length > 0 && (
                                  <>
                                    <span className="text-text-muted">·</span>
                                    <div className="flex flex-wrap gap-1">
                                      {step.files.map((file, i) => (
                                        <code
                                          key={i}
                                          className="rounded bg-surface px-1.5 py-0.5 text-xs text-text-secondary"
                                        >
                                          {file}
                                        </code>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {analysisResult.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldExclamationIcon className="h-5 w-5 text-error" />
                      <h2 className="text-lg font-semibold text-text">Risks & Mitigations</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.risks.map((risk, index) => (
                        <div
                          key={index}
                          className={cn(
                            'rounded-lg border p-4',
                            riskSeverityColors[risk.severity]
                          )}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium">{risk.type}</span>
                            <Badge
                              variant={
                                risk.severity === 'high'
                                  ? 'error'
                                  : risk.severity === 'medium'
                                  ? 'warning'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="mb-2 text-sm opacity-90">{risk.description}</p>
                          <p className="text-sm">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* No Analysis Yet */}
          {!analysisResult && !isLoadingAnalysis && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <PlayIcon className="mb-4 h-12 w-12 text-text-muted" />
                <h3 className="mb-2 text-lg font-medium text-text">No Analysis Yet</h3>
                <p className="mb-4 text-text-secondary">
                  Run an AI analysis to get detailed implementation guidance
                </p>
                <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <PlayIcon className="mr-2 h-4 w-4" />
                  )}
                  Run Analysis
                </Button>
              </CardContent>
            </Card>
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
