import { z } from 'zod'

export const createProjectSchema = z.object({
  githubRepoUrl: z
    .string()
    .min(1, 'Repository URL is required')
    .url('Must be a valid URL')
    .regex(
      /^https:\/\/github\.com\/[^/]+\/[^/]+$/,
      'Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)'
    ),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  preferredBranch: z
    .string()
    .min(1, 'Preferred branch is required'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  preferredBranch: z.string().min(1).optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
