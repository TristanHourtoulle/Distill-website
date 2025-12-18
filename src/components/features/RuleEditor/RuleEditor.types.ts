import type { ProjectRule } from '@/types'

export type RuleType = ProjectRule['type']

export interface RuleFormData {
  type: RuleType
  content: string
  priority: number
  isActive: boolean
}

export interface RuleEditorProps {
  rules: ProjectRule[]
  onAdd: (rule: RuleFormData) => void
  onUpdate: (ruleId: string, rule: Partial<RuleFormData>) => void
  onDelete: (ruleId: string) => void
  onReorder?: (ruleIds: string[]) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export interface RuleItemProps {
  rule: ProjectRule
  onUpdate: (rule: Partial<RuleFormData>) => void
  onDelete: () => void
  disabled?: boolean
}

export interface RuleFormProps {
  onSubmit: (rule: RuleFormData) => void
  onCancel: () => void
  initialData?: Partial<RuleFormData>
  isEdit?: boolean
}
