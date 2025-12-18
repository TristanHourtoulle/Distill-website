'use client'

import {
  FolderIcon,
  CodeBracketIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ProjectCardProps } from './ProjectCard.types'
import type { ProjectStatus } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'default', icon: ClockIcon },
  indexing: { label: 'Indexing', color: 'warning', icon: ArrowPathIcon },
  ready: { label: 'Ready', color: 'success', icon: CheckCircleIcon },
  error: { label: 'Error', color: 'error', icon: ExclamationCircleIcon },
}

export function ProjectCard({ project, onClick, onDelete, className }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const status = statusConfig[project.status]
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

  // Format last indexed date
  const lastIndexed = project.lastIndexedAt
    ? new Date(project.lastIndexedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never'

  // Get stack badges (show first 3)
  const stackItems = project.detectedStack
    ? Object.entries(project.detectedStack).slice(0, 3)
    : []

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text truncate">{project.name}</h3>
              <p className="text-sm text-text-muted truncate">
                {project.githubOwner}/{project.githubRepoName}
              </p>
            </div>
          </div>

          {/* Menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-hover opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Project options"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg py-1 z-10">
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
        {project.description && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stack badges */}
        {stackItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stackItems.map(([key, value]) => (
              <Badge key={key} variant="default" size="sm">
                {value}
              </Badge>
            ))}
            {Object.keys(project.detectedStack || {}).length > 3 && (
              <Badge variant="default" size="sm">
                +{Object.keys(project.detectedStack || {}).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Badge variant={status.color} size="sm">
              <StatusIcon className={cn(
                'h-3 w-3 mr-1',
                project.status === 'indexing' && 'animate-spin'
              )} />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <CodeBracketIcon className="h-3.5 w-3.5" />
            <span>{project.preferredBranch}</span>
          </div>
        </div>

        {/* Last indexed */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <ClockIcon className="h-3.5 w-3.5" />
          <span>Last indexed: {lastIndexed}</span>
        </div>
      </CardContent>
    </Card>
  )
}
