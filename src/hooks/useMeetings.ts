'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CreateMeetingInput, UpdateMeetingInput, MeetingStatus } from '@/types'

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters?: { projectId?: string; status?: MeetingStatus }) =>
    [...meetingKeys.lists(), filters] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
  tasks: (id: string) => [...meetingKeys.detail(id), 'tasks'] as const,
}

export function useMeetings(filters?: { projectId?: string; status?: MeetingStatus }) {
  return useQuery({
    queryKey: meetingKeys.list(filters),
    queryFn: async () => {
      const response = await api.meetings.list(filters)
      return response.data
    },
  })
}

export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: async () => {
      const response = await api.meetings.get(meetingId)
      return response.data
    },
    enabled: !!meetingId,
  })
}

export function useMeetingTasks(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.tasks(meetingId),
    queryFn: async () => {
      const response = await api.meetings.getTasks(meetingId)
      return response.data
    },
    enabled: !!meetingId,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMeetingInput) => api.meetings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateMeetingInput }) =>
      api.meetings.update(meetingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(variables.meetingId) })
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meetingId: string) => api.meetings.delete(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useParseMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meetingId: string) => api.meetings.parse(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) })
      queryClient.invalidateQueries({ queryKey: meetingKeys.tasks(meetingId) })
    },
  })
}

export function useReparseMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meetingId: string) => api.meetings.reparse(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) })
      queryClient.invalidateQueries({ queryKey: meetingKeys.tasks(meetingId) })
    },
  })
}
