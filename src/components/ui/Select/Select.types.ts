export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  name?: string
}
