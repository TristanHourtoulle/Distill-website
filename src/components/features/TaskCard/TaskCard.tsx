'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TaskCardProps } from './TaskCard.types'
import type { TaskStatus, TaskType, TaskComplexity } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'default', icon: ClockIcon },
  analyzing: { label: 'Analyzing', color: 'warning', icon: ArrowPathIcon },
  analyzed: { label: 'Analyzed', color: 'success', icon: CheckCircleIcon },
  exported: { label: 'Exported', color: 'success', icon: ArrowUpTrayIcon },
  archived: { label: 'Archived', color: 'default', icon: ArchiveBoxIcon },
}

const typeConfig: Record<TaskType, { label: string; color: 'task-feature' | 'task-bugfix' | 'task-modification' | 'task-documentation' | 'task-refactor' }> = {
  feature: { label: 'Feature', color: 'task-feature' },
  bugfix: { label: 'Bug Fix', color: 'task-bugfix' },
  modification: { label: 'Modification', color: 'task-modification' },
  documentation: { label: 'Docs', color: 'task-documentation' },
  refactor: { label: 'Refactor', color: 'task-refactor' },
}

const complexityConfig: Record<TaskComplexity, { label: string; color: 'complexity-simple' | 'complexity-moderate' | 'complexity-critical' }> = {
  simple: { label: 'Simple', color: 'complexity-simple' },
  moderate: { label: 'Moderate', color: 'complexity-moderate' },
  critical: { label: 'Critical', color: 'complexity-critical' },
}

export function TaskCard({ task, onClick, onDelete, onStatusChange, className }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const status = statusConfig[task.status]
  const type = typeConfig[task.type]
  const complexity = complexityConfig[task.complexity]
  const StatusIcon = status.icon

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-success/10 rounded-lg shrink-0">
              <ClipboardDocumentListIcon className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text truncate">{task.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={type.color} size="sm">
                  {type.label}
                </Badge>
                <Badge variant={complexity.color} size="sm">
                  {complexity.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Menu button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-hover opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Task options"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg py-1 z-10">
                {onStatusChange && task.status !== 'archived' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onStatusChange('archived')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    <ArchiveBoxIcon className="h-4 w-4" />
                    Archive
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onDelete()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-surface-hover transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2">
          {task.description}
        </p>

        {/* Impacted files preview */}
        {task.impactedFilesPreview.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            <span>
              {task.estimatedFilesCount} file{task.estimatedFilesCount !== 1 ? 's' : ''} impacted
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant={status.color} size="sm">
            <StatusIcon className={cn(
              'h-3 w-3 mr-1',
              task.status === 'analyzing' && 'animate-spin'
            )} />
            {status.label}
          </Badge>

          <span className="text-xs text-text-muted">
            Priority: {task.priority}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
