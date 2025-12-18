'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Button, Input } from '@/components/ui'
import { useCreateProject } from '@/hooks'
import { createProjectSchema, type CreateProjectInput } from '@/schemas'
import type { CreateProjectModalProps } from './CreateProjectModal.types'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const createProject = useCreateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      githubRepoUrl: '',
      name: '',
      description: '',
      preferredBranch: 'main',
    },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      await createProject.mutateAsync(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="GitHub Repository URL"
          placeholder="https://github.com/owner/repo"
          error={errors.githubRepoUrl?.message}
          {...register('githubRepoUrl')}
        />

        <Input
          label="Project Name"
          placeholder="My Awesome Project"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Description"
          placeholder="Brief description of your project (optional)"
          error={errors.description?.message}
          {...register('description')}
        />

        <Input
          label="Preferred Branch"
          placeholder="main"
          hint="The branch to use for indexing and analysis"
          error={errors.preferredBranch?.message}
          {...register('preferredBranch')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || createProject.isPending}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
