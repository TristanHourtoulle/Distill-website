'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ClipboardDocumentListIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Button, Card, CardContent, Spinner, Badge } from '@/components/ui'
import { TaskCard } from '@/components/features'
import { useTasks, useDeleteTask, useUpdateTask } from '@/hooks'
import type { TaskStatus, TaskComplexity, TaskType } from '@/types'

const statusFilters: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'exported', label: 'Exported' },
  { value: 'archived', label: 'Archived' },
]

const complexityFilters: { value: TaskComplexity | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'simple', label: 'Simple' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'critical', label: 'Critical' },
]

export default function TasksPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId') || undefined
  const meetingId = searchParams.get('meetingId') || undefined

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [complexityFilter, setComplexityFilter] = useState<TaskComplexity | 'all'>('all')

  const { data: tasks, isLoading, error } = useTasks({
    projectId,
    meetingId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    complexity: complexityFilter === 'all' ? undefined : complexityFilter,
  })

  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ taskId, data: { status } })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Tasks</h1>
            <p className="text-text-secondary mt-1">
              View and manage extracted tasks
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-error mb-4">Failed to load tasks</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Tasks</h1>
          <p className="text-text-secondary mt-1">
            View and manage extracted tasks
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-text-muted" />
              <span className="text-sm text-text-secondary">Filters:</span>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Status:</span>
              <div className="flex gap-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-hover text-text-secondary hover:text-text'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Complexity:</span>
              <div className="flex gap-1">
                {complexityFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setComplexityFilter(filter.value)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      complexityFilter === filter.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-hover text-text-secondary hover:text-text'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks grid */}
      {tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={() => handleDeleteTask(task.id)}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-surface-hover rounded-full mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-text font-medium mb-1">No tasks found</h3>
              <p className="text-text-secondary text-sm">
                {statusFilter !== 'all' || complexityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Tasks will appear here after parsing meetings'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
