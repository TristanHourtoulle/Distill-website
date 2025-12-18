'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PlayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MeetingCardProps } from './MeetingCard.types'
import type { MeetingStatus } from '@/types'

const statusConfig: Record<MeetingStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'default', icon: ClockIcon },
  processing: { label: 'Processing', color: 'warning', icon: ArrowPathIcon },
  completed: { label: 'Completed', color: 'success', icon: CheckCircleIcon },
  error: { label: 'Error', color: 'error', icon: ExclamationCircleIcon },
}

const sourceLabels: Record<string, string> = {
  paste: 'Pasted',
  upload: 'Uploaded',
  webhook: 'Webhook',
}

export function MeetingCard({ meeting, onClick, onDelete, onParse, className }: MeetingCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const status = statusConfig[meeting.status]
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

  // Format date
  const meetingDate = meeting.meetingDate
    ? new Date(meeting.meetingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const createdAt = new Date(meeting.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  // Truncate raw content for preview
  const contentPreview = meeting.rawContent.slice(0, 150) + (meeting.rawContent.length > 150 ? '...' : '')

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
            <div className="p-2 bg-accent/10 rounded-lg shrink-0">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text truncate">{meeting.title}</h3>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{sourceLabels[meeting.source] || meeting.source}</span>
                <span>•</span>
                <span>{createdAt}</span>
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
              aria-label="Meeting options"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg py-1 z-10">
                {meeting.status === 'pending' && onParse && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onParse()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    <PlayIcon className="h-4 w-4" />
                    Parse
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

        {/* Content preview */}
        <p className="text-sm text-text-secondary line-clamp-2">
          {meeting.parsedSummary || contentPreview}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant={status.color} size="sm">
            <StatusIcon className={cn(
              'h-3 w-3 mr-1',
              meeting.status === 'processing' && 'animate-spin'
            )} />
            {status.label}
          </Badge>

          {meetingDate && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{meetingDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
