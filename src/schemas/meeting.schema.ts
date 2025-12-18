import { z } from 'zod'

export const createMeetingSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  rawContent: z
    .string()
    .min(10, 'Meeting content must be at least 10 characters')
    .max(50000, 'Meeting content is too long'),
  referenceBranch: z.string().min(1, 'Reference branch is required'),
  source: z.enum(['paste', 'upload', 'webhook']),
  meetingDate: z.string().optional(),
})

export type CreateMeetingFormInput = z.infer<typeof createMeetingSchema>

export const updateMeetingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  rawContent: z
    .string()
    .min(10, 'Meeting content must be at least 10 characters')
    .max(50000, 'Meeting content is too long')
    .optional(),
  referenceBranch: z.string().min(1).optional(),
  meetingDate: z.string().optional(),
})

export type UpdateMeetingFormInput = z.infer<typeof updateMeetingSchema>
