'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CodeBracketIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, CardHeader, CardContent, Badge, Spinner } from '@/components/ui'
import { useProject, useTriggerProjectIndex } from '@/hooks'
import type { ProjectStatus } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'default', icon: ClockIcon },
  indexing: { label: 'Indexing', color: 'warning', icon: ArrowPathIcon },
  ready: { label: 'Ready', color: 'success', icon: CheckCircleIcon },
  error: { label: 'Error', color: 'error', icon: ExclamationCircleIcon },
}

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params)
  const router = useRouter()
  const { data: project, isLoading, error } = useProject(projectId)
  const triggerIndex = useTriggerProjectIndex()

  const handleTriggerIndex = async () => {
    try {
      await triggerIndex.mutateAsync({ projectId, priority: 'normal' })
    } catch (error) {
      console.error('Failed to trigger indexing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          onClick={() => router.push('/projects')}
        >
          Back to Projects
        </Button>

        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-error mb-4">Failed to load project</p>
              <Button variant="secondary" onClick={() => router.push('/projects')}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  const lastIndexed = project.lastIndexedAt
    ? new Date(project.lastIndexedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
        onClick={() => router.push('/projects')}
      >
        Back to Projects
      </Button>

      {/* Project header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FolderIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text">{project.name}</h1>
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              {project.githubOwner}/{project.githubRepoName}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<ArrowPathIcon className={`h-4 w-4 ${triggerIndex.isPending ? 'animate-spin' : ''}`} />}
            onClick={handleTriggerIndex}
            disabled={triggerIndex.isPending || project.status === 'indexing'}
          >
            {project.status === 'indexing' ? 'Indexing...' : 'Re-index'}
          </Button>
          <Button variant="ghost" leftIcon={<Cog6ToothIcon className="h-4 w-4" />}>
            Settings
          </Button>
        </div>
      </div>

      {/* Status and info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status card */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              status.color === 'success' ? 'bg-success/10' :
              status.color === 'warning' ? 'bg-warning/10' :
              status.color === 'error' ? 'bg-error/10' :
              'bg-surface-hover'
            }`}>
              <StatusIcon className={`h-6 w-6 ${
                status.color === 'success' ? 'text-success' :
                status.color === 'warning' ? 'text-warning' :
                status.color === 'error' ? 'text-error' :
                'text-text-muted'
              } ${project.status === 'indexing' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <p className="text-lg font-semibold text-text">{status.label}</p>
            </div>
          </CardContent>
        </Card>

        {/* Branch card */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CodeBracketIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Branch</p>
              <p className="text-lg font-semibold text-text">{project.preferredBranch}</p>
            </div>
          </CardContent>
        </Card>

        {/* Last indexed card */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <ClockIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Last Indexed</p>
              <p className="text-lg font-semibold text-text">{lastIndexed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text">Description</h2>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Detected stack */}
      {project.detectedStack && Object.keys(project.detectedStack).length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text">Detected Stack</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.detectedStack).map(([key, value]) => (
                <Badge key={key} variant="default" size="md">
                  {value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Structure summary */}
      {project.structureSummary && Object.keys(project.structureSummary).length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text">File Structure</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(project.structureSummary).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-lg font-semibold text-text">{count}</p>
                    <p className="text-sm text-text-secondary capitalize">{type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/meetings?projectId=${projectId}`)}
            >
              View Meetings
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/tasks?projectId=${projectId}`)}
            >
              View Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
