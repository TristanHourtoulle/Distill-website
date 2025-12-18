'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types'

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  branches: (id: string) => [...projectKeys.detail(id), 'branches'] as const,
  rules: (id: string) => [...projectKeys.detail(id), 'rules'] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      const response = await api.projects.list()
      return response.data
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const response = await api.projects.get(projectId)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useProjectBranches(projectId: string) {
  return useQuery({
    queryKey: projectKeys.branches(projectId),
    queryFn: async () => {
      const response = await api.projects.getBranches(projectId)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectInput) => api.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectInput }) =>
      api.projects.update(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => api.projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useTriggerProjectIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, priority }: { projectId: string; priority?: 'low' | 'normal' | 'high' }) =>
      api.projects.triggerIndex(projectId, priority),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}
