'use client'

import { useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from './useTasks'
import { analysisKeys } from './useTaskAnalysis'
import type {
  StreamEvent,
  AnalysisStreamState,
  AnalysisStreamOptions,
  ToolHistoryItem,
  DiscoveredFile,
  ResultEvent,
  ErrorEvent,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const initialState: AnalysisStreamState = {
  phase: 'idle',
  message: '',
  progress: {
    iteration: 0,
    toolCalls: 0,
    tokensUsed: { input: 0, output: 0 },
    durationMs: 0,
  },
  toolHistory: [],
  filesDiscovered: [],
  thinkingContent: '',
  result: null,
  error: null,
  isLoading: false,
  analysisId: null,
}

export function useAnalysisStream(options: AnalysisStreamOptions = {}) {
  const [state, setState] = useState<AnalysisStreamState>(initialState)
  const abortControllerRef = useRef<AbortController | null>(null)
  const queryClient = useQueryClient()

  const processEvent = useCallback((event: StreamEvent) => {
    options.onEvent?.(event)

    switch (event.type) {
      case 'phase':
        setState((prev) => ({
          ...prev,
          phase: event.phase,
          message: event.message,
          analysisId: event.analysisId || prev.analysisId,
        }))
        break

      case 'tool_call':
        setState((prev) => ({
          ...prev,
          toolHistory: [
            ...prev.toolHistory,
            {
              tool: event.tool,
              description: event.description,
              input: event.input,
              timestamp: event.timestamp,
            } as ToolHistoryItem,
          ],
        }))
        break

      case 'tool_result':
        setState((prev) => ({
          ...prev,
          toolHistory: prev.toolHistory.map((t, i) =>
            i === prev.toolHistory.length - 1
              ? {
                  ...t,
                  result: event.summary,
                  success: event.success,
                  durationMs: event.durationMs,
                }
              : t
          ),
        }))
        break

      case 'thinking':
        if (options.includeThinking) {
          setState((prev) => ({
            ...prev,
            thinkingContent: event.isPartial
              ? prev.thinkingContent + event.content
              : event.content,
          }))
        }
        break

      case 'progress':
        setState((prev) => ({
          ...prev,
          progress: {
            iteration: event.iteration,
            toolCalls: event.toolCalls,
            tokensUsed: event.tokensUsed,
            durationMs: event.durationMs,
          },
        }))
        break

      case 'file_discovered':
        setState((prev) => ({
          ...prev,
          filesDiscovered: [
            ...prev.filesDiscovered,
            {
              action: event.action,
              path: event.path,
              description: event.description,
              timestamp: event.timestamp,
            } as DiscoveredFile,
          ],
        }))
        break

      case 'result':
        setState((prev) => ({
          ...prev,
          result: event,
          isLoading: false,
          phase: 'complete',
          analysisId: event.analysisId,
        }))
        options.onComplete?.(event)
        break

      case 'error':
        setState((prev) => ({
          ...prev,
          error: event,
          isLoading: false,
          phase: 'error',
        }))
        options.onError?.(event)
        break
    }
  }, [options])

  const parseSSELine = useCallback((line: string): { eventType: string; data: string } | null => {
    if (line.startsWith('event: ')) {
      return { eventType: line.slice(7).trim(), data: '' }
    }
    if (line.startsWith('data: ')) {
      return { eventType: '', data: line.slice(6) }
    }
    return null
  }, [])

  const startAnalysis = useCallback(async (taskId: string) => {
    // Abort any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Reset state
    setState({
      ...initialState,
      isLoading: true,
      phase: 'initializing',
      message: 'Starting analysis...',
    })

    // Create new abort controller
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Build URL with query params
    const params = new URLSearchParams()
    if (options.includeToolResults === false) params.set('includeToolResults', 'false')
    if (options.includeThinking) params.set('includeThinking', 'true')

    const url = `${API_BASE_URL}/api/agent/analyze/${taskId}/stream${params.toString() ? `?${params}` : ''}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let currentEventType = ''
      let currentEventData = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          // Skip keep-alive comments
          if (line.startsWith(':')) continue

          // Empty line means end of event
          if (line === '') {
            if (currentEventType && currentEventData) {
              try {
                const event = JSON.parse(currentEventData) as StreamEvent
                processEvent(event)
              } catch (e) {
                console.error('Failed to parse SSE event:', e)
              }
            }
            currentEventType = ''
            currentEventData = ''
            continue
          }

          // Parse event or data line
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            currentEventData = line.slice(6)
          }
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: analysisKeys.latest(taskId) })
      queryClient.invalidateQueries({ queryKey: analysisKeys.history(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled, don't show error
        setState((prev) => ({
          ...prev,
          isLoading: false,
          phase: 'idle',
          message: 'Analysis cancelled',
        }))
        return
      }

      const errorEvent: ErrorEvent = {
        type: 'error',
        timestamp: Date.now(),
        code: 'CONNECTION_ERROR',
        message: (error as Error).message || 'Connection failed',
        recoverable: true,
      }

      setState((prev) => ({
        ...prev,
        error: errorEvent,
        isLoading: false,
        phase: 'error',
      }))
      options.onError?.(errorEvent)
    }
  }, [options, processEvent, queryClient])

  const stopAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }))
  }, [])

  const reset = useCallback(() => {
    stopAnalysis()
    setState(initialState)
  }, [stopAnalysis])

  return {
    ...state,
    startAnalysis,
    stopAnalysis,
    reset,
  }
}
