'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UpdateTaskInput, TaskStatus, TaskComplexity, TaskType } from '@/types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: {
    projectId?: string
    meetingId?: string
    status?: TaskStatus
    complexity?: TaskComplexity
    type?: TaskType
  }) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: (projectId: string) => [...taskKeys.all, 'stats', projectId] as const,
  complexity: (projectId: string) => [...taskKeys.all, 'complexity', projectId] as const,
}

export function useTasks(filters?: {
  projectId?: string
  meetingId?: string
  status?: TaskStatus
  complexity?: TaskComplexity
  type?: TaskType
}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const response = await api.tasks.list(filters)
      return response.data
    },
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: async () => {
      const response = await api.tasks.get(taskId)
      return response.data
    },
    enabled: !!taskId,
  })
}

export function useTaskStats(projectId: string) {
  return useQuery({
    queryKey: taskKeys.stats(projectId),
    queryFn: async () => {
      const response = await api.tasks.getStats(projectId)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useTaskComplexity(projectId: string) {
  return useQuery({
    queryKey: taskKeys.complexity(projectId),
    queryFn: async () => {
      const response = await api.tasks.getComplexity(projectId)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      api.tasks.update(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => api.tasks.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useBulkUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskIds, status }: { taskIds: string[]; status: TaskStatus }) =>
      api.tasks.bulkUpdateStatus(taskIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useEstimateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => api.tasks.estimate(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}
