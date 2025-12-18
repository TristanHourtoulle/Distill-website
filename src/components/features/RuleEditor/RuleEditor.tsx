'use client'

import { useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  Bars3Icon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import type {
  RuleEditorProps,
  RuleItemProps,
  RuleFormProps,
  RuleType,
  RuleFormData,
} from './RuleEditor.types'

const ruleTypeConfig: Record<
  RuleType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  must_do: {
    label: 'Must Do',
    icon: CheckCircleIcon,
    color: 'text-success',
  },
  must_not_do: {
    label: 'Must Not Do',
    icon: ExclamationCircleIcon,
    color: 'text-error',
  },
  convention: {
    label: 'Convention',
    icon: DocumentTextIcon,
    color: 'text-primary',
  },
  pattern: {
    label: 'Pattern',
    icon: ArrowPathIcon,
    color: 'text-accent',
  },
}

function RuleForm({ onSubmit, onCancel, initialData, isEdit }: RuleFormProps) {
  const [type, setType] = useState<RuleType>(initialData?.type ?? 'must_do')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [priority, setPriority] = useState(initialData?.priority ?? 0)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit({ type, content: content.trim(), priority, isActive })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            Rule Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ruleTypeConfig) as RuleType[]).map((ruleType) => {
              const config = ruleTypeConfig[ruleType]
              const Icon = config.icon
              return (
                <button
                  key={ruleType}
                  type="button"
                  onClick={() => setType(ruleType)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                    type === ruleType
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface hover:bg-surface-hover'
                  )}
                >
                  <Icon className={cn('h-4 w-4', config.color)} />
                  <span>{config.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Input
            label="Priority"
            type="number"
            min={0}
            max={100}
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            hint="Higher priority rules are applied first"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Rule Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the rule..."
          rows={3}
          className={cn(
            'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'placeholder:text-text-muted',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50',
            'resize-none'
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isActive ? 'bg-primary' : 'bg-border-strong'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isActive ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-sm text-text-secondary">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!content.trim()}>
          {isEdit ? 'Update Rule' : 'Add Rule'}
        </Button>
      </div>
    </form>
  )
}

function RuleItem({ rule, onUpdate, onDelete, disabled }: RuleItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const config = ruleTypeConfig[rule.type]
  const Icon = config.icon

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <RuleForm
            initialData={{
              type: rule.type,
              content: rule.content,
              priority: rule.priority,
              isActive: rule.isActive,
            }}
            isEdit
            onSubmit={(data) => {
              onUpdate(data)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'transition-opacity',
        !rule.isActive && 'opacity-50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Bars3Icon className="h-4 w-4 cursor-grab text-text-muted" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className="text-sm font-medium text-text">
                {config.label}
              </span>
              <span className="rounded bg-surface-hover px-1.5 py-0.5 text-xs text-text-muted">
                Priority: {rule.priority}
              </span>
              {!rule.isActive && (
                <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{rule.content}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdate({ isActive: !rule.isActive })}
              disabled={disabled}
              className={cn(
                'rounded p-1.5 transition-colors',
                'text-text-muted hover:bg-surface-hover hover:text-text',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                disabled && 'pointer-events-none opacity-50'
              )}
              aria-label={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
            >
              {rule.isActive ? (
                <CheckIcon className="h-4 w-4 text-success" />
              ) : (
                <XMarkIcon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={disabled}
              className={cn(
                'rounded p-1.5 transition-colors',
                'text-text-muted hover:bg-surface-hover hover:text-text',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                disabled && 'pointer-events-none opacity-50'
              )}
              aria-label="Edit rule"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className={cn(
                'rounded p-1.5 transition-colors',
                'text-text-muted hover:bg-error/10 hover:text-error',
                'focus:outline-none focus:ring-2 focus:ring-error/50',
                disabled && 'pointer-events-none opacity-50'
              )}
              aria-label="Delete rule"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RuleEditor({
  rules,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
  disabled = false,
  className,
}: RuleEditorProps) {
  const [isAdding, setIsAdding] = useState(false)

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Project Rules</h3>
          <p className="text-sm text-text-muted">
            Define rules to guide code generation
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            disabled={disabled || isLoading}
            size="sm"
          >
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Add Rule
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-4">
            <RuleForm
              onSubmit={(data) => {
                onAdd(data)
                setIsAdding(false)
              }}
              onCancel={() => setIsAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {sortedRules.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DocumentTextIcon className="mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No rules defined yet</p>
            <p className="text-sm text-text-muted">
              Add rules to guide the AI during code analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedRules.map((rule) => (
            <RuleItem
              key={rule.id}
              rule={rule}
              onUpdate={(data) => onUpdate(rule.id, data)}
              onDelete={() => onDelete(rule.id)}
              disabled={disabled || isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
