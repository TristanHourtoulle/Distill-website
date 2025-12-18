export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    // Complexity variants
    | 'complexity-simple'
    | 'complexity-moderate'
    | 'complexity-critical'
    // Task type variants
    | 'task-feature'
    | 'task-bugfix'
    | 'task-modification'
    | 'task-documentation'
    | 'task-refactor'
  size?: 'sm' | 'md'
}
