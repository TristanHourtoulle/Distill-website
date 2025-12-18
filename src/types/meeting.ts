export type MeetingStatus = 'pending' | 'processing' | 'completed' | 'error'
export type MeetingSource = 'paste' | 'upload' | 'webhook'

export interface Meeting {
  id: string
  projectId: string
  title: string
  rawContent: string
  parsedSummary: string | null
  referenceBranch: string
  source: MeetingSource
  metadata: Record<string, unknown> | null
  status: MeetingStatus
  meetingDate: string | null
  createdAt: string
}

export interface MeetingWithTasks extends Meeting {
  tasks: Array<{
    id: string
    title: string
    description: string
    type: string
    complexity: string
    status: string
  }>
}

export interface CreateMeetingInput {
  projectId: string
  title: string
  rawContent: string
  referenceBranch: string
  source?: MeetingSource
  metadata?: Record<string, unknown>
  meetingDate?: string
}

export interface UpdateMeetingInput {
  title?: string
  rawContent?: string
  referenceBranch?: string
  metadata?: Record<string, unknown>
  meetingDate?: string
  status?: MeetingStatus
}
