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
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTask, useUpdateTask, useDeleteTask, useEstimateTask } from '@/hooks/useTasks'
import { Button, Card, CardContent, CardHeader, Badge, Spinner } from '@/components/ui'
import type { TaskStatus, TaskType, TaskComplexity } from '@/types'

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

  const { data: task, isLoading, error } = useTask(taskId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const estimateTask = useEstimateTask()

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

          {/* Impacted Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text">Impacted Files</h2>
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
                  No impacted files preview available. Run estimation to analyze.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Analyses History */}
          {'analyses' in task && task.analyses && task.analyses.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text">Analysis History</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            analysis.status === 'completed'
                              ? 'bg-success'
                              : analysis.status === 'running'
                              ? 'bg-warning'
                              : 'bg-error'
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium text-text">
                            {analysis.status.charAt(0).toUpperCase() +
                              analysis.status.slice(1)}
                          </p>
                          <p className="text-xs text-text-muted">
                            Started {new Date(analysis.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {analysis.completedAt && (
                        <span className="text-xs text-text-muted">
                          Completed {new Date(analysis.completedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
