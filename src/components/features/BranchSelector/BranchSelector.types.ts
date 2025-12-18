import type { ProjectBranch } from '@/types'

export interface BranchSelectorProps {
  branches: ProjectBranch[]
  selectedBranch?: string
  defaultBranch?: string
  onChange: (branchName: string) => void
  isLoading?: boolean
  disabled?: boolean
  label?: string
  error?: string
  className?: string
}
