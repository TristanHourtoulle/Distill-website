'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline'
import { Button, Card, CardContent, Spinner } from '@/components/ui'
import { ProjectCard, CreateProjectModal } from '@/components/features'
import { useProjects, useDeleteProject } from '@/hooks'

export default function ProjectsPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: projects, isLoading, error } = useProjects()
  const deleteProject = useDeleteProject()

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject.mutateAsync(projectId)
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Projects</h1>
            <p className="text-text-secondary mt-1">
              Manage your GitHub repositories
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-error mb-4">Failed to load projects</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
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
          <h1 className="text-2xl font-semibold text-text">Projects</h1>
          <p className="text-text-secondary mt-1">
            Manage your GitHub repositories
          </p>
        </div>
        <Button
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Projects grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-surface-hover rounded-full mb-4">
                <FolderIcon className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-text font-medium mb-1">No projects yet</h3>
              <p className="text-text-secondary text-sm mb-4">
                Connect your first GitHub repository to get started
              </p>
              <Button
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
