'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { taskKeys } from './useTasks'
import type { AnalysisSummary } from '@/types'

export const analysisKeys = {
  all: ['analyses'] as const,
  latest: (taskId: string) => [...analysisKeys.all, 'latest', taskId] as const,
  detail: (analysisId: string) => [...analysisKeys.all, 'detail', analysisId] as const,
  history: (taskId: string) => [...analysisKeys.all, 'history', taskId] as const,
}

export function useLatestAnalysis(taskId: string) {
  return useQuery({
    queryKey: analysisKeys.latest(taskId),
    queryFn: async () => {
      const response = await api.agent.getLatestAnalysis(taskId)
      return response.data
    },
    enabled: !!taskId,
  })
}

export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: analysisKeys.detail(analysisId),
    queryFn: async () => {
      const response = await api.agent.getAnalysis(analysisId)
      return response.data
    },
    enabled: !!analysisId,
  })
}

export function useAnalysisHistory(taskId: string) {
  return useQuery({
    queryKey: analysisKeys.history(taskId),
    queryFn: async () => {
      const response = await api.agent.getAnalysisHistory(taskId)
      return response.data
    },
    enabled: !!taskId,
  })
}

export function useRunAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string): Promise<AnalysisSummary> => {
      const response = await api.agent.analyze(taskId)
      return response.data
    },
    onSuccess: (_, taskId) => {
      // Invalidate related queries to refresh analysis data
      queryClient.invalidateQueries({ queryKey: analysisKeys.latest(taskId) })
      queryClient.invalidateQueries({ queryKey: analysisKeys.history(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}
