'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, Spinner } from '@/components/ui'
import { TaskCard, TaskFilters, defaultFilters } from '@/components/features'
import type { TaskFiltersState, TaskMeetingInfo, TaskProjectInfo, TaskExportInfo } from '@/components/features'
import { useTasks, useDeleteTask, useUpdateTask, useProjects, useMeetings, useTasksExports } from '@/hooks'
import type { TaskStatus, Task } from '@/types'

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get URL params for initial filter state
  const urlProjectId = searchParams.get('projectId') || undefined
  const urlMeetingId = searchParams.get('meetingId') || undefined

  // Filter state
  const [filters, setFilters] = useState<TaskFiltersState>({
    ...defaultFilters,
    projectId: urlProjectId || 'all',
    meetingId: urlMeetingId || 'all',
  })

  // Fetch projects and meetings for filter dropdowns
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const { data: meetings, isLoading: isLoadingMeetings } = useMeetings()

  // Fetch tasks with server-side filters
  const { data: tasks, isLoading: isLoadingTasks, error } = useTasks({
    projectId: filters.projectId === 'all' ? undefined : filters.projectId,
    meetingId: filters.meetingId === 'all' ? undefined : filters.meetingId,
    status: filters.status === 'all' ? undefined : filters.status,
    complexity: filters.complexity === 'all' ? undefined : filters.complexity,
    type: filters.type === 'all' ? undefined : filters.type,
  })

  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  // Get IDs of exported tasks to fetch their export info
  const exportedTaskIds = useMemo(() => {
    if (!tasks) return []
    return tasks
      .filter((t) => t.status === 'exported')
      .map((t) => t.id)
  }, [tasks])

  // Fetch exports for exported tasks
  const { exportsMap } = useTasksExports(exportedTaskIds)

  // Create lookup maps for projects and meetings
  const projectsMap = useMemo(() => {
    const map = new Map<string, TaskProjectInfo>()
    if (projects) {
      projects.forEach((p) => {
        map.set(p.id, {
          id: p.id,
          name: p.name,
          githubRepoName: p.githubRepoName,
          githubOwner: p.githubOwner,
        })
      })
    }
    return map
  }, [projects])

  const meetingsMap = useMemo(() => {
    const map = new Map<string, TaskMeetingInfo>()
    if (meetings) {
      meetings.forEach((m) => {
        map.set(m.id, {
          id: m.id,
          title: m.title,
        })
      })
    }
    return map
  }, [meetings])

  // Apply client-side filters (search and date range)
  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const titleMatch = task.title.toLowerCase().includes(searchLower)
        const descMatch = task.description.toLowerCase().includes(searchLower)
        if (!titleMatch && !descMatch) return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const taskDate = new Date(task.createdAt)
        const now = new Date()
        const daysAgo = {
          '7days': 7,
          '30days': 30,
          '90days': 90,
        }[filters.dateRange]

        if (daysAgo) {
          const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
          if (taskDate < cutoffDate) return false
        }
      }

      return true
    })
  }, [tasks, filters.search, filters.dateRange])

  // Prepare projects and meetings lists for filters
  const projectsList = useMemo(() => {
    return projects?.map((p) => ({
      id: p.id,
      name: p.name,
      githubRepoName: p.githubRepoName,
    }))
  }, [projects])

  const meetingsList = useMemo(() => {
    return meetings?.map((m) => ({
      id: m.id,
      title: m.title,
      projectId: m.projectId,
    }))
  }, [meetings])

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

  // Get export info for a task from the exports map
  const getExportInfo = (task: Task): TaskExportInfo | undefined => {
    if (task.status !== 'exported') return undefined
    const exportInfo = exportsMap.get(task.id)
    if (!exportInfo) return undefined
    return {
      id: exportInfo.id,
      status: exportInfo.status,
      externalUrl: exportInfo.externalUrl,
      issueNumber: exportInfo.issueNumber,
    }
  }

  const isLoading = isLoadingTasks || isLoadingProjects || isLoadingMeetings

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
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-surface-hover text-text rounded-md hover:bg-border transition-colors"
              >
                Try Again
              </button>
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
            {filteredTasks.length > 0 && (
              <span className="ml-2 text-text-muted">
                ({filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        projects={projectsList}
        meetings={meetingsList}
        isLoadingProjects={isLoadingProjects}
        isLoadingMeetings={isLoadingMeetings}
      />

      {/* Tasks grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              meeting={meetingsMap.get(task.meetingId)}
              project={projectsMap.get(task.projectId)}
              latestExport={getExportInfo(task)}
              onClick={() => router.push(`/tasks/${task.id}`)}
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
                {filters.search ||
                 filters.status !== 'all' ||
                 filters.complexity !== 'all' ||
                 filters.type !== 'all' ||
                 filters.projectId !== 'all' ||
                 filters.meetingId !== 'all' ||
                 filters.dateRange !== 'all'
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
