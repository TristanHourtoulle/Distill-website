'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { Button, Card, CardContent, Spinner } from '@/components/ui'
import { MeetingCard, CreateMeetingModal } from '@/components/features'
import { useMeetings, useDeleteMeeting, useParseMeeting } from '@/hooks'

export default function MeetingsPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId') || undefined

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: meetings, isLoading, error } = useMeetings({ projectId })
  const deleteMeeting = useDeleteMeeting()
  const parseMeeting = useParseMeeting()

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      try {
        await deleteMeeting.mutateAsync(meetingId)
      } catch (error) {
        console.error('Failed to delete meeting:', error)
      }
    }
  }

  const handleParseMeeting = async (meetingId: string) => {
    try {
      await parseMeeting.mutateAsync(meetingId)
    } catch (error) {
      console.error('Failed to parse meeting:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Meetings</h1>
            <p className="text-text-secondary mt-1">
              Manage your meeting notes and transcripts
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-error mb-4">Failed to load meetings</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Meetings</h1>
          <p className="text-text-secondary mt-1">
            Manage your meeting notes and transcripts
          </p>
        </div>
        <Button
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Meeting
        </Button>
      </div>

      {/* Meetings grid */}
      {meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onDelete={() => handleDeleteMeeting(meeting.id)}
              onParse={() => handleParseMeeting(meeting.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-surface-hover rounded-full mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-text font-medium mb-1">No meetings yet</h3>
              <p className="text-text-secondary text-sm mb-4">
                Add your first meeting to start extracting tasks
              </p>
              <Button
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create meeting modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
      />
    </div>
  )
}
