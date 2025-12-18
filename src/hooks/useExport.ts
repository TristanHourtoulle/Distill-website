'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { taskKeys } from './useTasks'

export const exportKeys = {
  all: ['exports'] as const,
  taskExports: (taskId: string) => [...exportKeys.all, 'task', taskId] as const,
  detail: (exportId: string) => [...exportKeys.all, 'detail', exportId] as const,
  projectStats: (projectId: string) => [...exportKeys.all, 'stats', projectId] as const,
}

export function useSetupGitHubIntegration() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.export.setupGitHub()
      return response.data
    },
  })
}

export function useExportToGitHub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      options,
    }: {
      taskId: string
      options?: {
        labels?: string[]
        assignees?: string[]
        milestone?: number
      }
    }) => {
      const response = await api.export.toGitHub(taskId, options)
      return response.data
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: exportKeys.taskExports(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}

export function useBulkExportToGitHub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      taskIds: string[]
      options?: {
        labels?: string[]
        assignees?: string[]
        milestone?: number
      }
    }) => {
      const response = await api.export.bulkToGitHub(data)
      return response.data
    },
    onSuccess: (_, { taskIds }) => {
      // Invalidate queries for all exported tasks
      taskIds.forEach((taskId) => {
        queryClient.invalidateQueries({ queryKey: exportKeys.taskExports(taskId) })
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      })
    },
  })
}

export function useTaskExports(taskId: string) {
  return useQuery({
    queryKey: exportKeys.taskExports(taskId),
    queryFn: async () => {
      const response = await api.export.getTaskExports(taskId)
      return response.data
    },
    enabled: !!taskId,
  })
}

export function useExportDetails(exportId: string) {
  return useQuery({
    queryKey: exportKeys.detail(exportId),
    queryFn: async () => {
      const response = await api.export.getExport(exportId)
      return response.data
    },
    enabled: !!exportId,
  })
}

export function useProjectExportStats(projectId: string) {
  return useQuery({
    queryKey: exportKeys.projectStats(projectId),
    queryFn: async () => {
      const response = await api.export.getProjectStats(projectId)
      return response.data
    },
    enabled: !!projectId,
  })
}
