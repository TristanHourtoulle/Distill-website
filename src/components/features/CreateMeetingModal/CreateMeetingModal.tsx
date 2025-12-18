'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Button, Input } from '@/components/ui'
import { useCreateMeeting, useProjects } from '@/hooks'
import { createMeetingSchema, type CreateMeetingFormInput } from '@/schemas'
import type { CreateMeetingModalProps } from './CreateMeetingModal.types'

export function CreateMeetingModal({ isOpen, onClose, projectId, onSuccess }: CreateMeetingModalProps) {
  const createMeeting = useCreateMeeting()
  const { data: projects } = useProjects()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingFormInput>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      projectId: projectId || '',
      title: '',
      rawContent: '',
      referenceBranch: 'main',
      source: 'paste',
      meetingDate: new Date().toISOString().split('T')[0],
    },
  })

  const selectedProjectId = watch('projectId')
  const selectedProject = projects?.find(p => p.id === selectedProjectId)

  const onSubmit = async (data: CreateMeetingFormInput) => {
    try {
      await createMeeting.mutateAsync(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Meeting" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project selector */}
        {!projectId && (
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Project
            </label>
            <select
              {...register('projectId')}
              className="w-full h-10 px-3 bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="">Select a project</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-sm text-error mt-1">{errors.projectId.message}</p>
            )}
          </div>
        )}

        <Input
          label="Title"
          placeholder="Weekly Sprint Review"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Reference Branch"
          placeholder={selectedProject?.preferredBranch || 'main'}
          hint="The branch to use for code analysis"
          error={errors.referenceBranch?.message}
          {...register('referenceBranch')}
        />

        <Input
          label="Meeting Date"
          type="date"
          error={errors.meetingDate?.message}
          {...register('meetingDate')}
        />

        {/* Raw content textarea */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Meeting Notes / Transcript
          </label>
          <textarea
            {...register('rawContent')}
            rows={8}
            placeholder="Paste your meeting notes, transcript, or summary here..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
          {errors.rawContent && (
            <p className="text-sm text-error mt-1">{errors.rawContent.message}</p>
          )}
          <p className="text-xs text-text-muted mt-1">
            The AI will analyze this content and extract actionable tasks
          </p>
        </div>

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
            isLoading={isSubmitting || createMeeting.isPending}
          >
            Create Meeting
          </Button>
        </div>
      </form>
    </Modal>
  )
}
