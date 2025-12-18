/**
 * Distill API Client
 * Centralized API client for all backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ============================================
// Types
// ============================================

export interface ApiError {
  error: string
  code?: string
}

export interface PaginationMeta {
  total: number
  limit: number
  offset: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ============================================
// Custom Error Class
// ============================================

export class ApiClientError extends Error {
  code?: string
  status: number

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

// ============================================
// Base Fetch Function
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
  })

  // Handle no content responses
  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    const error = data as ApiError
    throw new ApiClientError(
      error.error || 'An unexpected error occurred',
      response.status,
      error.code
    )
  }

  return data as T
}

// ============================================
// API Methods
// ============================================

export const api = {
  // -------------------------------------------
  // Auth
  // -------------------------------------------
  auth: {
    getSession: () =>
      fetchApi<{
        user: {
          id: string
          email: string
          name: string
          image: string
        }
        session: {
          id: string
          expiresAt: string
        }
      }>('/auth/session'),

    signInWithGitHub: (callbackURL: string) =>
      fetchApi<{ url: string }>('/auth/sign-in/social', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'github',
          callbackURL,
        }),
      }),

    signOut: () =>
      fetchApi<{ success: boolean }>('/auth/sign-out', {
        method: 'POST',
      }),
  },

  // -------------------------------------------
  // Projects
  // -------------------------------------------
  projects: {
    list: () =>
      fetchApi<
        ApiResponse<
          Array<{
            id: string
            userId: string
            githubRepoUrl: string
            githubOwner: string
            githubRepoName: string
            defaultBranch: string
            preferredBranch: string
            name: string
            description: string | null
            detectedStack: Record<string, string> | null
            status: 'pending' | 'indexing' | 'ready' | 'error'
            lastIndexedAt: string | null
            createdAt: string
            updatedAt: string
          }>
        >
      >('/projects'),

    get: (projectId: string) =>
      fetchApi<
        ApiResponse<{
          id: string
          userId: string
          githubRepoUrl: string
          githubOwner: string
          githubRepoName: string
          defaultBranch: string
          preferredBranch: string
          name: string
          description: string | null
          detectedStack: Record<string, string> | null
          structureSummary: Record<string, number> | null
          status: 'pending' | 'indexing' | 'ready' | 'error'
          lastIndexedAt: string | null
          createdAt: string
          updatedAt: string
        }>
      >(`/projects/${projectId}`),

    create: (data: {
      githubRepoUrl: string
      name: string
      description?: string
      preferredBranch: string
    }) =>
      fetchApi<
        ApiResponse<{
          id: string
          userId: string
          githubRepoUrl: string
          githubOwner: string
          githubRepoName: string
          defaultBranch: string
          preferredBranch: string
          name: string
          description: string | null
          status: 'pending'
          createdAt: string
          updatedAt: string
        }>
      >('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      projectId: string,
      data: {
        name?: string
        description?: string
        preferredBranch?: string
      }
    ) =>
      fetchApi<
        ApiResponse<{
          id: string
          name: string
          description: string | null
          preferredBranch: string
          updatedAt: string
        }>
      >(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (projectId: string) =>
      fetchApi<void>(`/projects/${projectId}`, {
        method: 'DELETE',
      }),

    getBranches: (projectId: string) =>
      fetchApi<
        ApiResponse<
          Array<{
            name: string
            commit: string
            protected: boolean
          }>
        >
      >(`/projects/${projectId}/branches`),

    getStatus: (projectId: string) =>
      fetchApi<
        ApiResponse<{
          status: string
          indexedFilesCount: number
          lastIndexedAt: string | null
          detectedStack: Record<string, string> | null
        }>
      >(`/projects/${projectId}/status`),

    getFiles: (
      projectId: string,
      params?: {
        fileType?: 'component' | 'hook' | 'api' | 'util' | 'config' | 'other'
        limit?: number
        offset?: number
      }
    ) => {
      const searchParams = new URLSearchParams()
      if (params?.fileType) searchParams.set('fileType', params.fileType)
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())
      const query = searchParams.toString()
      return fetchApi<
        PaginatedResponse<{
          id: string
          filePath: string
          fileType: string
          exports: string[]
          imports: string[]
          summary: string
          lineCount: number
        }>
      >(`/projects/${projectId}/files${query ? `?${query}` : ''}`)
    },

    triggerIndex: (projectId: string, priority?: 'low' | 'normal' | 'high') => {
      const query = priority ? `?priority=${priority}` : ''
      return fetchApi<ApiResponse<{ jobId: string; status: string }>>(
        `/projects/${projectId}/index${query}`,
        { method: 'POST' }
      )
    },

    getJob: (projectId: string) =>
      fetchApi<
        ApiResponse<{
          id: string
          type: string
          status: string
          progress: {
            phase: string
            current: number
            total: number
            message: string
          } | null
          createdAt: string
          startedAt: string | null
        } | null>
      >(`/projects/${projectId}/job`),

    // Rules
    getRules: (projectId: string) =>
      fetchApi<
        ApiResponse<
          Array<{
            id: string
            projectId: string
            type: 'must_do' | 'must_not_do' | 'convention' | 'pattern'
            content: string
            priority: number
            isActive: boolean
            createdAt: string
          }>
        >
      >(`/projects/${projectId}/rules`),

    createRule: (
      projectId: string,
      data: {
        type: 'must_do' | 'must_not_do' | 'convention' | 'pattern'
        content: string
        priority?: number
      }
    ) =>
      fetchApi<
        ApiResponse<{
          id: string
          projectId: string
          type: string
          content: string
          priority: number
          isActive: boolean
          createdAt: string
        }>
      >(`/projects/${projectId}/rules`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateRule: (
      projectId: string,
      ruleId: string,
      data: {
        content?: string
        priority?: number
        isActive?: boolean
      }
    ) =>
      fetchApi<
        ApiResponse<{
          id: string
          content: string
          priority: number
          isActive: boolean
        }>
      >(`/projects/${projectId}/rules/${ruleId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteRule: (projectId: string, ruleId: string) =>
      fetchApi<void>(`/projects/${projectId}/rules/${ruleId}`, {
        method: 'DELETE',
      }),
  },

  // -------------------------------------------
  // Meetings
  // -------------------------------------------
  meetings: {
    list: (params?: {
      projectId?: string
      status?: 'pending' | 'processing' | 'completed' | 'error'
      limit?: number
      offset?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.projectId) searchParams.set('projectId', params.projectId)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())
      const query = searchParams.toString()
      return fetchApi<
        PaginatedResponse<{
          id: string
          projectId: string
          title: string
          rawContent: string
          parsedSummary: string | null
          referenceBranch: string
          source: 'paste' | 'upload' | 'webhook'
          metadata: Record<string, unknown> | null
          status: 'pending' | 'processing' | 'completed' | 'error'
          meetingDate: string | null
          createdAt: string
        }>
      >(`/meetings${query ? `?${query}` : ''}`)
    },

    get: (meetingId: string) =>
      fetchApi<
        ApiResponse<{
          id: string
          projectId: string
          title: string
          rawContent: string
          parsedSummary: string | null
          referenceBranch: string
          source: string
          metadata: Record<string, unknown> | null
          status: string
          meetingDate: string | null
          createdAt: string
          tasks: Array<{
            id: string
            title: string
            description: string
            type: string
            complexity: string
            status: string
          }>
        }>
      >(`/meetings/${meetingId}`),

    create: (data: {
      projectId: string
      title: string
      rawContent: string
      referenceBranch: string
      source?: 'paste' | 'upload' | 'webhook'
      metadata?: Record<string, unknown>
      meetingDate?: string
    }) =>
      fetchApi<
        ApiResponse<{
          id: string
          projectId: string
          title: string
          rawContent: string
          referenceBranch: string
          source: string
          status: 'pending'
          createdAt: string
        }>
      >('/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      meetingId: string,
      data: {
        title?: string
        rawContent?: string
        referenceBranch?: string
        metadata?: Record<string, unknown>
        meetingDate?: string
        status?: 'pending' | 'processing' | 'completed' | 'error'
      }
    ) =>
      fetchApi<
        ApiResponse<{
          id: string
          title: string
          status: string
          updatedAt: string
        }>
      >(`/meetings/${meetingId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (meetingId: string) =>
      fetchApi<void>(`/meetings/${meetingId}`, {
        method: 'DELETE',
      }),

    getTasks: (meetingId: string) =>
      fetchApi<
        ApiResponse<
          Array<{
            id: string
            title: string
            description: string
            type: string
            complexity: string
            status: string
            priority: number
          }>
        >
      >(`/meetings/${meetingId}/tasks`),

    parse: (meetingId: string) =>
      fetchApi<
        ApiResponse<{
          summary: string
          tasksCount: number
          metadata: Record<string, unknown>
          tokensUsed: number
        }>
      >(`/meetings/${meetingId}/parse`, { method: 'POST' }),

    reparse: (meetingId: string) =>
      fetchApi<
        ApiResponse<{
          summary: string
          tasksCount: number
          metadata: Record<string, unknown>
          tokensUsed: number
        }>
      >(`/meetings/${meetingId}/reparse`, { method: 'POST' }),
  },

  // -------------------------------------------
  // Tasks
  // -------------------------------------------
  tasks: {
    list: (params?: {
      projectId?: string
      meetingId?: string
      status?: 'pending' | 'analyzing' | 'analyzed' | 'exported' | 'archived'
      complexity?: 'simple' | 'moderate' | 'critical'
      type?: 'feature' | 'bugfix' | 'modification' | 'documentation' | 'refactor'
      limit?: number
      offset?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.projectId) searchParams.set('projectId', params.projectId)
      if (params?.meetingId) searchParams.set('meetingId', params.meetingId)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.complexity) searchParams.set('complexity', params.complexity)
      if (params?.type) searchParams.set('type', params.type)
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())
      const query = searchParams.toString()
      return fetchApi<
        PaginatedResponse<{
          id: string
          meetingId: string
          projectId: string
          title: string
          description: string
          type: 'feature' | 'bugfix' | 'modification' | 'documentation' | 'refactor'
          complexity: 'simple' | 'moderate' | 'critical'
          status: 'pending' | 'analyzing' | 'analyzed' | 'exported' | 'archived'
          impactedFilesPreview: string[]
          estimatedFilesCount: number
          priority: number
          createdAt: string
          updatedAt: string
        }>
      >(`/tasks${query ? `?${query}` : ''}`)
    },

    get: (taskId: string) =>
      fetchApi<
        ApiResponse<{
          id: string
          meetingId: string
          projectId: string
          title: string
          description: string
          type: string
          complexity: string
          status: string
          impactedFilesPreview: string[]
          estimatedFilesCount: number
          priority: number
          createdAt: string
          updatedAt: string
          analyses: Array<{
            id: string
            status: string
            startedAt: string
            completedAt: string | null
          }>
          exports: Array<{
            id: string
            status: string
            externalUrl: string | null
          }>
        }>
      >(`/tasks/${taskId}`),

    update: (
      taskId: string,
      data: {
        title?: string
        description?: string
        type?: 'feature' | 'bugfix' | 'modification' | 'documentation' | 'refactor'
        complexity?: 'simple' | 'moderate' | 'critical'
        status?: 'pending' | 'analyzing' | 'analyzed' | 'exported' | 'archived'
        priority?: number
        estimatedFilesCount?: number
        impactedFilesPreview?: string[]
      }
    ) =>
      fetchApi<
        ApiResponse<{
          id: string
          title: string
          complexity: string
          priority: number
          updatedAt: string
        }>
      >(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (taskId: string) =>
      fetchApi<void>(`/tasks/${taskId}`, {
        method: 'DELETE',
      }),

    bulkUpdateStatus: (
      taskIds: string[],
      status: 'pending' | 'analyzing' | 'analyzed' | 'exported' | 'archived'
    ) =>
      fetchApi<ApiResponse<{ updated: number }>>('/tasks/bulk/status', {
        method: 'POST',
        body: JSON.stringify({ taskIds, status }),
      }),

    estimate: (taskId: string) =>
      fetchApi<
        ApiResponse<{
          complexity: 'simple' | 'moderate' | 'critical'
          score: number
          factors: Record<string, number>
          reasoning: string
        }>
      >(`/tasks/${taskId}/estimate`, { method: 'POST' }),

    getStats: (projectId: string) =>
      fetchApi<
        ApiResponse<{
          total: number
          byStatus: Record<string, number>
          byType: Record<string, number>
          byComplexity: Record<string, number>
        }>
      >(`/tasks/stats/${projectId}`),

    getComplexity: (projectId: string) =>
      fetchApi<
        ApiResponse<{
          distribution: Record<string, number>
          averageScore: number
          totalTasks: number
        }>
      >(`/tasks/complexity/${projectId}`),
  },
}
