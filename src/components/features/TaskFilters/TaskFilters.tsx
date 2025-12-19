'use client'

import { useMemo } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, Input, Select } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TaskFiltersProps, TaskFiltersState } from './TaskFilters.types'
import type { TaskStatus, TaskComplexity, TaskType } from '@/types'

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'exported', label: 'Exported' },
  { value: 'archived', label: 'Archived' },
]

const complexityOptions = [
  { value: 'all', label: 'All Complexities' },
  { value: 'simple', label: 'Simple' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'critical', label: 'Critical' },
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'feature', label: 'Feature' },
  { value: 'bugfix', label: 'Bug Fix' },
  { value: 'modification', label: 'Modification' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'refactor', label: 'Refactor' },
]

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
]

export function TaskFilters({
  filters,
  onFiltersChange,
  projects,
  meetings,
  isLoadingProjects,
  isLoadingMeetings,
  className,
}: TaskFiltersProps) {
  // Build project options
  const projectOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Projects' }]
    if (projects) {
      projects.forEach((p) => {
        options.push({ value: p.id, label: p.name || p.githubRepoName })
      })
    }
    return options
  }, [projects])

  // Build meeting options filtered by selected project
  const meetingOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Meetings' }]
    if (meetings) {
      const filteredMeetings = filters.projectId === 'all'
        ? meetings
        : meetings.filter((m) => m.projectId === filters.projectId)

      filteredMeetings.forEach((m) => {
        options.push({ value: m.id, label: m.title })
      })
    }
    return options
  }, [meetings, filters.projectId])

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.complexity !== 'all' ||
      filters.type !== 'all' ||
      filters.projectId !== 'all' ||
      filters.meetingId !== 'all' ||
      filters.dateRange !== 'all'
    )
  }, [filters])

  const handleChange = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }

    // Reset meeting filter when project changes
    if (key === 'projectId' && value !== filters.projectId) {
      newFilters.meetingId = 'all'
    }

    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      complexity: 'all',
      type: 'all',
      projectId: 'all',
      meetingId: 'all',
      dateRange: 'all',
    })
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        {/* Header with filter icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>

        {/* Search input */}
        <Input
          placeholder="Search tasks by title or description..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />

        {/* Filter grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Project filter */}
          <Select
            options={projectOptions}
            value={filters.projectId}
            onChange={(value) => handleChange('projectId', value)}
            placeholder={isLoadingProjects ? 'Loading...' : 'Project'}
            disabled={isLoadingProjects}
          />

          {/* Meeting filter */}
          <Select
            options={meetingOptions}
            value={filters.meetingId}
            onChange={(value) => handleChange('meetingId', value)}
            placeholder={isLoadingMeetings ? 'Loading...' : 'Meeting'}
            disabled={isLoadingMeetings || meetingOptions.length <= 1}
          />

          {/* Status filter */}
          <Select
            options={statusOptions}
            value={filters.status}
            onChange={(value) => handleChange('status', value as TaskStatus | 'all')}
            placeholder="Status"
          />

          {/* Complexity filter */}
          <Select
            options={complexityOptions}
            value={filters.complexity}
            onChange={(value) => handleChange('complexity', value as TaskComplexity | 'all')}
            placeholder="Complexity"
          />

          {/* Type filter */}
          <Select
            options={typeOptions}
            value={filters.type}
            onChange={(value) => handleChange('type', value as TaskType | 'all')}
            placeholder="Type"
          />

          {/* Date range filter */}
          <Select
            options={dateRangeOptions}
            value={filters.dateRange}
            onChange={(value) => handleChange('dateRange', value as TaskFiltersState['dateRange'])}
            placeholder="Date"
          />
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-text-muted">Active:</span>
            {filters.search && (
              <FilterTag
                label={`"${filters.search}"`}
                onRemove={() => handleChange('search', '')}
              />
            )}
            {filters.projectId !== 'all' && (
              <FilterTag
                label={projectOptions.find((p) => p.value === filters.projectId)?.label || 'Project'}
                onRemove={() => handleChange('projectId', 'all')}
              />
            )}
            {filters.meetingId !== 'all' && (
              <FilterTag
                label={meetingOptions.find((m) => m.value === filters.meetingId)?.label || 'Meeting'}
                onRemove={() => handleChange('meetingId', 'all')}
              />
            )}
            {filters.status !== 'all' && (
              <FilterTag
                label={statusOptions.find((s) => s.value === filters.status)?.label || 'Status'}
                onRemove={() => handleChange('status', 'all')}
              />
            )}
            {filters.complexity !== 'all' && (
              <FilterTag
                label={complexityOptions.find((c) => c.value === filters.complexity)?.label || 'Complexity'}
                onRemove={() => handleChange('complexity', 'all')}
              />
            )}
            {filters.type !== 'all' && (
              <FilterTag
                label={typeOptions.find((t) => t.value === filters.type)?.label || 'Type'}
                onRemove={() => handleChange('type', 'all')}
              />
            )}
            {filters.dateRange !== 'all' && (
              <FilterTag
                label={dateRangeOptions.find((d) => d.value === filters.dateRange)?.label || 'Date'}
                onRemove={() => handleChange('dateRange', 'all')}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-md">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <XMarkIcon className="h-3 w-3" />
      </button>
    </span>
  )
}
