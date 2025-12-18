export type ProjectStatus = 'pending' | 'indexing' | 'ready' | 'error'

export interface Project {
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
  structureSummary?: Record<string, number> | null
  status: ProjectStatus
  lastIndexedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectBranch {
  name: string
  commit: string
  protected: boolean
}

export interface ProjectRule {
  id: string
  projectId: string
  type: 'must_do' | 'must_not_do' | 'convention' | 'pattern'
  content: string
  priority: number
  isActive: boolean
  createdAt: string
}

export interface CreateProjectInput {
  githubRepoUrl: string
  name: string
  description?: string
  preferredBranch: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  preferredBranch?: string
}
